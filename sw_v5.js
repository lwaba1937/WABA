const CACHE_NAME = 'waba-cache-v5-offline';
const urlsToCache = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './manifest.json',
  './bg.jpeg',
  // Ajout des chansons pour le mode hors-ligne
  "./L'Waba - Ana Ouiaha (Video lyrics) - L'WABA.mp3",
  "./L'Waba - Derria Nabta (Video lyrics) - L'WABA.mp3",
  "./EL WABA - HOMOLOGUE - Usma Alger.mp3"
];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    Promise.all([
      self.clients.claim(),
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== CACHE_NAME) {
              return caches.delete(cacheName);
            }
          })
        );
      })
    ])
  );
});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  
  if (event.request.headers.get('range')) {
    event.respondWith(
        fetch(event.request).catch(() => {
            return caches.match(event.request.url);
        })
    );
    return; 
  }

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        return response || fetch(event.request);
      })
  );
});
