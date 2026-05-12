const CACHE = "kombuchator-v4";

self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(["/"]))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Handle push from server
self.addEventListener("push", e => {
  let data = { title: "Kombuchátor", body: "Čas zkontrolovat várku!", url: "/#varky" };
  try { data = { ...data, ...e.data.json() }; } catch {}
  e.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: "/ikony/kombucha.png",
      badge: "/ikony/kombucha.png",
      data: { url: data.url },
      requireInteraction: false
    })
  );
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
  // Never cache API calls
  if (new URL(e.request.url).pathname.startsWith("/api/")) return;
  e.respondWith(
    fetch(e.request)
      .then(res => {
        if (res.ok) {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return res;
      })
      .catch(() => caches.match(e.request).then(r => r || caches.match("/")))
  );
});
