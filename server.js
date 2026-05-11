const http = require("http");
const fs = require("fs");
const path = require("path");

const root = __dirname;
const port = Number(process.env.PORT) || 3000;
const SYNC_FILE = path.join(__dirname, ".sync.json");

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

// ── Sync store ──
let syncStore = { batches: [], recipes: [], deletedBatchIds: [], deletedRecipeIds: [] };
try { syncStore = { ...syncStore, ...JSON.parse(fs.readFileSync(SYNC_FILE, "utf8")) }; } catch {}

function saveSyncFile() {
  try { fs.writeFileSync(SYNC_FILE, JSON.stringify(syncStore)); } catch {}
}

// Server-side merge: unions tombstones and items so concurrent POSTs never lose data
function mergeIncoming(existing, incoming) {
  const deadBatches  = new Set([...(existing.deletedBatchIds  || []), ...(incoming.deletedBatchIds  || [])]);
  const deadRecipes  = new Set([...(existing.deletedRecipeIds || []), ...(incoming.deletedRecipeIds || [])]);

  const batchMap = new Map();
  [...(existing.batches || []), ...(incoming.batches || [])].forEach(b => {
    if (deadBatches.has(b.id)) return;
    const curr = batchMap.get(b.id);
    if (!curr) { batchMap.set(b.id, b); return; }
    const checkMap = new Map([...(curr.checks || []), ...(b.checks || [])].map(c => [c.id, c]));
    const remMap   = new Map([...(curr.reminders || []), ...(b.reminders || [])].map(r => [r.id, r]));
    const base = (b.checks?.length ?? 0) >= (curr.checks?.length ?? 0) ? b : curr;
    batchMap.set(b.id, {
      ...base,
      checks:    [...checkMap.values()].sort((a, c) => new Date(a.checkedAt) - new Date(c.checkedAt)),
      reminders: [...remMap.values()]
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

function send(res, status, body, type = "text/plain; charset=utf-8") {
  res.writeHead(status, { "Content-Type": type });
  res.end(body);
}

http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);
  const pathname = decodeURIComponent(url.pathname);

  // ── Sync API ──
  if (pathname === "/api/sync") {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    res.setHeader("Cache-Control", "no-store");

    if (req.method === "OPTIONS") { res.writeHead(204); res.end(); return; }

    if (req.method === "GET") {
      send(res, 200, JSON.stringify(syncStore), "application/json; charset=utf-8");
      return;
    }

    if (req.method === "POST") {
      try {
        const data = await parseJsonBody(req);
        syncStore = mergeIncoming(syncStore, data);
        saveSyncFile();
        send(res, 200, JSON.stringify(syncStore), "application/json; charset=utf-8");
      } catch {
        send(res, 400, "Bad Request");
      }
      return;
    }

    send(res, 405, "Method Not Allowed");
    return;
  }

  // ── Static files ──
  const filePath = path.normalize(path.join(root, pathname === "/" ? "index.html" : pathname));

  if (!filePath.startsWith(root)) {
    send(res, 403, "Forbidden");
    return;
  }

  fs.readFile(filePath, (err, data) => {
    if (err) { send(res, 404, "Not found"); return; }
    send(res, 200, data, types[path.extname(filePath).toLowerCase()] || "application/octet-stream");
  });
}).listen(port, () => {
  console.log(`Kombuchator listening on ${port}`);
});
