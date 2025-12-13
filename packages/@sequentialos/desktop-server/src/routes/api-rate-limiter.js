/**
 * Rate limiter with sliding window
 */
export class RateLimiter {
  constructor(limit = 5, windowMs = 60000) {
    this.limit = limit;
    this.windowMs = windowMs;
    this.requests = new Map();
  }

  check(identifier) {
    const now = Date.now();

    if (!this.requests.has(identifier)) {
      this.requests.set(identifier, []);
    }

    const times = this.requests.get(identifier);
    const validTimes = times.filter(t => now - t < this.windowMs);

    if (validTimes.length >= this.limit) {
      return {
        allowed: false,
        remaining: 0,
        resetAt: Math.max(...validTimes) + this.windowMs
      };
    }

    validTimes.push(now);
    this.requests.set(identifier, validTimes);

    return {
      allowed: true,
      remaining: this.limit - validTimes.length,
      resetAt: now + this.windowMs,
      limit: this.limit
    };
  }

  reset(identifier) {
    this.requests.delete(identifier);
  }

  resetAll() {
    this.requests.clear();
  }
}

/**
 * Create rate limiter instance
 */
export function createRateLimiter(limit, windowMs) {
  return new RateLimiter(limit, windowMs);
}
