// Guarda la app en el teléfono para que abra al instante y funcione sin internet.
// Sirve lo guardado y, si hay conexión, actualiza en segundo plano (la versión nueva aparece al abrir la próxima vez).
// Al cambiar archivos de la app, subir el número de CACHE.
const CACHE = 'truco-v1';
const SHELL = ['./', './index.html', './manifest.webmanifest', './icons/icon.svg', './icons/icon-192.png', './icons/icon-512.png', './icons/apple-touch-icon.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  const network = fetch(e.request).then(async (res) => {
    if (res.ok || res.type === 'opaque') {
      const copy = res.clone();
      const cache = await caches.open(CACHE);
      await cache.put(e.request, copy);
    }
    return res;
  });
  e.respondWith(caches.match(e.request, { ignoreSearch: true }).then((hit) => hit || network));
  e.waitUntil(network.then(() => {}, () => {}));
});
