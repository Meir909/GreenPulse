const TILE_CACHE = "greenpulse-map-tiles-v1";
const APP_CACHE = "greenpulse-app-v1";

// Кешируем тайлы карты при запросе
self.addEventListener("fetch", (event) => {
  const url = event.request.url;

  // Кешируем тайлы OpenStreetMap / CartoDB
  if (
    url.includes("basemaps.cartocdn.com") ||
    url.includes("tile.openstreetmap.org") ||
    url.includes("tiles.stadiamaps.com")
  ) {
    event.respondWith(
      caches.open(TILE_CACHE).then(async (cache) => {
        const cached = await cache.match(event.request);
        if (cached) return cached;
        try {
          const response = await fetch(event.request);
          if (response.ok) cache.put(event.request, response.clone());
          return response;
        } catch {
          return cached || new Response("", { status: 503 });
        }
      })
    );
    return;
  }

  // Для остальных запросов — network first, fallback to cache
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});

// Активация — удаляем старые кеши
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k !== TILE_CACHE && k !== APP_CACHE)
          .map((k) => caches.delete(k))
      )
    )
  );
});
