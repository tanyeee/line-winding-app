const BUILD_ID = "5500f8d8d646a6dc916fd144d95e44e1cb2c3392685f7a898f8fb742e4bf1ccc"
const PRECACHE = ["assets/index-CN8xvZtn.js","assets/index-D9NPTV-r.css","icons/reel-180.png","icons/reel-192.png","icons/reel-512.png","index.html","manifest.webmanifest"]
const prefix = 'line-winding:' + self.registration.scope + ':'
const cacheName = prefix + BUILD_ID
const shell = new URL('index.html', self.registration.scope).href
const assets = PRECACHE.map(path => new URL(path, self.registration.scope).href)
const knownAssets = new Set(assets)

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(cacheName)
    try {
      await cache.addAll(assets.map(url => new Request(url, { cache: 'reload' })))
    } catch (error) {
      await caches.delete(cacheName)
      throw error
    }
  })())
})

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    for (const name of await caches.keys()) {
      if (name.startsWith(prefix) && name !== cacheName) await caches.delete(name)
    }
    await self.clients.claim()
  })())
})

self.addEventListener('message', event => {
  if (event.data === 'ACTIVATE_UPDATE') event.waitUntil(self.skipWaiting())
})

self.addEventListener('fetch', event => {
  const { request } = event
  if (request.method !== 'GET' || !request.url.startsWith(self.registration.scope)) return
  if (request.mode === 'navigate') {
    const url = new URL(request.url)
    url.search = ''
    if (url.href !== self.registration.scope && url.href !== shell) return
  } else if (!knownAssets.has(request.url)) return
  event.respondWith((async () => {
    const cache = await caches.open(cacheName)
    const cached = await cache.match(request.mode === 'navigate' ? shell : request)
    return cached ?? fetch(request)
  })())
})
