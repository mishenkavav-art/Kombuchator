const CACHE = "kombuchator-v40";
const FIRED_META = "push-fired-meta";

self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(["/"]))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE && k !== FIRED_META).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Handle push from server
self.addEventListener("push", e => {
  let data = { title: "Kombuchátor", body: "Čas zkontrolovat várku!", url: "/#varky" };
  try { data = { ...data, ...e.data.json() }; } catch {}
  e.waitUntil((async () => {
    await self.registration.showNotification(data.title, {
      body: data.body,
      icon: "/ikony/kombucha.png",
      badge: "/ikony/kombucha.png",
      data: { url: data.url, reminderId: data.reminderId, reminderKey: data.reminderKey },
      requireInteraction: false
    });
    // Store the fired reminder key so the client page doesn't fire a duplicate
    const firedKey = data.reminderKey || data.reminderId;
    if (firedKey) {
      const cache = await caches.open(FIRED_META);
      const existing = await cache.match("/push-fired-ids");
      const ids = existing ? await existing.json() : [];
      if (!ids.includes(firedKey)) ids.push(firedKey);
      await cache.put("/push-fired-ids", new Response(JSON.stringify(ids), { headers: { "Content-Type": "application/json" } }));
      // Notify any open client pages immediately
      const all = await self.clients.matchAll({ includeUncontrolled: true, type: "window" });
      all.forEach(c => c.postMessage({ type: "push-fired", reminderId: data.reminderId, reminderKey: firedKey }));
    }
  })());
});

// Client asks for the list of push-fired IDs (e.g. on page load)
self.addEventListener("message", e => {
  if (e.data?.type === "get-push-fired") {
    caches.open(FIRED_META).then(c => c.match("/push-fired-ids")).then(r => r ? r.json() : []).then(ids => {
      e.source.postMessage({ type: "push-fired-list", ids });
      caches.open(FIRED_META).then(c => c.delete("/push-fired-ids"));
    });
  }
});

// Open app when notification is clicked
self.addEventListener("notificationclick", e => {
  e.notification.close();
  const target = e.notification.data?.url || "/#varky";
  e.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then(list => {
      const existing = list.find(c => c.url.includes(self.location.origin));
      if (existing) { existing.focus(); existing.navigate(self.location.origin + target); return; }
      return clients.openWindow(self.location.origin + target);
    })
  );
});

// Network-first: always try fresh, fall back to cache when offline
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  if (new URL(e.request.url).pathname.startsWith("/api/")) return;
  e.respondWith(
    fetch(e.request)
      .then(res => {
        const url = new URL(e.request.url);
        const mayCache = res.ok && !url.pathname.endsWith(".html") && url.pathname !== "/";
        if (mayCache) {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return res;
      })
      .catch(() => caches.match(e.request).then(r => r || caches.match("/")))
  );
});
