const CACHE_NAME = 'kovalsky-v-puti-v1';
const APP_SHELL = [
    './',
    './landing.html',
    './manifest.webmanifest',
    './web-app.js',
    './assets/pwa/icon-192.png',
    './assets/pwa/icon-512.png',
    './v2/index.html',
    './v2/styles/theme.css',
    './v2/styles/landing.css',
    './v2/styles/app.css',
    './v2/data/demo-data.js',
    './v2/core/store.js',
    './v2/features/app.js'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL))
    );
    self.skipWaiting();
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(
                keys
                    .filter(key => key !== CACHE_NAME)
                    .map(key => caches.delete(key))
            )
        )
    );
    self.clients.claim();
});

self.addEventListener('fetch', event => {
    if (event.request.method !== 'GET') {
        return;
    }

    event.respondWith(
        caches.match(event.request).then(cached => {
            if (cached) {
                return cached;
            }

            return fetch(event.request)
                .then(response => {
                    if (!response || response.status !== 200 || response.type !== 'basic') {
                        return response;
                    }

                    const responseClone = response.clone();
                    caches.open(CACHE_NAME).then(cache => cache.put(event.request, responseClone));
                    return response;
                })
                .catch(() => caches.match('./landing.html'));
        })
    );
});
