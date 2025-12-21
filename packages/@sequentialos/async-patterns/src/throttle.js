/**
 * Throttle a function - ensures it's called at most once per time period
 *
 * @param {Function} fn - Function to throttle
 * @param {number} ms - Minimum time between calls in milliseconds
 * @returns {Function} Throttled function
 */
export function throttle(fn, ms) {
  let lastCall = 0;
  return function throttled(...args) {
    const now = Date.now();
    if (now - lastCall >= ms) {
      lastCall = now;
      return fn(...args);
    }
  };
}
