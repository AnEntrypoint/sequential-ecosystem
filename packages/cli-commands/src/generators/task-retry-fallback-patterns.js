/**
 * Task Retry & Fallback Patterns
 * Resilience patterns for handling failures
 */

export function createRetryPattern() {
  return {
    retry(taskFn, options = {}) {
      const { maxRetries = 3, initialDelay = 1000, backoffMultiplier = 2 } = options;

      return async function taskWithRetry(...args) {
        let lastError;
        let delay = initialDelay;

        for (let attempt = 0; attempt <= maxRetries; attempt++) {
          try {
            return await taskFn(...args);
          } catch (error) {
            lastError = error;
            if (attempt < maxRetries) {
              await new Promise(r => setTimeout(r, delay));
              delay = Math.min(delay * backoffMultiplier, 30000);
            }
          }
        }

        throw lastError;
      };
    }
  };
}

export function createFallbackPattern() {
  return {
    fallback(taskFn, fallbackFn) {
      return async function taskWithFallback(...args) {
        try {
          return await taskFn(...args);
        } catch (error) {
          return await fallbackFn(...args);
        }
      };
    }
  };
}
