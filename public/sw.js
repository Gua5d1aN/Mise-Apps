// Mise Service Worker — Phase 3: minimal registration only
const CACHE_NAME = 'mise-v1';
self.addEventListener('install', e => e.waitUntil(self.skipWaiting()));
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));
self.addEventListener('fetch', () => { void CACHE_NAME; });
