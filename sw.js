const CACHE = 'itelsa-accesos-v1'
const ARCHIVOS = [
  '/',
  '/index.html',
  '/styles.css?v=5',
  '/itelsa-logo.png',
  '/itelsa-icon.png',
  '/favicon.png',
  '/icon-192.png',
  '/icon-512.png',
]

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ARCHIVOS)))
  self.skipWaiting()
})

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((claves) => Promise.all(claves.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  )
})

// Primero la red; la copia guardada solo si no hay conexión
self.addEventListener('fetch', (e) => {
  const req = e.request
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return

  e.respondWith(
    fetch(req)
      .then((res) => {
        const copia = res.clone()
        caches.open(CACHE).then((c) => c.put(req, copia))
        return res
      })
      .catch(() => caches.match(req).then((r) => r || caches.match('/index.html')))
  )
})
