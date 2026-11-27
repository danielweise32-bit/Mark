// Service worker: păstrează aplicația în cache ca să pornească și offline.
const CACHE = 'nutriscan-v2';
const SHELL = ['./', 'index.html', 'style.css', 'app.js', 'nutriscore.js', 'insights.js', 'vendor/zxing.min.js', 'manifest.webmanifest', 'icon.svg'];
self.addEventListener('install', (e) => e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting())));
self.addEventListener('activate', (e) => e.waitUntil(
  caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim())
));
self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (url.origin !== location.origin) return; // API-ul merge mereu la rețea
  e.respondWith(caches.match(e.request).then((r) => r || fetch(e.request)));
});
