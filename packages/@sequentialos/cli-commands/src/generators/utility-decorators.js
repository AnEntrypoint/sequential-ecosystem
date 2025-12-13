/**
 * utility-decorators.js
 *
 * Logging and caching decorators for task execution
 */

export function createUtilityDecorators() {
  return {
    withLogging(options = {}) {
      const { level = 'info', prefix = '' } = options;

      return (taskFn) => {
        return async function wrappedWithLogging(...args) {
          const taskName = prefix || taskFn.name || 'anonymous';
          const startTime = Date.now();

          console.log(`[${level.toUpperCase()}] ${taskName} started`, { input: args[0] });

          try {
            const result = await taskFn(...args);
            const duration = Date.now() - startTime;
            console.log(`[${level.toUpperCase()}] ${taskName} completed in ${duration}ms`);
            return result;
          } catch (error) {
            const duration = Date.now() - startTime;
            console.error(`[ERROR] ${taskName} failed after ${duration}ms`, error.message);
            throw error;
          }
        };
      };
    },

    withCaching(options = {}) {
      const { ttl = 60000, keyFn = (input) => JSON.stringify(input) } = options;
      const cache = new Map();

      return (taskFn) => {
        return async function wrappedWithCaching(input) {
          const key = keyFn(input);
          const cached = cache.get(key);

          if (cached && Date.now() - cached.timestamp < ttl) {
            return cached.value;
          }

          const result = await taskFn(input);
          cache.set(key, { value: result, timestamp: Date.now() });

          if (cache.size > 100) {
            const oldestKey = Array.from(cache.entries())
              .sort(([, a], [, b]) => a.timestamp - b.timestamp)[0][0];
            cache.delete(oldestKey);
          }

          return result;
        };
      };
    }
  };
}
