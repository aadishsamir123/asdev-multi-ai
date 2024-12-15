// This is the "Offline copy of pages" service worker

const CACHE = "asdev-multiai-v5.0.0.0";

// Import Workbox
importScripts(
  "https://storage.googleapis.com/workbox-cdn/releases/5.1.2/workbox-sw.js"
);

// Listen for skipWaiting messages (Optional, for future use if needed)
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting(); // Automatically activates the new service worker immediately if skipWaiting is called
  }
});

// Cache strategy: Stale While Revalidate
workbox.routing.registerRoute(
  new RegExp("/*"),
  new workbox.strategies.StaleWhileRevalidate({
    cacheName: CACHE,
  })
);
