// Service Worker — network-first for app code so bug fixes propagate, cache-first for icons/fonts
// IMPORTANT: bump CACHE version whenever app JS/CSS/HTML changes materially so old clients recover.
const CACHE = "fitforge-v273";
// Derived from CACHE, not hand-listed. This was pinned at ?v=156 while the app
// shipped ?v=165 — and cache keys include the query string, so not one
// precached script could ever serve a real request. The list and the version
// were three files apart and drifted for ten releases without a sound.
const V = CACHE.replace("fitforge-v", "");
const VERSIONED = [
  "./css/styles.css", "./js/app.js", "./js/storage.js", "./js/utils.js",
  "./js/body-map.js", "./js/interval-runner.js", "./js/meal-search.js",
  "./js/diet-plan.js", "./js/progression.js", "./js/exercise-links.js",
  "./data/exercises.js", "./data/meals.js", "./data/sessions.js", "./data/learn.js",
  "./data/diet-plans.js", "./data/progressions.js", "./data/disciplines.js"
];
// Never versioned: the font binaries are content-addressed by name and change
// only if the typeface itself is replaced. styles.css references them without
// a query, so they must be cached without one.
const STATIC = [
  "./manifest.webmanifest", "./icons/icon-192.svg", "./icons/icon-512.svg",
  "./icons/icon-192.png", "./icons/icon-512.png", "./icons/apple-touch-icon.png",
  "./fonts/inter-latin.woff2", "./fonts/inter-latin-ext.woff2"
];
const PRECACHE = [
  "./", "./index.html",
  ...VERSIONED.map(u => `${u}?v=${V}`),
  ...VERSIONED,                                   // bare URLs, for direct hits
  ...STATIC
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
    // Network-first, but only for as long as the network deserves. Without a
    // timeout the cache was consulted ONLY after fetch rejected — so on wifi
    // you are joined to but that never routes (gyms, hotels, captive portals)
    // launch hung on the splash for the browser's own multi-tens-of-seconds
    // timeout with a complete cache sitting unused. That is the everyday
    // offline case, and it looked like the app was broken.
    const NET_MS = 2000;
    const fromNet = fetch(e.request).then(res => {
      if (res && res.status === 200 && res.type === "basic") {
        const clone = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
      }
      return res;
    });
    e.respondWith(
      caches.match(e.request).then(cached => {
        if (!cached) // Only a navigation may fall back to the shell. Handing index.html to a
        // <script> tag returns HTML with status 200 and yields
        // "Unexpected token '<'" and a white screen — a failure that looks
        // nothing like the network problem it actually is.
        return fromNet.catch(() =>
          dest === "document" ? caches.match("./index.html") : Response.error());
        // We have a copy: race it. Slow network yields to cache, and the fetch
        // still completes in the background to refresh it for next time.
        return Promise.race([
          fromNet.catch(() => cached),
          new Promise(resolve => setTimeout(() => resolve(cached), NET_MS))
        ]);
      })
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
