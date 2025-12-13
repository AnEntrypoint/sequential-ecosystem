/**
 * Retry Strategy
 * Retry strategy with exponential backoff and jitter
 *
 * Delegates to:
 * - retry-executor: Retry execution with backoff
 * - retry-error-classifier: Error classification for retryability
 */

import { createRetryExecutor } from './retry-executor.js';
import { createRetryErrorClassifier } from './retry-error-classifier.js';

export function createRetryStrategy(options = {}) {
  const {
    maxRetries = 3,
    initialDelay = 1000,
    maxDelay = 30000,
    backoffMultiplier = 2,
    jitter = true,
    retryableErrors
  } = options;

  const executor = createRetryExecutor({
    maxRetries,
    initialDelay,
    maxDelay,
    backoffMultiplier,
    jitter
  });

  const classifier = createRetryErrorClassifier({
    retryableErrors: retryableErrors || [
      'ECONNREFUSED',
      'ECONNRESET',
      'ETIMEDOUT',
      'EHOSTUNREACH',
      'NetworkError',
      'TimeoutError'
    ]
  });

  return {
    async executeWithRetry(fn, context = {}) {
      return executor.executeWithRetry(fn, (error) => classifier.isRetryable(error));
    },

    isRetryable: classifier.isRetryable.bind(classifier),
    retryableErrors: classifier.getRetryableErrors(),

    getRetryConfig() {
      return {
        maxRetries,
        initialDelay,
        maxDelay,
        backoffMultiplier,
        jitter
      };
    }
  };
}
