const CACHE_NAME = 'bluebird-v1';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json'
  // If you have external CSS or JS files, add them here (e.g., './style.css', './script.js')
];

// Install event: Saves static assets to browser storage
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

// Fetch event: Serves files from cache when offline
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      return cachedResponse || fetch(event.request);
    })
  );
});
