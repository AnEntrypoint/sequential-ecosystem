/**
 * Wrap a function with a timeout
 *
 * @param {Function} fn - Async function to execute
 * @param {number} ms - Timeout in milliseconds
 * @returns {Promise} Result or timeout error
 */
export async function withTimeout(fn, ms) {
  return Promise.race([
    fn(),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error(`Operation timed out after ${ms}ms`)), ms)
    )
  ]);
}
