// Self-unregistering fallback service worker to clear browser cache and stop 404 errors
self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', () => {
  self.registration.unregister()
    .then(() => self.clients.claim());
});
