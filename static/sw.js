/**
 * HeatAtlas Federated Offline-First PWA Service Worker (sw.js)
 * Caches critical 64-zone relief maps, OSM drinking water taps, and clinics
 * so outdoor workers and NGO field leads retain access in low-signal urban canyons.
 */
const CACHE_NAME = "heatatlas-offline-v2.5";
const STATIC_ASSETS = [
  "/",
  "/index.html",
  "/dashboard.html",
  "/style.css",
  "/app.js",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  if (
    event.request.method === "GET" &&
    (url.pathname.startsWith("/api/zones") ||
      url.pathname.startsWith("/api/assets") ||
      url.pathname.startsWith("/api/nearest"))
  ) {
    event.respondWith(
      fetch(event.request)
        .then((res) => {
          const cloned = res.clone();
          caches.open(CACHE_NAME).then((c) => c.put(event.request, cloned));
          return res;
        })
        .catch(() => caches.match(event.request)),
    );
  }
});
