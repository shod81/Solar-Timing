/* Solar Time Service Worker
 * - App-Shell (Cache-First): index.html, JS/CSS, Manifest, Icons
 * - Externe APIs (OSM Tiles, Nominatim): Network-Only (nicht cachen,
 *   Lizenz/Nutzungsbedingungen beachten + immer aktuell)
 * - Navigation-Fallback auf index.html (Offline-App-Shell)
 */
const CACHE_VERSION = 'solartime-v-__BUILD_HASH__'
const APP_SHELL = [
  './',
  './index.html',
  './manifest.webmanifest',
  './favicon.svg',
  './icon-192.png',
  './icon-512.png',
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_VERSION)
      .then((cache) => cache.addAll(APP_SHELL).catch(() => undefined))
      .then(() => self.skipWaiting()),
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((k) => k !== CACHE_VERSION).map((k) => caches.delete(k)),
        ),
      )
      .then(() => self.clients.claim()),
  )
})

self.addEventListener('fetch', (event) => {
  const req = event.request
  if (req.method !== 'GET') return

  const url = new URL(req.url)

  // Externe Quellen (OSM Tiles, Nominatim): nie cachen, immer Netzwerk.
  const isExternal =
    url.origin !== self.location.origin

  if (isExternal) {
    event.respondWith(fetch(req).catch(() => new Response('', { status: 504 })))
    return
  }

  // Navigationen → App-Shell (index.html) für Offline-Fähigkeit.
  if (req.mode === 'navigate') {
    event.respondWith(
      (async () => {
        try {
          const net = await fetch(req)
          const cache = await caches.open(CACHE_VERSION)
          cache.put('./index.html', net.clone()).catch(() => undefined)
          return net
        } catch {
          const cache = await caches.open(CACHE_VERSION)
          return (await cache.match('./index.html')) || (await cache.match('./'))
        }
      })(),
    )
    return
  }

  // Statische Assets: Cache-First mit Hintergrund-Update (stale-while-revalidate).
  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE_VERSION)
      const cached = await cache.match(req)
      const fetchPromise = fetch(req)
        .then((net) => {
          if (net && net.ok) cache.put(req, net.clone()).catch(() => undefined)
          return net
        })
        .catch(() => undefined)
      if (cached) return cached
      const net = await fetchPromise
      return net || new Response('', { status: 504 })
    })(),
  )
})
