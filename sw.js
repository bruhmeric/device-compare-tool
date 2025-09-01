
const CACHE_NAME = 'device-duel-v1';

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll([
        '/',
        '/index.html',
        '/index.js',
        '/manifest.json',
        '/favicon.svg'
      ]);
    })
  );
});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Don't cache API calls or generative language model calls.
  if (event.request.method !== 'GET' || url.pathname.startsWith('/api/') || url.hostname.includes('generativelanguage')) {
    return;
  }

  const isSameOrigin = event.request.url.startsWith(self.location.origin);
  const isCdn = ['aistudiocdn.com', 'cdn.tailwindcss.com'].some(domain => event.request.url.includes(domain));

  if (isSameOrigin || isCdn) {
    event.respondWith(
      caches.open(CACHE_NAME).then(cache => {
        return cache.match(event.request).then(response => {
          const fetchPromise = fetch(event.request).then(networkResponse => {
            if (networkResponse && networkResponse.status === 200) {
              cache.put(event.request, networkResponse.clone());
            }
            return networkResponse;
          });
          return response || fetchPromise;
        });
      })
    );
  }
});

self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
