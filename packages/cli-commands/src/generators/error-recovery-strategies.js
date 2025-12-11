/**
 * error-recovery-strategies.js - Error Recovery Facade
 *
 * Delegates to focused modules:
 * - retry-strategy: Exponential backoff retry logic
 * - circuit-breaker: Circuit breaker pattern
 * - fallback-strategy: Fallback recovery handler
 */

import { createRetryStrategy as createRetry } from './retry-strategy.js';
import { createCircuitBreaker as createCB } from './circuit-breaker.js';
import { createFallbackStrategy as createFallback } from './fallback-strategy.js';

export function createRetryStrategy(options) {
  return createRetry.call(this, options);
}

export function createCircuitBreaker(options) {
  return createCB.call(this, options);
}

export function createFallbackStrategy() {
  return createFallback.call(this);
}
