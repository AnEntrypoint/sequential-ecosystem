/**
 * retry-strategy.js
 *
 * Retry strategy with exponential backoff and jitter
 */

export function createRetryStrategy(options = {}) {
  const {
    maxRetries = 3,
    initialDelay = 1000,
    maxDelay = 30000,
    backoffMultiplier = 2,
    jitter = true,
    retryableErrors = [
      'ECONNREFUSED',
      'ECONNRESET',
      'ETIMEDOUT',
      'EHOSTUNREACH',
      'NetworkError',
      'TimeoutError'
    ]
  } = options;

  return {
    async executeWithRetry(fn, context = {}) {
      let lastError;
      let delay = initialDelay;

      for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
          const result = await fn();
          return {
            success: true,
            result,
            attempts: attempt + 1,
            finalDelay: 0
          };
        } catch (error) {
          lastError = error;

          if (!this.isRetryable(error)) {
            throw error;
          }

          if (attempt < maxRetries) {
            const actualDelay = Math.min(delay, maxDelay);
            const jitterValue = jitter ? Math.random() * actualDelay * 0.1 : 0;
            const totalDelay = actualDelay + jitterValue;

            await new Promise(resolve => setTimeout(resolve, totalDelay));

            delay = actualDelay * backoffMultiplier;
          }
        }
      }

      throw {
        originalError: lastError,
        message: `Failed after ${maxRetries + 1} attempts`,
        attempts: maxRetries + 1,
        retryable: true
      };
    },

    isRetryable(error) {
      const errorString = `${error.code || error.name || error.message}`;
      return this.retryableErrors.some(pattern => errorString.includes(pattern));
    },

    retryableErrors,

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
