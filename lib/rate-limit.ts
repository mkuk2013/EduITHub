/**
 * Minimal in-memory token-bucket rate limiter for route handlers / server actions.
 *
 * Usage:
 *   const { allowed, remaining, resetMs } = checkRateLimit(`login:${ip}`, 5, 60_000);
 *   if (!allowed) return Response.json({ error: "Too many requests" }, { status: 429 });
 *
 * Note: buckets live in process memory, so limits are per-instance. For a
 * multi-instance production deployment, replace with a shared store (Redis).
 */

interface Bucket {
  tokens: number;
  lastRefill: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  /** Milliseconds until at least one token is available again. */
  resetMs: number;
}

const buckets = new Map<string, Bucket>();
let lastCleanup = 0;
const CLEANUP_EVERY_MS = 5 * 60 * 1000;

function cleanup(now: number, windowMs: number): void {
  if (now - lastCleanup < CLEANUP_EVERY_MS) return;
  lastCleanup = now;
  for (const [key, bucket] of buckets) {
    if (now - bucket.lastRefill > windowMs * 2) {
      buckets.delete(key);
    }
  }
}

export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number,
): RateLimitResult {
  const now = Date.now();
  cleanup(now, windowMs);

  const refillPerMs = limit / windowMs;
  let bucket = buckets.get(key);

  if (!bucket) {
    bucket = { tokens: limit, lastRefill: now };
    buckets.set(key, bucket);
  } else {
    const elapsed = now - bucket.lastRefill;
    bucket.tokens = Math.min(limit, bucket.tokens + elapsed * refillPerMs);
    bucket.lastRefill = now;
  }

  if (bucket.tokens >= 1) {
    bucket.tokens -= 1;
    return {
      allowed: true,
      remaining: Math.floor(bucket.tokens),
      resetMs: 0,
    };
  }

  const resetMs = Math.ceil((1 - bucket.tokens) / refillPerMs);
  return { allowed: false, remaining: 0, resetMs };
}
