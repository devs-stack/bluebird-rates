const CACHE_NAME = 'bluebird-v1';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json'
  // Add local CSS, JS, or images here if you add them to your folder (e.g., './style.css', './icon-192.png')
];

// Install Event: Caches essential static app shell assets
self.addEventListener('install', (event) => {
  self.skipWaiting(); // Force waiting service worker to become active
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

// Activate Event: Cleans up old caches when CACHE_NAME changes
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('Service Worker: Clearing old cache', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim()) // Take control of all pages immediately
  );
});

// Fetch Event: Handles network requests and prevents API/rate caching
self.addEventListener('fetch', (event) => {
  const requestUrl = event.request.url;

  // 1. RULE: NEVER cache backend API requests (Google Apps Script)
  if (requestUrl.includes('script.google.com')) {
    event.respondWith(fetch(event.request));
    return;
  }

  // 2. RULE: Network-first for HTML pages so app code changes update immediately
  if (event.request.mode === 'navigate' || requestUrl.includes('index.html')) {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          return caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          });
        })
        .catch(() => caches.match(event.request)) // Fallback to cache if offline
    );
    return;
  }

  // 3. RULE: Cache-first fallback for static assets (images, icons, manifest)
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      return cachedResponse || fetch(event.request);
    })
  );
});
