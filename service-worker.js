/* Cache the static PWA shell and its lesson data. */
'use strict';
const CACHE_NAME = 'codepath-static-v12';
const APP_SCOPE = new URL(self.registration.scope);
const ASSETS = [
  'index.html',
  'style.css?v=11',
  'lesson-content.css?v=11',
  'app.js?v=11',
  'static-app.js?v=1',
  'lesson-content.json',
  'html-tutorial.json',
  'manifest.json',
  'offline.html',
  'codepath.svg',
  'codepath-192.png',
  'codepath-512.png',
  'codepath-maskable-512.png'
].map(path => new URL(path, APP_SCOPE).href);
const OFFLINE_URL = new URL('offline.html', APP_SCOPE).href;
const APP_URL = new URL('index.html', APP_SCOPE).href;

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(
    keys.filter(key => key.startsWith('codepath-static-') && key !== CACHE_NAME).map(key => caches.delete(key))
  )).then(() => self.clients.claim()));
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== APP_SCOPE.origin || !url.pathname.startsWith(APP_SCOPE.pathname)) return;

  // Serve the static shell offline; use the small offline page if it was not cached.
  if (request.mode === 'navigate') {
    event.respondWith(fetch(request).catch(() => caches.open(CACHE_NAME).then(async cache => (await cache.match(APP_URL)) || cache.match(OFFLINE_URL))));
    return;
  }

  // Only the exact static allowlist above can be read from or written to this cache.
  if (!ASSETS.includes(url.href)) return;
  event.respondWith(caches.match(request).then(cached => cached || fetch(request).then(response => {
    if (response.ok && response.type === 'basic') {
      return caches.open(CACHE_NAME).then(cache => cache.put(request, response.clone())).then(() => response).catch(() => response);
    }
    return response;
  })));
});
