/**
 * Cache Expiration Handler
 * TTL (Time To Live) expiration management
 */

export function createExpirationHandler(cache, expirations, ttl) {
  return {
    cleanup() {
      const now = Date.now();
      for (const [key, expiresAt] of expirations.entries()) {
        if (now >= expiresAt) {
          cache.delete(key);
          expirations.delete(key);
        }
      }
    },

    setExpiration(key) {
      const now = Date.now();
      expirations.set(key, now + ttl);
    },

    isExpired(key) {
      this.cleanup();
      return !cache.has(key);
    }
  };
}
