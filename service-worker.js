const CACHE_NAME = "diamond-counter-v1";

const APP_FILES = [
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

// ----------------------------------------
// インストール
// ----------------------------------------

self.addEventListener("install", event => {

    event.waitUntil(

        caches.open(CACHE_NAME)
            .then(cache => {

                return cache.addAll(APP_FILES);

            })
            .then(() => {

                return self.skipWaiting();

            })
    );
});

// ----------------------------------------
// アクティベート
// ----------------------------------------

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

// ----------------------------------------
// キャッシュ戦略
//
// HTML / CSS / JS / Manifest等
// → Cache First
//
// 外部リソース
// → Network First
// ----------------------------------------

self.addEventListener("fetch", event => {

    const request = event.request;

    // GET以外は処理しない
    if (request.method !== "GET") {
        return;
    }

    event.respondWith(

        caches.match(request)
            .then(cachedResponse => {

                if (cachedResponse) {

                    return cachedResponse;
                }

                return fetch(request)
                    .then(networkResponse => {

                        // 正常なレスポンスのみ保存
                        if (
                            networkResponse &&
                            networkResponse.status === 200 &&
                            networkResponse.type === "basic"
                        ) {

                            const responseClone =
                                networkResponse.clone();

                            caches.open(CACHE_NAME)
                                .then(cache => {

                                    cache.put(
                                        request,
                                        responseClone
                                    );

                                });
                        }

                        return networkResponse;

                    })
                    .catch(() => {

                        // オフライン時にトップページを返す
                        if (
                            request.mode === "navigate"
                        ) {

                            return caches.match(
                                "./index.html"
                            );
                        }

                        return new Response(
                            "",
                            {
                                status: 503,
                                statusText:
                                    "Offline"
                            }
                        );
                    });

            })
    );
});