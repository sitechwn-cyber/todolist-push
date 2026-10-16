// Service Worker: App offline verfügbar machen + Push-Nachrichten anzeigen.
// WICHTIG: Jede Push-Nachricht muss sichtbar angezeigt werden, sonst entzieht Safari am iPhone die Erlaubnis.
const VERSION = "gebet-v2";
const DATEIEN = ["./", "index.html", "app.css", "app.js", "gebetszeiten.js", "referenz.js", "config.js", "manifest.webmanifest", "icons/icon.svg", "icons/icon-192.png", "icons/icon-512.png"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(DATEIEN)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== VERSION).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});

// Erst Netz (damit Änderungen sofort ankommen), ohne Netz aus dem Zwischenspeicher.
self.addEventListener("fetch", (e) => {
  const u = new URL(e.request.url);
  if (e.request.method !== "GET" || u.origin !== location.origin) return;
  e.respondWith(
    fetch(e.request).then((r) => {
      if (r.ok) { const kopie = r.clone(); caches.open(VERSION).then((c) => c.put(e.request, kopie)); }
      return r;
    }).catch(() => caches.match(e.request).then((r) => r || caches.match("index.html")))
  );
});

self.addEventListener("push", (e) => {
  let d = {};
  try { const p = e.data ? e.data.json() : {}; d = p.data || p; } catch { /* kein JSON */ }
  const titel = d.titel || "🕌 Gebetszeit";
  e.waitUntil(self.registration.showNotification(titel, {
    body: d.text || "",
    tag: d.tag || "gebet",
    icon: "icons/icon-192.png",
    badge: "icons/icon-192.png",
    renotify: true,
  }));
});

self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  e.waitUntil(self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((fs) => {
    for (const f of fs) if ("focus" in f) return f.focus();
    return self.clients.openWindow("./");
  }));
});
