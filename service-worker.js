const CACHE_NAME = 'v1';
const CACHE_ASSETS = [
    '/',
    '/index.html',
    '/styles.css',
    '/manifest.json',
    '/icon-192.png',
    '/icon-512.png'
];

// 安裝 Service Worker 並快取資源
self.addEventListener('install', event => {
    console.log('Service Worker: Installing...');
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            console.log('Service Worker: Caching Files');
            return cache.addAll(CACHE_ASSETS);
        }).then(() => self.skipWaiting()) // 立即啟用新版本 Service Worker
    );
});

// 啟動 Service Worker，清理舊快取
self.addEventListener('activate', event => {
    console.log('Service Worker: Activated');
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames
                    .filter(cache => cache !== CACHE_NAME) // 只刪除舊版本
                    .map(cache => caches.delete(cache))
            );
        }).then(() => self.clients.claim()) // 立即控制所有頁面
    );
});

// 攔截請求，使用快取並動態更新
self.addEventListener('fetch', event => {
    console.log('Service Worker: Fetching', event.request.url);
    event.respondWith(
        caches.match(event.request).then(response => {
            return response || fetch(event.request).then(fetchResponse => {
                return caches.open(CACHE_NAME).then(cache => {
                    cache.put(event.request, fetchResponse.clone()); // 更新快取
                    return fetchResponse;
                });
            });
        }).catch(() => caches.match('/index.html')) // 若離線則載入 index.html
    );
});
