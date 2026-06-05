// VaideVan Service Worker v4 — Estratégia por tipo de asset
// Cache-first: JS/CSS/imagens (hashed); Network-first: HTML nav; Network-only: API
const SHELL_CACHE   = 'vdv-shell-v4';
const ASSET_CACHE   = 'vdv-assets-v4';
const IMAGE_CACHE   = 'vdv-images-v4';
const FONT_CACHE    = 'vdv-fonts-v4';
const MAX_IMG       = 60;  // max imagens no cache
const MAX_FONT      = 30;

const PRECACHE_URLS = [
  '/',
  '/offline.html',
  '/manifest.json',
  '/favicon.ico',
  '/favicon.svg',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/icons/icon-192x192-maskable.png',
  '/icons/icon-512x512-maskable.png',
];

// ── INSTALL ──────────────────────────────────────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE).then((cache) =>
      Promise.allSettled(PRECACHE_URLS.map((u) => cache.add(u).catch(() => {})))
    )
  );
  self.skipWaiting();
});

// ── ACTIVATE ─────────────────────────────────────────────────────────────────
self.addEventListener('activate', (event) => {
  const LIVE = new Set([SHELL_CACHE, ASSET_CACHE, IMAGE_CACHE, FONT_CACHE]);
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => !LIVE.has(k)).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// ── FETCH ─────────────────────────────────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Nunca interceptar API
  if (url.pathname.startsWith('/api/')) return;

  // Nunca interceptar requests autenticados (portal)
  if (url.pathname.startsWith('/portal')) return;

  // Cross-origin: apenas fontes do Google
  if (url.origin !== self.location.origin) {
    if (url.hostname === 'fonts.gstatic.com') {
      event.respondWith(cacheFirst(event.request, FONT_CACHE, MAX_FONT));
    }
    return;
  }

  // JS e CSS com hash (vite build) → cache-first, TTL longo
  if (/\.(js|css)(\?.*)?$/.test(url.pathname) && /assets\//.test(url.pathname)) {
    event.respondWith(cacheFirst(event.request, ASSET_CACHE, 200));
    return;
  }

  // Imagens → cache-first com limite de entradas
  if (/\.(webp|png|jpg|jpeg|gif|svg|ico|avif)(\?.*)?$/.test(url.pathname)) {
    event.respondWith(cacheFirst(event.request, IMAGE_CACHE, MAX_IMG));
    return;
  }

  // Fontes → cache-first
  if (/\.(woff2?|ttf|otf|eot)(\?.*)?$/.test(url.pathname)) {
    event.respondWith(cacheFirst(event.request, FONT_CACHE, MAX_FONT));
    return;
  }

  // Navegação HTML → network-first, fallback para shell + offline
  if (event.request.mode === 'navigate') {
    event.respondWith(networkFirstNavigate(event.request));
    return;
  }

  // Tudo mais: stale-while-revalidate
  event.respondWith(staleWhileRevalidate(event.request, SHELL_CACHE));
});

// ── ESTRATÉGIAS ───────────────────────────────────────────────────────────────
async function cacheFirst(request, cacheName, maxEntries) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response && response.status === 200) {
      await trimCache(cache, maxEntries - 1);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return new Response('', { status: 503 });
  }
}

async function networkFirstNavigate(request) {
  try {
    const response = await fetch(request);
    if (response && response.status === 200) {
      const cache = await caches.open(SHELL_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cache = await caches.open(SHELL_CACHE);
    return (await cache.match('/')) || (await cache.match('/offline.html')) || new Response('Offline', { status: 503 });
  }
}

async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  const fetchPromise = fetch(request)
    .then((response) => {
      if (response && response.status === 200) cache.put(request, response.clone());
      return response;
    })
    .catch(() => cached);
  return cached || fetchPromise;
}

async function trimCache(cache, maxEntries) {
  const keys = await cache.keys();
  if (keys.length > maxEntries) {
    await Promise.all(keys.slice(0, keys.length - maxEntries).map((k) => cache.delete(k)));
  }
}
