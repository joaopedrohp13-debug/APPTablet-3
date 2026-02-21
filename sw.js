const CACHE_NAME = 'pomodoro-v1';
const assets = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  // Se você hospedar localmente, adicione aqui os scripts CSS/JS locais
  // './react.production.min.js',
  // './react-dom.production.min.js',
  // './babel.min.js',
  // './tailwind.min.css',
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(assets))
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;

  if (req.headers.get('accept')?.includes('text/html')) {
    // Network first para HTML
    e.respondWith(
      fetch(req)
        .then(res => {
          const resClone = res.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(req, resClone));
          return res;
        })
        .catch(() => caches.match(req).then(r => r || caches.match('./index.html')))
    );
  } else {
    // Cache first para outros assets
    e.respondWith(
      caches.match(req).then(cached => cached || fetch(req))
    );
  }
});
