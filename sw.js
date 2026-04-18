const CACHE_NAME = 'kovalsky-v-puti-__APP_VERSION__';
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
const APP_SHELL_PATHS = new Set(APP_SHELL.map(asset => new URL(asset, self.location.href).pathname));

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

    const url = new URL(event.request.url);
    const isSameOrigin = url.origin === self.location.origin;
    const isAppShellRequest = isSameOrigin && (event.request.mode === 'navigate' || APP_SHELL_PATHS.has(url.pathname));

    if (isAppShellRequest) {
        event.respondWith(
            fetch(event.request)
                .then(response => {
                    if (response && response.status === 200) {
                        const responseClone = response.clone();
                        caches.open(CACHE_NAME).then(cache => cache.put(event.request, responseClone));
                    }

                    return response;
                })
                .catch(() =>
                    caches.match(event.request).then(cached => cached || caches.match('./v2/index.html') || caches.match('./landing.html'))
                )
        );
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
