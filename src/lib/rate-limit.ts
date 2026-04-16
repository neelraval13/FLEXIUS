// src/lib/rate-limit.ts

/**
 * In-memory sliding-window rate limiter.
 * No Redis needed — works on a single Vercel serverless instance.
 * Each instance has its own window, so limits are approximate under
 * high concurrency, but sufficient to prevent abuse.
 */

interface RateLimitEntry {
  timestamps: number[];
}

const store = new Map<string, RateLimitEntry>();

// Clean up stale entries every 5 minutes to prevent memory leak
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000;

setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store) {
    entry.timestamps = entry.timestamps.filter((t) => now - t < 60_000);
    if (entry.timestamps.length === 0) store.delete(key);
  }
}, CLEANUP_INTERVAL_MS);

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetInMs: number;
}

/**
 * Check if a request is allowed under the rate limit.
 *
 * @param key — unique identifier (e.g. userId)
 * @param maxRequests — max requests per window
 * @param windowMs — window size in milliseconds (default 60s)
 */
export const checkRateLimit = (
  key: string,
  maxRequests: number,
  windowMs: number = 60_000,
): RateLimitResult => {
  const now = Date.now();
  const entry = store.get(key) ?? { timestamps: [] };

  // Remove timestamps outside the window
  entry.timestamps = entry.timestamps.filter((t) => now - t < windowMs);

  if (entry.timestamps.length >= maxRequests) {
    const oldestInWindow = entry.timestamps[0];
    const resetInMs = windowMs - (now - oldestInWindow);

    return {
      allowed: false,
      remaining: 0,
      resetInMs,
    };
  }

  // Allow and record
  entry.timestamps.push(now);
  store.set(key, entry);

  return {
    allowed: true,
    remaining: maxRequests - entry.timestamps.length,
    resetInMs: 0,
  };
};
