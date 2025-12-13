import { delay, withRetry } from '@sequentialos/async-patterns';
/**
 * Middleware factory wrappers
 * Convenient helpers for middleware creation with defaults
 */

import { DEFAULTS } from '@sequentialos/core-config';
import {
  createRateLimitMiddleware,
  createWebSocketRateLimiter
} from '@sequentialos/input-sanitization';

/**
 * Create rate limiter middleware with sensible defaults
 * @param {Object} options - Custom options
 * @returns {Function} Middleware function
 */
export function createDefaultRateLimiter(options = {}) {
  const maxRequests = options.maxRequests ?? DEFAULTS.PAGINATION.MAX_LIMIT;
  const windowMs = options.windowMs ?? DEFAULTS.HTTP.REQUEST_TIMEOUT;

  return createRateLimitMiddleware(maxRequests, windowMs);
}

/**
 * Create strict rate limiter (10 requests per minute)
 * @returns {Function} Middleware function
 */
export function createStrictRateLimiter() {
  return createRateLimitMiddleware(10, 60000);
}

/**
 * Create permissive rate limiter (1000 requests per minute)
 * @returns {Function} Middleware function
 */
export function createPermissiveRateLimiter() {
  return createRateLimitMiddleware(1000, 60000);
}

/**
 * Create WebSocket rate limiter with defaults
 * @returns {Object} WebSocket rate limiter
 */
export function createDefaultWebSocketRateLimiter() {
  return createWebSocketRateLimiter();
}

export default {
  createDefaultRateLimiter,
  createStrictRateLimiter,
  createPermissiveRateLimiter,
  createDefaultWebSocketRateLimiter
};
