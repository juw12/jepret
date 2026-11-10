// Jepret service worker: makes the app installable and usable offline.
// Photos are never cached or sent anywhere; only the app's own files are.
const VERSION = "jepret-v8";
const SHELL = [
  "./",
  "index.html",
  "styles.css",
  "app.js",
  "core.js",
  "vocab.js",
  "describe.js",
  "earn.js",
  "icon.svg",
  "icon-192.png",
  "icon-512.png",
  "icon-maskable-512.png",
  "apple-touch-icon.png",
  "manifest.webmanifest",
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(VERSION).then((cache) => cache.addAll(SHELL)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== VERSION).map((key) => caches.delete(key)))
    )
  );
  self.clients.claim();
});

// Same-origin GETs: answer from cache at once, refresh the cache in the background.
self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);
  // The AI model (~90 MB) is cached separately by describe.js; keep it out of the app-shell cache.
  if (request.method !== "GET" || url.origin !== self.location.origin || url.pathname.includes("/models/")) {
    return;
  }
  event.respondWith(
    caches.open(VERSION).then(async (cache) => {
      const cached = await cache.match(request, { ignoreSearch: true });
      const network = fetch(request)
        .then((response) => {
          if (response.ok) {
            cache.put(request, response.clone());
          }
          return response;
        })
        .catch(() => cached);
      return cached || network;
    })
  );
});
