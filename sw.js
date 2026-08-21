/* Winedle service worker.
 *
 * Network-first, cache-fallback. Cache-first would be faster but would also
 * pin players to a stale build, and this app ships new grapes regularly - a
 * wrong answer bank is a worse failure than a slow load. Offline still works
 * because every successful response is copied into the cache on the way past.
 */
const CACHE = 'winedle-v1';

const CORE = [
  './',
  './index.html',
  './src/style.css',
  './src/game.js',
  './data/wines.js',
  './data/aromas.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE)
      .then(cache => cache.addAll(CORE))
      .catch(() => {})
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    fetch(event.request)
      .then(response => {
        const copy = response.clone();
        caches.open(CACHE).then(cache => cache.put(event.request, copy)).catch(() => {});
        return response;
      })
      .catch(() => caches.match(event.request)
        .then(hit => hit || caches.match('./index.html')))
  );
});
