// Service Worker for Bolivia Blue con Paz
// Provides offline support and caching for better performance

const CACHE_NAME = 'bolivia-blue-v1';
const STATIC_CACHE_NAME = 'bolivia-blue-static-v1';
const API_CACHE_NAME = 'bolivia-blue-api-v1';

// Assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/favicon.svg',
  '/og-image.webp',
  '/manifest.json'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  // Activate immediately
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => {
            return name !== CACHE_NAME && 
                   name !== STATIC_CACHE_NAME && 
                   name !== API_CACHE_NAME;
          })
          .map((name) => caches.delete(name))
      );
    })
  );
  // Take control of all pages immediately
  return self.clients.claim();
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip chrome-extension and other non-http requests
  if (!url.protocol.startsWith('http')) {
    return;
  }

  // API requests - network first, cache fallback (stale-while-revalidate)
  if (url.pathname.startsWith('/api/') || url.hostname.includes('supabase.co')) {
    event.respondWith(
      caches.open(API_CACHE_NAME).then((cache) => {
        return fetch(request)
          .then((response) => {
            // Cache successful responses
            if (response.status === 200) {
              cache.put(request, response.clone());
            }
            return response;
          })
          .catch(() => {
            // Return cached version if network fails
            return cache.match(request).then((cachedResponse) => {
              if (cachedResponse) {
                return cachedResponse;
              }
              // Return offline fallback
              return new Response(
                JSON.stringify({ error: 'Offline', message: 'No cached data available' }),
                {
                  headers: { 'Content-Type': 'application/json' },
                  status: 503
                }
              );
            });
          });
      })
    );
    return;
  }

  // Static assets - cache first, network fallback
  if (url.pathname.match(/\.(js|css|svg|webp|woff2?|png|jpg|jpeg)$/)) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(request).then((response) => {
          // Don't cache if not successful
          if (!response || response.status !== 200) {
            return response;
          }
          const responseToCache = response.clone();
          caches.open(STATIC_CACHE_NAME).then((cache) => {
            cache.put(request, responseToCache);
          });
          return response;
        });
      })
    );
    return;
  }

  // HTML pages - network first, cache fallback
  if (request.headers.get('accept').includes('text/html')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseToCache);
          });
          return response;
        })
        .catch(() => {
          return caches.match(request).then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }
            // Fallback to index.html for SPA routing
            return caches.match('/index.html');
          });
        })
    );
    return;
  }

  // Default: network first
  event.respondWith(fetch(request));
});

