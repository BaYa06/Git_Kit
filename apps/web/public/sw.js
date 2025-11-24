// apps/web/public/sw.js

const CACHE_NAME = "gitkit-cache-v1";
const URLS_TO_CACHE = ["/", "/cabinet", "/login", "/register"];

// устанавливаем SW и кэшируем базовые страницы
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(URLS_TO_CACHE).catch(() => null);
    })
  );
});

// активируем новый SW и чистим старые кэши
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(
        names.map((name) => {
          if (name !== CACHE_NAME) {
            return caches.delete(name);
          }
          return null;
        })
      )
    )
  );
});

// отдаём кэш / сеть
self.addEventListener("fetch", (event) => {
  const { request } = event;

  // только GET и только http/https
  if (request.method !== "GET" || !request.url.startsWith("http")) {
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) {
        return cached;
      }
      return fetch(request)
        .then((response) => {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseClone).catch(() => {});
          });
          return response;
        })
        .catch(() => cached || Response.error());
    })
  );
});
