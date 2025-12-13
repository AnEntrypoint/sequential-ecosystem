/**
 * recovery-decorator.js
 *
 * Error recovery decorator with exponential backoff and retry logic
 */

export function createRecoveryDecorator() {
  return {
    withErrorRecovery(options = {}) {
      const {
        maxRetries = 3,
        initialDelay = 1000,
        maxDelay = 30000,
        backoffMultiplier = 2,
        jitter = true,
        retryableErrors = ['ECONNREFUSED', 'ETIMEDOUT', 'ENOTFOUND']
      } = options;

      return (taskFn) => {
        return async function wrappedWithErrorRecovery(...args) {
          let lastError;
          let delay = initialDelay;

          for (let attempt = 0; attempt <= maxRetries; attempt++) {
            try {
              return await taskFn(...args);
            } catch (error) {
              lastError = error;

              const isRetryable = retryableErrors.some(type =>
                error.code === type || error.message?.includes(type)
              );

              if (attempt === maxRetries || !isRetryable) {
                throw error;
              }

              const jitterMs = jitter ? Math.random() * 1000 : 0;
              const waitTime = Math.min(delay + jitterMs, maxDelay);
              await new Promise(r => setTimeout(r, waitTime));
              delay = Math.min(delay * backoffMultiplier, maxDelay);
            }
          }

          throw lastError;
        };
      };
    }
  };
}
