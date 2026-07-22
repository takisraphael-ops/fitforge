// Service Worker — network-first for app code so bug fixes propagate, cache-first for icons/fonts
// IMPORTANT: bump CACHE version whenever app JS/CSS/HTML changes materially so old clients recover.
const CACHE = "fitforge-v106";
const PRECACHE = [
  "./",
  "./index.html",
  "./css/styles.css?v=106",
  "./js/app.js?v=106",
  "./js/storage.js?v=106",
  "./js/utils.js?v=106",
  "./js/body-map.js?v=106",
  "./data/exercises.js?v=106",
  "./data/meals.js?v=106",
  "./js/meal-search.js?v=106",
  "./css/styles.css",
  "./js/app.js",
  "./js/storage.js",
  "./js/utils.js",
  "./js/body-map.js",
  "./data/exercises.js",
  "./manifest.webmanifest",
  "./icons/icon-192.svg",
  "./icons/icon-512.svg"
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(PRECACHE)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("message", (e) => {
  if (e.data === "SKIP_WAITING") self.skipWaiting();
});

// Network-first for HTML/JS/CSS/JSON so users get fresh code when online.
// Cache-first for static images/icons/fonts.
self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  const url = new URL(e.request.url);
  if (url.origin !== self.location.origin) return; // let cross-origin (e.g. Google Fonts) pass through

  const dest = e.request.destination;
  const isAppCode = ["document", "script", "style", "worker", ""].includes(dest) ||
                    url.pathname.endsWith(".html") ||
                    url.pathname.endsWith(".js") ||
                    url.pathname.endsWith(".css") ||
                    url.pathname === "/" || url.pathname === "";

  if (isAppCode) {
    // Network-first: try network, fall back to cache when offline.
    e.respondWith(
      fetch(e.request).then(res => {
        if (res && res.status === 200 && res.type === "basic") {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return res;
      }).catch(() => caches.match(e.request).then(cached => cached || caches.match("./index.html")))
    );
  } else {
    // Cache-first for images/icons/etc.
    e.respondWith(
      caches.match(e.request).then(cached =>
        cached || fetch(e.request).then(res => {
          if (res && res.status === 200 && res.type === "basic") {
            const clone = res.clone();
            caches.open(CACHE).then(c => c.put(e.request, clone));
          }
          return res;
        })
      )
    );
  }
});
