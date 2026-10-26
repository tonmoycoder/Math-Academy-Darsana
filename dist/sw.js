/* ---------------------------------------------------------------------------
   ম্যাথ একাডেমি — service worker (v10.1)

   Two jobs, nothing else:
     1. make the site installable, so Chrome/Android and iOS give it a durable
        autoplay grant and an icon on the home screen;
     2. serve repeat visits and offline visits without a network.

   Rules that keep it safe:
     • navigations are NETWORK-FIRST (3 s timeout) — a deploy is visible at once
     • /api/* is never cached and never intercepted
     • only same-origin GETs of static files are cached, plus /assets/* (immutable)
     • a new SW takes over immediately (skipWaiting) and old caches are deleted
     • any unexpected error falls through to the network — no blank pages, ever
--------------------------------------------------------------------------- */
const VERSION = 'ma-v10.1';
const SHELL = VERSION + '-shell';
const RUNTIME = VERSION + '-rt';

const SHELL_FILES = [
  '/',
  '/manifest.webmanifest',
  '/icon-192.png',
  '/icon-512.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(SHELL);
    await Promise.allSettled(SHELL_FILES.map((f) => cache.add(new Request(f, { cache: 'reload' }))));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((k) => !k.startsWith(VERSION)).map((k) => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  if (req.method !== 'GET') return;
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith('/api/')) return;          // never cache data

  // ---- navigations: network first, cache as fallback
  if (req.mode === 'navigate') {
    event.respondWith((async () => {
      const cache = await caches.open(SHELL);
      try {
        const fresh = await Promise.race([
          fetch(req),
          new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 3000)),
        ]);
        if (fresh && fresh.ok) cache.put(req, fresh.clone());
        return fresh;
      } catch {
        return (await cache.match(req)) || (await cache.match('/')) || Response.error();
      }
    })());
    return;
  }

  // ---- static files: cache first (they are hashed or small), refresh in background
  event.respondWith((async () => {
    const cache = await caches.open(RUNTIME);
    const hit = await cache.match(req);
    if (hit) {
      fetch(req).then((r) => { if (r && r.ok) cache.put(req, r.clone()); }).catch(() => {});
      return hit;
    }
    try {
      const res = await fetch(req);
      if (res && res.ok && res.type === 'basic') cache.put(req, res.clone());
      return res;
    } catch {
      return Response.error();
    }
  })());
});
