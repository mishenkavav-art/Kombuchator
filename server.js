const http = require("http");
const fs = require("fs");
const path = require("path");
const webpush = require("web-push");

const root = __dirname;
const port = Number(process.env.PORT) || 3000;
const SYNC_FILE  = path.join(__dirname, ".sync.json");
const SUBS_FILE  = path.join(__dirname, ".push-subs.json");
const VAPID_FILE = path.join(__dirname, ".vapid.json");

const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".json": "application/json; charset=utf-8",
  ".webmanifest": "application/manifest+json; charset=utf-8",
  ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
};

// ── VAPID setup ──
let vapidKeys;
try {
  vapidKeys = JSON.parse(fs.readFileSync(VAPID_FILE, "utf8"));
} catch {
  vapidKeys = webpush.generateVAPIDKeys();
  try { fs.writeFileSync(VAPID_FILE, JSON.stringify(vapidKeys)); } catch {}
}
webpush.setVapidDetails("mailto:mishenka.vav@gmail.com", vapidKeys.publicKey, vapidKeys.privateKey);

// ── Push subscriptions ──
let pushSubs = [];
try { pushSubs = JSON.parse(fs.readFileSync(SUBS_FILE, "utf8")); } catch {}
function saveSubs() {
  try { fs.writeFileSync(SUBS_FILE, JSON.stringify(pushSubs)); } catch {}
}

// ── Sync store ──
let syncStore = { batches: [], recipes: [], deletedBatchIds: [], deletedRecipeIds: [] };
try { syncStore = { ...syncStore, ...JSON.parse(fs.readFileSync(SYNC_FILE, "utf8")) }; } catch {}

function saveSyncFile() {
  try { fs.writeFileSync(SYNC_FILE, JSON.stringify(syncStore)); } catch {}
}

// ── Reminder push logic ──
const notifiedIds = new Set(
  (() => { try { return JSON.parse(fs.readFileSync(path.join(__dirname, ".notified.json"), "utf8")); } catch { return []; } })()
);
function saveNotified() {
  try { fs.writeFileSync(path.join(__dirname, ".notified.json"), JSON.stringify([...notifiedIds])); } catch {}
}

async function sendPushToOne(sub, payload) {
  try {
    console.log(`[push] → ${sub.endpoint.slice(-30)}: ${payload.title}`);
    await webpush.sendNotification(sub, JSON.stringify(payload));
  } catch (e) {
    console.log(`[push] error ${e.statusCode}: ${e.message?.slice(0, 80)}`);
    if (e.statusCode === 410 || e.statusCode === 404) {
      pushSubs = pushSubs.filter(s => s.endpoint !== sub.endpoint);
      saveSubs();
    }
  }
}

async function sendPushToAll(payload) {
  console.log(`[push] sending "${payload.title}" to ${pushSubs.length} device(s)`);
  await Promise.all(pushSubs.map(sub => sendPushToOne(sub, payload)));
}

// Send all currently-due reminders to a single new subscription (catch-up for late devices)
async function catchUpNewSub(sub) {
  const now = Date.now();
  for (const batch of (syncStore.batches || [])) {
    if (batch.finished) continue;
    for (const r of (batch.reminders || [])) {
      if (r.status !== "pending") continue;
      if (new Date(r.remindAt).getTime() > now) continue;
      await sendPushToOne(sub, { title: `Kombuchátor: ${r.title}`, body: batch.batchName, url: "/#varky" });
    }
  }
}

function checkAndSendReminders() {
  if (!pushSubs.length) return;
  const now = Date.now();
  (syncStore.batches || []).forEach(batch => {
    if (batch.finished) return;
    (batch.reminders || []).forEach(r => {
      if (r.status !== "pending") return;
      if (notifiedIds.has(r.id)) return;
      if (new Date(r.remindAt).getTime() > now) return;
      notifiedIds.add(r.id);
      saveNotified();
      sendPushToAll({
        title: `Kombuchátor: ${r.title}`,
        body:  batch.batchName,
        url:   "/#varky"
      }).catch(() => {});
    });
  });
}

// Check every minute
setInterval(checkAndSendReminders, 60000);
checkAndSendReminders();

