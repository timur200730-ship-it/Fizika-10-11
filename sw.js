const CACHE_NAME = 'somk-physics-v1';
const URLS_TO_CACHE = [
    './',
    './index.html',
    './mechanics.html',
    './dynamics.html',
    './offline.html',
    './css/style.css',
    './js/app.js',
    './manifest.json'
    // Добавляйте сюда новые HTML-страницы и важные картинки по мере создания
];

// Установка: кэшируем всё необходимое
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(URLS_TO_CACHE))
            .then(() => self.skipWaiting())
    );
});

// Активация: удаляем старые кэши
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(
                keys.filter(key => key !== CACHE_NAME)
                    .map(key => caches.delete(key))
            )
        ).then(() => self.clients.claim())
    );
});

// Fetch: сначала кэш, потом сеть
self.addEventListener('fetch', (event) => {
    // Пропускаем запросы к Google Apps Script (отправка форм) — они всегда идут в сеть
    if (event.request.url.includes('script.google.com')) return;

    event.respondWith(
        caches.match(event.request)
            .then(cached => {
                if (cached) return cached;

                return fetch(event.request)
                    .then(response => {
                        // Кэшируем успешные GET-ответы
                        if (event.request.method === 'GET' && response.status === 200) {
                            const clone = response.clone();
                            caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
                        }
                        return response;
                    })
                    .catch(() => {
                        // Если сеть недоступна и это навигационный запрос — отдаём offline.html
                        if (event.request.mode === 'navigate') {
                            return caches.match('./offline.html');
                        }
                    });
            })
    );
});
