const http = require("http");
const fs = require("fs");
const path = require("path");
const webpush = require("web-push");

const root = __dirname;
const port = Number(process.env.PORT) || 3000;
const SYNC_FILE  = path.join(__dirname, ".sync.json");
const SUBS_FILE  = path.join(__dirname, ".push-subs.json");
const VAPID_FILE = path.join(__dirname, ".vapid.json");
const MAX_JSON_BYTES = Math.min(Number(process.env.MAX_JSON_BYTES) || 1024 * 1024, 4 * 1024 * 1024);
const RATE_LIMIT_WINDOW_MS = Math.max(Number(process.env.RATE_LIMIT_WINDOW_MS) || 60_000, 1_000);
const RATE_LIMIT_MAX = Math.max(Number(process.env.RATE_LIMIT_MAX) || 120, 10);
const DEFAULT_ALLOWED_ORIGINS = [
  `http://localhost:${port}`,
  `http://127.0.0.1:${port}`,
  "https://kombuchator-production.up.railway.app"
];
const allowedOrigins = new Set(
  (process.env.ALLOWED_ORIGINS || DEFAULT_ALLOWED_ORIGINS.join(","))
    .split(",")
    .map(origin => origin.trim())
    .filter(Boolean)
);
const publicRootFiles = new Set(["/", "/index.html", "/style.css", "/script.js", "/sw.js", "/manifest.json"]);
const rateBuckets = new Map();

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

function isAllowedOrigin(origin) {
  return !origin || allowedOrigins.has(origin);
}

