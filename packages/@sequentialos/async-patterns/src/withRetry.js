/**
 * Retry function with exponential backoff
 *
 * @param {Function} fn - Async function to retry
 * @param {Object} options - Retry options
 * @param {number} options.maxAttempts - Maximum number of attempts (default: 3)
 * @param {number} options.delayMs - Initial delay in milliseconds (default: 100)
 * @param {number} options.backoffMultiplier - Backoff multiplier (default: 2)
 * @param {number} options.timeout - Optional timeout per attempt in ms
 * @param {Function} options.onRetry - Optional callback on retry
 * @returns {Promise} Result of successful attempt
 */
export async function withRetry(fn, options = {}) {
  const {
    maxAttempts = 3,
    delayMs = 100,
    backoffMultiplier = 2,
    timeout = null,
    onRetry = null
  } = options;

  let lastError;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const result = timeout
        ? await Promise.race([
          fn(),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Timeout')), timeout)
          )
        ])
        : await fn();
      return result;
    } catch (error) {
      lastError = error;
      if (attempt < maxAttempts) {
        const delay = delayMs * Math.pow(backoffMultiplier, attempt - 1);
        if (onRetry) {
          onRetry(attempt, delay, error);
        }
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  throw lastError;
}

/**
 * Alias for withRetry
 */
export async function retry(fn, options = {}) {
  return withRetry(fn, options);
}
