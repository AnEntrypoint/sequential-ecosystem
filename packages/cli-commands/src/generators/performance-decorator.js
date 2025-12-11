/**
 * performance-decorator.js
 *
 * Performance tracking and timeout decorators for task execution
 */

export function createPerformanceDecorator() {
  return {
    withPerformanceTracking(options = {}) {
      const { namespace = 'task' } = options;

      return (taskFn) => {
        return async function wrappedWithTracking(...args) {
          const startTime = Date.now();
          const startMem = process.memoryUsage().heapUsed;

          try {
            const result = await taskFn(...args);
            const duration = Date.now() - startTime;
            const memUsed = process.memoryUsage().heapUsed - startMem;

            return {
              ...result,
              __metrics: { duration, memUsed, success: true, timestamp: new Date().toISOString() }
            };
          } catch (error) {
            const duration = Date.now() - startTime;
            const memUsed = process.memoryUsage().heapUsed - startMem;

            error.__metrics = { duration, memUsed, success: false, timestamp: new Date().toISOString() };
            throw error;
          }
        };
      };
    },

    withTimeout(ms = 30000) {
      return (taskFn) => {
        return async function wrappedWithTimeout(...args) {
          return Promise.race([
            taskFn(...args),
            new Promise((_, reject) =>
              setTimeout(() => reject(new Error(`Task timeout after ${ms}ms`)), ms)
            )
          ]);
        };
      };
    }
  };
}
