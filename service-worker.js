const CACHE_NAME = "diamond-counter-v3";
const CACHE_FILES = [
    "./",
    "./index.html",
    "./style.css",
    "./app.js",
    "./manifest.json",
    "./service-worker.js",
    "./icons/icon-192.png",
    "./icons/icon-512.png",
    "./icons/maskable-512.png"
];
/* ========================================
   Install
======================================== */
self.addEventListener("install", event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                return cache.addAll(CACHE_FILES);
            })
            .then(() => {
                return self.skipWaiting();
            })
    );
});
/* ========================================
   Activate
   古いキャッシュを削除
======================================== */
self.addEventListener("activate", event => {
    event.waitUntil(
        caches.keys()
            .then(cacheNames => {
                return Promise.all(
                    cacheNames
                        .filter(
                            name =>
                                name !== CACHE_NAME
                        )
                        .map(
                            name =>
                                caches.delete(name)
                        )
                );
            })
            .then(() => {
                return self.clients.claim();
            })
    );
});
/* ========================================
   Fetch
======================================== */
self.addEventListener("fetch", event => {
    if (event.request.method !== "GET") {
        return;
    }
    event.respondWith(
        fetch(event.request)
            .then(response => {
                if (
                    response &&
                    response.status === 200
                ) {
                    const copy =
                        response.clone();
                    caches.open(CACHE_NAME)
                        .then(cache => {
                            cache.put(
                                event.request,
                                copy
                            );
                        });
                }
                return response;
            })
            .catch(() => {
                return caches.match(
                    event.request
                );
            })
    );
});