/**
 * Error Recovery Core - Policy Module
 * Error recovery policy factory
 */

import { createRetryStrategy, createCircuitBreaker, createFallbackStrategy } from './error-recovery-strategies.js';

export function createErrorRecoveryPolicy(options = {}) {
  const {
    strategy = 'exponential',
    maxAttempts = 3,
    timeout = 5000
  } = options;

  return {
    async apply(taskFn, taskName = 'task') {
      const retryStrategy = createRetryStrategy({
        maxRetries: maxAttempts - 1,
        initialDelay: 100,
        maxDelay: timeout
      });

      const circuitBreaker = createCircuitBreaker();

      return await circuitBreaker.execute(async () => {
        return await retryStrategy.executeWithRetry(taskFn);
      });
    },

    async applyWithFallback(primaryFn, fallbackFn, context = {}) {
      const fallback = createFallbackStrategy();
      fallback.registerFallback('ECONNREFUSED', fallbackFn);
      fallback.registerFallback('NetworkError', fallbackFn);

      return await fallback.executeWithFallback(primaryFn, context);
    }
  };
}
