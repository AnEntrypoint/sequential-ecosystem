import { delay, withRetry } from '@sequentialos/async-patterns';
/**
 * HTTP utility factory wrappers
 * Convenient helpers for HTTP client creation
 */

import { DEFAULTS } from '@sequentialos/core-config';
import { RetryConfig, createFetchWithRetry } from '@sequentialos/sequential-http-utils';

/**
 * Create fetch client with default retry configuration
 * @returns {Function} Fetch function with retry logic
 */
export function createDefaultFetchClient() {
  const retryConfig = new RetryConfig({
    maxRetries: DEFAULTS.RETRY.MAX_ATTEMPTS,
    initialDelayMs: DEFAULTS.RETRY.INITIAL_DELAY,
    maxDelayMs: DEFAULTS.RETRY.MAX_DELAY,
    backoffMultiplier: DEFAULTS.RETRY.BACKOFF_MULTIPLIER,
    jitterFraction: DEFAULTS.RETRY.JITTER_FRACTION,
  });

  return createFetchWithRetry(retryConfig);
}

/**
 * Create aggressive retry fetch client (5 attempts)
 * @returns {Function} Fetch function with aggressive retry
 */
export function createAggressiveRetryFetch() {
  const retryConfig = new RetryConfig({
    maxRetries: 5,
    initialDelayMs: 500,
    maxDelayMs: 10000,
  });

  return createFetchWithRetry(retryConfig);
}

/**
 * Create conservative retry fetch client (1 retry)
 * @returns {Function} Fetch function with minimal retry
 */
export function createConservativeRetryFetch() {
  const retryConfig = new RetryConfig({
    maxRetries: 1,
    initialDelayMs: 2000,
    maxDelayMs: 5000,
  });

  return createFetchWithRetry(retryConfig);
}

/**
 * Create fetch client with custom retry config
 * @param {Object} options - Custom retry options
 * @returns {Function} Fetch function with custom retry
 */
export function createCustomRetryFetch(options = {}) {
  const retryConfig = new RetryConfig({
    maxRetries: options.maxRetries ?? DEFAULTS.RETRY.MAX_ATTEMPTS,
    initialDelayMs: options.initialDelayMs ?? DEFAULTS.RETRY.INITIAL_DELAY,
    maxDelayMs: options.maxDelayMs ?? DEFAULTS.RETRY.MAX_DELAY,
    backoffMultiplier: options.backoffMultiplier ?? DEFAULTS.RETRY.BACKOFF_MULTIPLIER,
    jitterFraction: options.jitterFraction ?? DEFAULTS.RETRY.JITTER_FRACTION,
  });

  return createFetchWithRetry(retryConfig);
}

export default {
  createDefaultFetchClient,
  createAggressiveRetryFetch,
  createConservativeRetryFetch,
  createCustomRetryFetch,
};