function applyCors(req, res) {
  const origin = req.headers.origin;
  res.setHeader("Vary", "Origin");
  if (origin && allowedOrigins.has(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.setHeader("Access-Control-Allow-Methods", "GET, HEAD, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

function applySecurityHeaders(res) {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=(), payment=(), usb=(), bluetooth=()");
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
  res.setHeader("Content-Security-Policy", [
    "default-src 'self'",
    "base-uri 'self'",
    "object-src 'none'",
    "frame-ancestors 'none'",
    "form-action 'self'",
    "script-src 'self'",
    "worker-src 'self'",
    "connect-src 'self'",
    "img-src 'self' data:",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "manifest-src 'self'",
    "upgrade-insecure-requests"
  ].join("; "));
  if (process.env.RAILWAY_ENVIRONMENT === "production" || process.env.NODE_ENV === "production") {
    res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  }
}

function clientIp(req) {
  return String(req.headers["x-forwarded-for"] || req.socket.remoteAddress || "unknown").split(",")[0].trim();
}

function isRateLimited(req, key = "global") {
  const now = Date.now();
  const bucketKey = `${clientIp(req)}:${key}`;
  const bucket = rateBuckets.get(bucketKey);
  if (!bucket || now - bucket.start > RATE_LIMIT_WINDOW_MS) {
    rateBuckets.set(bucketKey, { start: now, count: 1 });
    return false;
  }
  bucket.count += 1;
  return bucket.count > RATE_LIMIT_MAX;
}

function safeString(value, max = 500) {
  return typeof value === "string" ? value.slice(0, max) : value == null ? value : String(value).slice(0, max);
}

function safeIso(value) {
  const time = Date.parse(value);
  return Number.isFinite(time) ? new Date(time).toISOString() : null;
}

function sanitizeReminder(reminder) {
  if (!reminder || typeof reminder !== "object" || !reminder.id) return null;
  const remindAt = safeIso(reminder.remindAt);
  if (!remindAt) return null;
  const status = ["pending", "done", "closed", "cancelled", "canceled"].includes(reminder.status) ? reminder.status : "pending";
  return {
    ...reminder,
    id: safeString(reminder.id, 80),
    type: safeString(reminder.type || "taste", 40),
    title: safeString(reminder.title || "Připomínka", 120),
    remindAt,
    status,
    note: reminder.note == null ? null : safeString(reminder.note, 1000),
    createdAt: safeIso(reminder.createdAt) || undefined,
    updatedAt: safeIso(reminder.updatedAt) || undefined
  };
}

function sanitizeSyncPayload(data) {
  if (!data || typeof data !== "object") return { batches: [], recipes: [], deletedBatchIds: [], deletedRecipeIds: [] };
  const batches = Array.isArray(data.batches) ? data.batches.slice(0, 500).filter(b => b && typeof b === "object" && b.id).map(b => ({
    ...b,
    id: safeString(b.id, 80),
    batchName: safeString(b.batchName || "Moje várka", 120),
    startNote: b.startNote == null ? null : safeString(b.startNote, 2000),
    finalNote: b.finalNote == null ? null : safeString(b.finalNote, 2000),
    checks: Array.isArray(b.checks) ? b.checks.slice(0, 1000).map(c => c && typeof c === "object" ? {
      ...c,
      id: safeString(c.id || "", 80),
      note: c.note == null ? null : safeString(c.note, 2000)
    } : null).filter(Boolean) : [],
    reminders: Array.isArray(b.reminders) ? b.reminders.slice(0, 1000).map(sanitizeReminder).filter(Boolean) : [],
    deletedCheckIds: Array.isArray(b.deletedCheckIds) ? b.deletedCheckIds.slice(0, 1000).map(id => safeString(id, 80)) : []
  })) : [];
  const recipes = Array.isArray(data.recipes) ? data.recipes.slice(0, 500).filter(r => r && typeof r === "object" && r.id).map(r => ({
    ...r,
    id: safeString(r.id, 80),
    recipeName: safeString(r.recipeName || r.defaultRecipeName || "Recept", 120),
    userNote: safeString(r.userNote || "", 2000),
    shareText: safeString(r.shareText || "", 5000)
  })) : [];
  return {
    ...data,
    batches,
    recipes,
    deletedBatchIds: Array.isArray(data.deletedBatchIds) ? data.deletedBatchIds.slice(0, 1000).map(id => safeString(id, 80)) : [],
    deletedRecipeIds: Array.isArray(data.deletedRecipeIds) ? data.deletedRecipeIds.slice(0, 1000).map(id => safeString(id, 80)) : []
  };
}

function isPublicPath(pathname) {
  if (publicRootFiles.has(pathname)) return true;
  if (!pathname.startsWith("/ikony/")) return false;
  const ext = path.extname(pathname).toLowerCase();
  return [".png", ".svg", ".jpg", ".jpeg", ".webp"].includes(ext) && !pathname.includes("..") && !pathname.includes(":");
}

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
function reminderNotificationKey(reminder) {
  return `${reminder.id}@${reminder.remindAt}`;
}

const REMINDER_TERMINAL_STATUSES = new Set(["done", "closed", "cancelled", "canceled"]);

function reminderTimestamp(reminder) {
  return Date.parse(reminder.updatedAt || reminder.statusUpdatedAt || reminder.createdAt || "") || 0;
}

function isTerminalReminder(reminder) {
  return REMINDER_TERMINAL_STATUSES.has(reminder?.status);
}

function mergeReminderRecords(existing, incoming) {
  if (!existing) return incoming;
  if (!incoming) return existing;

  const existingTs = reminderTimestamp(existing);
  const incomingTs = reminderTimestamp(incoming);
  if (existingTs && incomingTs && existingTs !== incomingTs) {
    return incomingTs > existingTs ? incoming : existing;
  }

  const existingDone = isTerminalReminder(existing);
  const incomingDone = isTerminalReminder(incoming);
  if (existingDone !== incomingDone) return existingDone ? existing : incoming;

  return incoming;
}

function mergeReminderLists(first = [], second = []) {
  const reminderMap = new Map();
  [...first, ...second].forEach(reminder => {
    reminderMap.set(reminder.id, mergeReminderRecords(reminderMap.get(reminder.id), reminder));
  });
  return [...reminderMap.values()];
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
      await sendPushToOne(sub, {
        title: `Kombuchátor: ${r.title}`,
        body: batch.batchName,
        url: "/#varky",
        reminderId: r.id,
        reminderKey: reminderNotificationKey(r)
      });
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
      const notifKey = reminderNotificationKey(r);
      if (notifiedIds.has(notifKey)) return;
      if (new Date(r.remindAt).getTime() > now) return;
      notifiedIds.add(notifKey);
      saveNotified();
      sendPushToAll({
        title:      `Kombuchátor: ${r.title}`,
        body:       batch.batchName,
        url:        "/#varky",
        reminderId: r.id,
        reminderKey: notifKey
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
    const base = (b.checks?.length ?? 0) >= (curr.checks?.length ?? 0) ? b : curr;
    batchMap.set(b.id, {
      ...base,
      checks:          [...checkMap.values()].sort((a, c) => new Date(a.checkedAt) - new Date(c.checkedAt)),
      reminders:       mergeReminderLists(curr.reminders || [], b.reminders || []),
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

function parseJsonBody(req, maxBytes = MAX_JSON_BYTES) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    req.on("data", chunk => {
      size += chunk.length;
      if (size > maxBytes) {
        const err = new Error("Payload too large");
        err.statusCode = 413;
        req.destroy(err);
        reject(err);
        return;
      }
      chunks.push(chunk);
    });
    req.on("end", () => {
      try { resolve(JSON.parse(Buffer.concat(chunks).toString("utf8"))); }
      catch (e) { reject(e); }
    });
    req.on("error", reject);
  });
}

function send(res, status, body, type = "text/plain; charset=utf-8") {
  res.writeHead(status, { "Content-Type": type });
  res.end(body);
}

http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);
  const pathname = decodeURIComponent(url.pathname);

  applySecurityHeaders(res);
  applyCors(req, res);
  res.setHeader("Cache-Control", pathname.startsWith("/api/") ? "no-store" : "no-cache");

  if (!isAllowedOrigin(req.headers.origin)) {
    send(res, 403, "Forbidden");
    return;
  }
  if (!["GET", "HEAD", "POST", "OPTIONS"].includes(req.method)) {
    send(res, 405, "Method Not Allowed");
    return;
  }
  if (req.method === "OPTIONS") { res.writeHead(204); res.end(); return; }

  // ── VAPID public key ──
  if (pathname === "/api/vapid-public-key" && req.method === "GET") {
    if (isRateLimited(req, "vapid")) { send(res, 429, "Too Many Requests"); return; }
    send(res, 200, JSON.stringify({ publicKey: vapidKeys.publicKey }), "application/json; charset=utf-8");
    return;
  }

  // ── Push subscription ──
  if (pathname === "/api/push-subscribe" && req.method === "POST") {
    if (isRateLimited(req, "push-subscribe")) { send(res, 429, "Too Many Requests"); return; }
    try {
      const sub = await parseJsonBody(req, 64 * 1024);
      if (!sub || typeof sub !== "object" || typeof sub.endpoint !== "string" || sub.endpoint.length > 2000) {
        send(res, 400, "Bad Request");
        return;
      }
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
      if (isRateLimited(req, "sync-get")) { send(res, 429, "Too Many Requests"); return; }
      send(res, 200, JSON.stringify(syncStore), "application/json; charset=utf-8");
      return;
    }
    if (req.method === "POST") {
      if (isRateLimited(req, "sync-post")) { send(res, 429, "Too Many Requests"); return; }
      try {
        const data = sanitizeSyncPayload(await parseJsonBody(req));
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
  if (!isPublicPath(pathname)) {
    send(res, 404, "Not found");
    return;
  }
  const filePath = path.normalize(path.join(root, pathname === "/" ? "index.html" : pathname));
  if (!filePath.startsWith(root + path.sep)) { send(res, 403, "Forbidden"); return; }
  fs.readFile(filePath, (err, data) => {
    if (err) { send(res, 404, "Not found"); return; }
    send(res, 200, data, types[path.extname(filePath).toLowerCase()] || "application/octet-stream");
  });
}).listen(port, () => {
  console.log(`Kombuchator listening on ${port}`);
});
