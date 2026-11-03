// Service Worker: App-Shell vorab cachen, Inhalte mit passender Strategie
const VERSION = 'v1-2026-11-03';
const SHELL = `brainbite-shell-${VERSION}`;
const CONTENT = 'brainbite-content';

const SHELL_FILES = [
  './',
  './index.html',
  './manifest.webmanifest',
  './css/tokens.css',
  './css/base.css',
  './css/components.css',
  './js/app.js',
  './js/core/store.js',
  './js/core/router.js',
  './js/core/content.js',
  './js/core/feed.js',
  './js/core/tts.js',
  './js/core/i18n.js',
  './js/views/components.js',
  './js/views/feed.js',
  './js/views/article.js',
  './js/views/saved.js',
  './js/views/progress.js',
  './js/views/settings.js',
  './js/views/onboarding.js',
  './i18n/de.json',
  './i18n/en.json',
  './assets/fonts/inter-latin-400-normal.woff2',
  './assets/fonts/inter-latin-500-normal.woff2',
  './assets/fonts/inter-latin-600-normal.woff2',
  './assets/fonts/inter-latin-700-normal.woff2',
  './assets/fonts/source-serif-4-latin-400-normal.woff2',
  './assets/fonts/source-serif-4-latin-600-normal.woff2',
  './assets/img/brainbite-app-icon.svg',
  './assets/icons/icon-192.png',
  './assets/icons/apple-touch-icon.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(SHELL).then((c) => c.addAll(SHELL_FILES)));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith('brainbite-shell-') && k !== SHELL).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  if (event.request.method !== 'GET' || url.origin !== location.origin) return;

  // Katalog: Netzwerk zuerst, Cache als Fallback
  if (url.pathname.endsWith('/content/index.json')) {
    event.respondWith(networkFirst(event.request));
    return;
  }
  // Themen: Cache zuerst, im Hintergrund aktualisieren
  if (url.pathname.includes('/content/topics/')) {
    event.respondWith(staleWhileRevalidate(event.request));
    return;
  }
  // App-Shell: Cache zuerst
  event.respondWith(caches.match(event.request, { ignoreSearch: true }).then((hit) => hit || fetch(event.request)));
});

async function networkFirst(request) {
  const cache = await caches.open(CONTENT);
  try {
    const res = await fetch(request);
    if (res.ok) cache.put(request, res.clone());
    return res;
  } catch {
    return (await cache.match(request)) || Response.error();
  }
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(CONTENT);
  const cached = await cache.match(request);
  const fresh = fetch(request).then((res) => {
    if (res.ok) cache.put(request, res.clone());
    return res;
  }).catch(() => cached);
  return cached || fresh;
}
