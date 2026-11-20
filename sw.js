// Service worker: permite que la app abra sin internet.
// Si cambias algo en index.html, sube el número de VERSION para que se actualice en los teléfonos.
const VERSION = 'finanzas-basicas-v1';
const ARCHIVOS = [
  './',
  './index.html',
  './manifest.json',
  './icons/logo-cdi.png',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/apple-touch-icon.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(ARCHIVOS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then((cache) => {
      if (cache) return cache;
      return fetch(e.request).then((resp) => {
        if (resp && resp.status === 200 && new URL(e.request.url).origin === location.origin) {
          const copia = resp.clone();
          caches.open(VERSION).then((c) => c.put(e.request, copia));
        }
        return resp;
      }).catch(() => caches.match('./index.html'));
    })
  );
});
