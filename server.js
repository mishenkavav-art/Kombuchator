const http = require("http");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const webpush = require("web-push");

const root = __dirname;
const port = Number(process.env.PORT) || 3000;
const DATA_DIR = process.env.DATA_DIR ? path.resolve(process.env.DATA_DIR) : __dirname;
const SYNC_FILE  = path.join(DATA_DIR, ".sync.json");
const SUBS_FILE  = path.join(DATA_DIR, ".push-subs.json");
const VAPID_FILE = path.join(DATA_DIR, ".vapid.json");
const AUTH_FILE = path.join(DATA_DIR, ".sync-auth.json");
const SYNC_DIR = path.join(DATA_DIR, ".sync-stores");
const BACKUP_DIR = path.join(DATA_DIR, ".sync-migration-backups");
const NOTIFIED_FILE = path.join(DATA_DIR, ".notified.json");
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

const EMPTY_SYNC_STORE = { batches: [], recipes: [], deletedBatchIds: [], deletedRecipeIds: [] };

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function readJson(file, fallback) {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    return fallback;
  }
}

function writeJson(file, value) {
  ensureDir(path.dirname(file));
  const tmp = `${file}.${process.pid}.${Date.now()}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(value));
  fs.renameSync(tmp, file);
}

function backupFile(file, label) {
  if (!fs.existsSync(file)) return null;
  ensureDir(BACKUP_DIR);
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const target = path.join(BACKUP_DIR, `${label}-${stamp}.json`);
  fs.copyFileSync(file, target);
  return target;
}

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
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, X-Sync-Id, X-Sync-Token");
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

function isValidSyncId(syncId) {
  return typeof syncId === "string" && /^[A-Za-z0-9_-]{22,80}$/.test(syncId);
}

function isValidSyncSecret(secret) {
  return typeof secret === "string" && /^[A-Za-z0-9_-]{32,160}$/.test(secret);
}

function syncStoreFile(syncId) {
  if (!isValidSyncId(syncId)) throw new Error("Invalid syncId");
  return path.join(SYNC_DIR, `${syncId}.json`);
}

function hashSecret(syncId, secret) {
  return crypto.createHash("sha256").update(`${syncId}:${secret}`, "utf8").digest("hex");
}

let syncAuth = readJson(AUTH_FILE, { identities: {}, legacyMigratedTo: null });
if (!syncAuth || typeof syncAuth !== "object" || !syncAuth.identities) {
  syncAuth = { identities: {}, legacyMigratedTo: null };
}

function saveSyncAuth() {
  writeJson(AUTH_FILE, syncAuth);
}

function authFromRequest(req) {
  const syncId = String(req.headers["x-sync-id"] || "");
  const syncSecret = String(req.headers["x-sync-token"] || "");
  if (!isValidSyncId(syncId) || !isValidSyncSecret(syncSecret)) return { ok: false, status: 401 };
  const identity = syncAuth.identities[syncId];
  if (!identity) return { ok: false, status: 401, syncId, syncSecret };
  const incomingHash = hashSecret(syncId, syncSecret);
  const expected = Buffer.from(identity.secretHash, "hex");
  const incoming = Buffer.from(incomingHash, "hex");
  if (expected.length !== incoming.length || !crypto.timingSafeEqual(expected, incoming)) {
    return { ok: false, status: 403, syncId, syncSecret };
  }
  return { ok: true, syncId };
}

function createIdentity(syncId, syncSecret) {
  syncAuth.identities[syncId] = {
    secretHash: hashSecret(syncId, syncSecret),
    createdAt: new Date().toISOString()
  };
  saveSyncAuth();
}

function getSyncStore(syncId) {
  return { ...EMPTY_SYNC_STORE, ...readJson(syncStoreFile(syncId), EMPTY_SYNC_STORE) };
}

function saveSyncStore(syncId, store) {
  writeJson(syncStoreFile(syncId), store);
}

function hasLegacySyncData() {
  if (!fs.existsSync(SYNC_FILE)) return false;
  const legacy = readJson(SYNC_FILE, EMPTY_SYNC_STORE);
  return Boolean(
    (Array.isArray(legacy.batches) && legacy.batches.length) ||
    (Array.isArray(legacy.recipes) && legacy.recipes.length) ||
    (Array.isArray(legacy.deletedBatchIds) && legacy.deletedBatchIds.length) ||
    (Array.isArray(legacy.deletedRecipeIds) && legacy.deletedRecipeIds.length)
  );
}

function initialStoreForNewIdentity(syncId) {
  if (!syncAuth.legacyMigratedTo && Object.keys(syncAuth.identities).length === 1 && hasLegacySyncData()) {
    backupFile(SYNC_FILE, "legacy-sync-before-token-migration");
    syncAuth.legacyMigratedTo = syncId;
    saveSyncAuth();
    return { ...EMPTY_SYNC_STORE, ...readJson(SYNC_FILE, EMPTY_SYNC_STORE) };
  }
  return { ...EMPTY_SYNC_STORE };
}

// ── VAPID setup ──
function loadVapidConfig() {
  const envPublicKey = process.env.VAPID_PUBLIC_KEY;
  const envPrivateKey = process.env.VAPID_PRIVATE_KEY;
  const envSubject = process.env.VAPID_SUBJECT;
  if (envPublicKey && envPrivateKey && envSubject) {
    return { publicKey: envPublicKey, privateKey: envPrivateKey, subject: envSubject };
  }
  if (process.env.NODE_ENV === "production") {
    throw new Error("Missing VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, or VAPID_SUBJECT in production");
  }
  const subject = envSubject || "mailto:mishenka.vav@gmail.com";
  let localKeys;
  try {
    localKeys = JSON.parse(fs.readFileSync(VAPID_FILE, "utf8"));
  } catch {
    localKeys = webpush.generateVAPIDKeys();
    try { writeJson(VAPID_FILE, localKeys); } catch {}
  }
  return { publicKey: localKeys.publicKey, privateKey: localKeys.privateKey, subject };
}

const vapidConfig = loadVapidConfig();
webpush.setVapidDetails(vapidConfig.subject, vapidConfig.publicKey, vapidConfig.privateKey);

// ── Push subscriptions ──
let pushSubs = readJson(SUBS_FILE, {});
if (Array.isArray(pushSubs)) {
  backupFile(SUBS_FILE, "legacy-push-subs-before-token-migration");
  pushSubs = {};
}
function saveSubs() {
  try { writeJson(SUBS_FILE, pushSubs); } catch {}
}

// ── Reminder push logic ──
const notifiedIds = new Set(
  (() => { try { return JSON.parse(fs.readFileSync(NOTIFIED_FILE, "utf8")); } catch { return []; } })()
);
function saveNotified() {
  try { writeJson(NOTIFIED_FILE, [...notifiedIds]); } catch {}
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

async function sendPushToOne(syncId, sub, payload) {
  try {
    console.log(`[push] → ${sub.endpoint.slice(-30)}: ${payload.title}`);
    await webpush.sendNotification(sub, JSON.stringify(payload));
  } catch (e) {
    console.log(`[push] error ${e.statusCode}: ${e.message?.slice(0, 80)}`);
    if (e.statusCode === 410 || e.statusCode === 404) {
      pushSubs[syncId] = (pushSubs[syncId] || []).filter(s => s.endpoint !== sub.endpoint);
      saveSubs();
    }
  }
}

async function sendPushToAll(syncId, payload) {
  const subs = Array.isArray(pushSubs[syncId]) ? pushSubs[syncId] : [];
  console.log(`[push] sending "${payload.title}" to ${subs.length} device(s)`);
  await Promise.all(subs.map(sub => sendPushToOne(syncId, sub, payload)));
}

// Send all currently-due reminders to a single new subscription (catch-up for late devices)
async function catchUpNewSub(syncId, sub) {
  const now = Date.now();
  const store = getSyncStore(syncId);
  for (const batch of (store.batches || [])) {
    if (batch.finished) continue;
    for (const r of (batch.reminders || [])) {
      if (r.status !== "pending") continue;
      if (new Date(r.remindAt).getTime() > now) continue;
      await sendPushToOne(syncId, sub, {
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
  const now = Date.now();
  Object.keys(syncAuth.identities || {}).forEach(syncId => {
    const subs = Array.isArray(pushSubs[syncId]) ? pushSubs[syncId] : [];
    if (!subs.length) return;
    const store = getSyncStore(syncId);
    (store.batches || []).forEach(batch => {
      if (batch.finished) return;
      (batch.reminders || []).forEach(r => {
        if (r.status !== "pending") return;
        const notifKey = `${syncId}:${reminderNotificationKey(r)}`;
        if (notifiedIds.has(notifKey)) return;
        if (new Date(r.remindAt).getTime() > now) return;
        notifiedIds.add(notifKey);
        saveNotified();
        sendPushToAll(syncId, {
          title:      `Kombuchátor: ${r.title}`,
          body:       batch.batchName,
          url:        "/#varky",
          reminderId: r.id,
          reminderKey: reminderNotificationKey(r)
        }).catch(() => {});
      });
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
    send(res, 200, JSON.stringify({ publicKey: vapidConfig.publicKey }), "application/json; charset=utf-8");
    return;
  }

  // ── Sync identity bootstrap ──
  if (pathname === "/api/sync/bootstrap" && req.method === "POST") {
    if (isRateLimited(req, "sync-bootstrap")) { send(res, 429, "Too Many Requests"); return; }
    const auth = authFromRequest(req);
    if (auth.ok) {
      send(res, 200, JSON.stringify({ ok: true }), "application/json; charset=utf-8");
      return;
    }
    const syncId = auth.syncId;
    const syncSecret = auth.syncSecret;
    if (!isValidSyncId(syncId) || !isValidSyncSecret(syncSecret)) {
      send(res, 401, "Unauthorized");
      return;
    }
    if (syncAuth.identities[syncId]) {
      send(res, 403, "Forbidden");
      return;
    }
    createIdentity(syncId, syncSecret);
    saveSyncStore(syncId, initialStoreForNewIdentity(syncId));
    send(res, 201, JSON.stringify({ ok: true }), "application/json; charset=utf-8");
    return;
  }

  // ── Push subscription ──
  if (pathname === "/api/push-subscribe" && req.method === "POST") {
    if (isRateLimited(req, "push-subscribe")) { send(res, 429, "Too Many Requests"); return; }
    const auth = authFromRequest(req);
    if (!auth.ok) { send(res, auth.status, auth.status === 403 ? "Forbidden" : "Unauthorized"); return; }
    try {
      const sub = await parseJsonBody(req, 64 * 1024);
      if (!sub || typeof sub !== "object" || typeof sub.endpoint !== "string" || sub.endpoint.length > 2000) {
        send(res, 400, "Bad Request");
        return;
      }
      if (!Array.isArray(pushSubs[auth.syncId])) pushSubs[auth.syncId] = [];
      const idx = pushSubs[auth.syncId].findIndex(s => s.endpoint === sub.endpoint);
      const isNew = idx < 0;
      if (idx >= 0) pushSubs[auth.syncId][idx] = sub; else pushSubs[auth.syncId].push(sub);
      saveSubs();
      if (isNew) catchUpNewSub(auth.syncId, sub).catch(() => {});
      send(res, 200, "OK");
    } catch { send(res, 400, "Bad Request"); }
    return;
  }

  // ── Sync API ──
  if (pathname === "/api/sync") {
    if (req.method === "GET" && isRateLimited(req, "sync-get")) { send(res, 429, "Too Many Requests"); return; }
    if (req.method === "POST" && isRateLimited(req, "sync-post")) { send(res, 429, "Too Many Requests"); return; }
    const auth = authFromRequest(req);
    if (!auth.ok) { send(res, auth.status, auth.status === 403 ? "Forbidden" : "Unauthorized"); return; }
    if (req.method === "GET") {
      send(res, 200, JSON.stringify(getSyncStore(auth.syncId)), "application/json; charset=utf-8");
      return;
    }
    if (req.method === "POST") {
      try {
        const data = sanitizeSyncPayload(await parseJsonBody(req));
        // Re-register push subscription piggybacked on sync
        if (data.pushSub && data.pushSub.endpoint) {
          if (!Array.isArray(pushSubs[auth.syncId])) pushSubs[auth.syncId] = [];
          const idx = pushSubs[auth.syncId].findIndex(s => s.endpoint === data.pushSub.endpoint);
          const isNew = idx < 0;
          if (idx >= 0) pushSubs[auth.syncId][idx] = data.pushSub; else pushSubs[auth.syncId].push(data.pushSub);
          saveSubs();
          if (isNew) catchUpNewSub(auth.syncId, data.pushSub).catch(() => {});
        }
        const syncStore = mergeIncoming(getSyncStore(auth.syncId), data);
        saveSyncStore(auth.syncId, syncStore);
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
