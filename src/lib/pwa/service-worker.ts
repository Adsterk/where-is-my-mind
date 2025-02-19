/// <reference lib="webworker" />

declare const self: ServiceWorkerGlobalScope

const CACHE_NAME = 'mood-tracker-v1'

const STATIC_ASSETS = [
  '/',
  '/dashboard',
  '/form/mood-entry',
  '/settings',
  '/manifest.json',
  '/offline.html',
] as const

const ICON_ASSETS = [
  '/icons/icon-72x72.png',
  '/icons/icon-96x96.png',
  '/icons/icon-128x128.png',
  '/icons/icon-144x144.png',
  '/icons/icon-152x152.png',
  '/icons/icon-192x192.png',
  '/icons/icon-384x384.png',
  '/icons/icon-512x512.png',
] as const

const urlsToCache = [...STATIC_ASSETS, ...ICON_ASSETS]

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache))
  )
  // Activate immediately
  void self.skipWaiting()
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => 
      Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      )
    )
  )
  // Take control of all pages immediately
  void self.clients.claim()
})

// Fetch event - serve from cache, falling back to network
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return

  // Skip chrome-extension requests
  if (event.request.url.startsWith('chrome-extension://')) return

  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) return

  event.respondWith(
    caches.match(event.request).then((response) => {
      // Return cached response if found
      if (response) return response

      // Otherwise fetch from network
      return fetch(event.request).then((response) => {
        // Check if we received a valid response
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response
        }

        // Clone the response
        const responseToCache = response.clone()

        // Cache the response
        void caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache)
        })

        return response
      }).catch(() => {
        // If offline and requesting a page, show offline page
        if (event.request.mode === 'navigate') {
          return caches.match('/offline.html')
        }
        return undefined
      })
    })
  )
}) 