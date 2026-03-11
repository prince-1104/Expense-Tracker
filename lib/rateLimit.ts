type Key = string;

interface Bucket {
  tokens: number;
  lastRefill: number;
}

const buckets = new Map<Key, Bucket>();

interface RateLimitOptions {
  /**
   * Maximum number of requests allowed in the given interval.
   */
  limit: number;
  /**
   * Interval in milliseconds.
   */
  intervalMs: number;
}

export function rateLimit(key: Key, options: RateLimitOptions): boolean {
  const now = Date.now();
  const existing = buckets.get(key);

  if (!existing) {
    buckets.set(key, { tokens: options.limit - 1, lastRefill: now });
    return true;
  }

  const elapsed = now - existing.lastRefill;
  if (elapsed > options.intervalMs) {
    existing.tokens = options.limit - 1;
    existing.lastRefill = now;
    return true;
  }

  if (existing.tokens <= 0) {
    return false;
  }

  existing.tokens -= 1;
  return true;
}

