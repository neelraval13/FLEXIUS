// public/sw.js
// ─── Cache Config ────────────────────────────────────────────────────
const CACHE_VERSION = 2;
const STATIC_CACHE = `flexius-static-v${CACHE_VERSION}`;
const PAGES_CACHE = `flexius-pages-v${CACHE_VERSION}`;
const ALL_CACHES = [STATIC_CACHE, PAGES_CACHE];

// Max entries per cache to prevent unbounded growth
const MAX_STATIC_ENTRIES = 100;
const MAX_PAGES_ENTRIES = 20;

// Precached on install — the app shell + offline fallback
const PRECACHE_URLS = [
  "/offline.html",
  "/login",
  "/logo-144.webp",
  "/logo-96.webp",
  "/icons/icon-192.png",
  "/manifest.json",
];

// ─── Helpers ─────────────────────────────────────────────────────────

/**
 * Trim a cache to at most `max` entries (FIFO — oldest keys evicted first).
 */
const trimCache = async (cacheName, max) => {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  if (keys.length > max) {
    await Promise.all(
      keys.slice(0, keys.length - max).map((k) => cache.delete(k)),
    );
  }
};

/**
 * Cache-first strategy for static assets.
 */
const cacheFirst = async (request) => {
  const cached = await caches.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, response.clone());
      trimCache(STATIC_CACHE, MAX_STATIC_ENTRIES);
    }
    return response;
  } catch {
    // Offline and not cached — return empty response for non-critical assets
    return new Response("", {
      status: 408,
      statusText: "Cached asset unavailable offline",
    });
  }
};

/**
 * Network-first strategy for pages — falls back to cache, then offline page.
 */
const networkFirst = async (request) => {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(PAGES_CACHE);
      cache.put(request, response.clone());
      trimCache(PAGES_CACHE, MAX_PAGES_ENTRIES);
    }
    return response;
  } catch {
    // Network failed — try cache
    const cached = await caches.match(request);
    if (cached) return cached;

    // Nothing cached — show offline page for navigation requests
    if (request.mode === "navigate") {
      return caches.match("/offline.html");
    }

    // Non-navigation (e.g. an API data fetch) — just fail
    return new Response("Offline", { status: 503, statusText: "Offline" });
  }
};

// ─── Install ─────────────────────────────────────────────────────────

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting()),
  );
});

// ─── Activate ────────────────────────────────────────────────────────

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => !ALL_CACHES.includes(key))
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

// ─── Message ─────────────────────────────────────────────────────────
// Triggered by the update toast in sw-register.tsx

self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

// ─── Fetch ───────────────────────────────────────────────────────────

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests (POST to /api/chat, server actions, etc.)
  if (request.method !== "GET") return;

  // Skip auth routes — always hit network (session cookies, CSRF)
  if (url.pathname.startsWith("/api/auth")) return;

  // Skip chat API — always network (AI responses should never be stale)
  if (url.pathname.startsWith("/api/chat")) return;

  // Static assets — cache-first
  if (
    url.pathname.startsWith("/_next/static") ||
    url.pathname.startsWith("/icons") ||
    url.pathname.match(/\.(js|css|png|jpg|jpeg|svg|webp|woff2?|ico)$/)
  ) {
    event.respondWith(cacheFirst(request));
    return;
  }

  // Everything else (pages, API data) — network-first with offline fallback
  event.respondWith(networkFirst(request));
});
