import { createRateLimitMiddleware, createWebSocketRateLimiter } from '@sequential/rate-limiter';

export { createRateLimitMiddleware, createWebSocketRateLimiter };

export function checkWebSocketRateLimit(ip, limiter) {
  return limiter.checkLimit(ip);
}
