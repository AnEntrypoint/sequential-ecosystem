/**
 * circuit-breaker.js
 *
 * Circuit breaker pattern for fault tolerance
 */

export function createCircuitBreaker(options = {}) {
  const {
    failureThreshold = 5,
    resetTimeout = 60000,
    monitoringWindow = 10000
  } = options;

  let state = 'closed';
  let failureCount = 0;
  let lastFailureTime = null;
  let openedAt = null;

  return {
    async execute(fn) {
      if (state === 'open') {
        if (Date.now() - openedAt >= resetTimeout) {
          state = 'half-open';
          failureCount = 0;
        } else {
          throw new Error('Circuit breaker is open');
        }
      }

      try {
        const result = await fn();

        if (state === 'half-open') {
          state = 'closed';
          failureCount = 0;
        }

        return { success: true, result };
      } catch (error) {
        failureCount++;
        lastFailureTime = Date.now();

        if (failureCount >= failureThreshold) {
          state = 'open';
          openedAt = Date.now();
        }

        return { success: false, error };
      }
    },

    getState() {
      return {
        state,
        failureCount,
        lastFailureTime,
        resetIn: state === 'open' ? Math.max(0, resetTimeout - (Date.now() - openedAt)) : null
      };
    },

    reset() {
      state = 'closed';
      failureCount = 0;
      lastFailureTime = null;
      openedAt = null;
    }
  };
}
