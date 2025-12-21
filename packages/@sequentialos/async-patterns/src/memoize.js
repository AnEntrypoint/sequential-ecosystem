/**
 * Memoize function results with optional TTL
 *
 * @param {Function} fn - Function to memoize
 * @param {number} ttl - Time to live in milliseconds (optional)
 * @returns {Function} Memoized function
 */
export function memoize(fn, ttl = null) {
  const cache = new Map();

  return function memoized(...args) {
    const key = JSON.stringify(args);

    if (cache.has(key)) {
      const { value, timestamp } = cache.get(key);
      if (!ttl || Date.now() - timestamp < ttl) {
        return value;
      }
      cache.delete(key);
    }

    const result = fn(...args);
    cache.set(key, { value: result, timestamp: Date.now() });
    return result;
  };
}
