/**
 * Mise — Service Worker
 *
 * Phase 1: Minimal registration only. The service worker is registered so
 * the PWA install prompt can appear, but no caching strategy is implemented yet.
 *
 * Phase 4 will implement a proper offline-first cache for:
 *   - The app shell (HTML, JS, CSS bundles)
 *   - Checklist config (so staff can view tasks without connectivity)
 *   - Queued submissions (submit offline, sync when back online)
 *
 * @author Joshua Bosen
 */

const CACHE_NAME = 'mise-v1';

// Install — activate immediately without waiting
self.addEventListener('install', (event) => {
  event.waitUntil(self.skipWaiting());
});

// Activate — claim clients immediately
self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Fetch — pass through to network (no caching in Phase 1)
self.addEventListener('fetch', () => {
  // Intentionally empty in Phase 1
  // Phase 4: implement stale-while-revalidate for app shell,
  // network-first for Supabase API calls, and background sync for submissions
  void CACHE_NAME;
});
