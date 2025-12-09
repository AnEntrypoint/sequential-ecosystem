import { createRateLimitMiddleware, createWebSocketRateLimiter } from '@sequential/rate-limiter';

export { createRateLimitMiddleware };

export function createWebSocketRateLimiterInstance() {
  return createWebSocketRateLimiter();
}

export function checkWebSocketRateLimit(ip, limiter) {
  return limiter.checkLimit(ip);
}