// Server-side merge
function mergeIncoming(existing, incoming) {
  const deadBatches  = new Set([...(existing.deletedBatchIds  || []), ...(incoming.deletedBatchIds  || [])]);
  const deadRecipes  = new Set([...(existing.deletedRecipeIds || []), ...(incoming.deletedRecipeIds || [])]);

  const batchMap = new Map();
  [...(existing.batches || []), ...(incoming.batches || [])].forEach(b => {
    if (deadBatches.has(b.id)) return;
    const curr = batchMap.get(b.id);
    if (!curr) { batchMap.set(b.id, b); return; }
    const deadChecks = new Set([...(curr.deletedCheckIds || []), ...(b.deletedCheckIds || [])]);
    const checkMap = new Map([...(curr.checks || []), ...(b.checks || [])].map(c => [c.id, c]));
    for (const id of deadChecks) checkMap.delete(id);
    const remMap = new Map([...(curr.reminders || []), ...(b.reminders || [])].map(r => [r.id, r]));
    const base = (b.checks?.length ?? 0) >= (curr.checks?.length ?? 0) ? b : curr;
    batchMap.set(b.id, {
      ...base,
      checks:          [...checkMap.values()].sort((a, c) => new Date(a.checkedAt) - new Date(c.checkedAt)),
      reminders:       [...remMap.values()],
      deletedCheckIds: [...deadChecks]
    });
  });

  const recipeMap = new Map();
  [...(existing.recipes || []), ...(incoming.recipes || [])].forEach(r => {
    if (!deadRecipes.has(r.id)) recipeMap.set(r.id, r);
  });

  return {
    batches:          [...batchMap.values()],
    recipes:          [...recipeMap.values()],
    deletedBatchIds:  [...deadBatches],
    deletedRecipeIds: [...deadRecipes],
    savedAt:          new Date().toISOString()
  };
}

function parseJsonBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    req.on("data", chunk => {
      size += chunk.length;
      if (size > 4e6) { req.destroy(); return; }
      chunks.push(chunk);
    });
    req.on("end", () => {
      try { resolve(JSON.parse(Buffer.concat(chunks).toString("utf8"))); }
      catch (e) { reject(e); }
    });
    req.on("error", reject);
  });
}

function cors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Cache-Control", "no-store");
}

function send(res, status, body, type = "text/plain; charset=utf-8") {
  res.writeHead(status, { "Content-Type": type });
  res.end(body);
}

http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);
  const pathname = decodeURIComponent(url.pathname);

  cors(res);
  if (req.method === "OPTIONS") { res.writeHead(204); res.end(); return; }

  // ── VAPID public key ──
  if (pathname === "/api/vapid-public-key" && req.method === "GET") {
    send(res, 200, JSON.stringify({ publicKey: vapidKeys.publicKey }), "application/json; charset=utf-8");
    return;
  }

  // ── Push subscription ──
  if (pathname === "/api/push-subscribe" && req.method === "POST") {
    try {
      const sub = await parseJsonBody(req);
      const idx = pushSubs.findIndex(s => s.endpoint === sub.endpoint);
      const isNew = idx < 0;
      if (idx >= 0) pushSubs[idx] = sub; else pushSubs.push(sub);
      saveSubs();
      if (isNew) catchUpNewSub(sub).catch(() => {});
      send(res, 200, "OK");
    } catch { send(res, 400, "Bad Request"); }
    return;
  }

  // ── Sync API ──
  if (pathname === "/api/sync") {
    if (req.method === "GET") {
      send(res, 200, JSON.stringify(syncStore), "application/json; charset=utf-8");
      return;
    }
    if (req.method === "POST") {
      try {
        const data = await parseJsonBody(req);
        // Re-register push subscription piggybacked on sync
        if (data.pushSub && data.pushSub.endpoint) {
          const idx = pushSubs.findIndex(s => s.endpoint === data.pushSub.endpoint);
          const isNew = idx < 0;
          if (idx >= 0) pushSubs[idx] = data.pushSub; else pushSubs.push(data.pushSub);
          saveSubs();
          if (isNew) catchUpNewSub(data.pushSub).catch(() => {});
        }
        syncStore = mergeIncoming(syncStore, data);
        saveSyncFile();
        checkAndSendReminders();
        send(res, 200, JSON.stringify(syncStore), "application/json; charset=utf-8");
      } catch { send(res, 400, "Bad Request"); }
      return;
    }
    send(res, 405, "Method Not Allowed");
    return;
  }

  // ── Static files ──
  const filePath = path.normalize(path.join(root, pathname === "/" ? "index.html" : pathname));
  if (!filePath.startsWith(root)) { send(res, 403, "Forbidden"); return; }
  fs.readFile(filePath, (err, data) => {
    if (err) { send(res, 404, "Not found"); return; }
    send(res, 200, data, types[path.extname(filePath).toLowerCase()] || "application/octet-stream");
  });
}).listen(port, () => {
  console.log(`Kombuchator listening on ${port}`);
});
