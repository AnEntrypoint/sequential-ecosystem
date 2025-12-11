/**
 * fallback-strategy.js
 *
 * Fallback strategy for error handling and recovery
 */

export function createFallbackStrategy() {
  const fallbacks = new Map();

  return {
    registerFallback(condition, handler) {
      fallbacks.set(condition, handler);
    },

    async executeWithFallback(primaryFn, context = {}) {
      try {
        return {
          success: true,
          result: await primaryFn(),
          usedFallback: false
        };
      } catch (error) {
        for (const [condition, handler] of fallbacks.entries()) {
          if (typeof condition === 'function' ? condition(error) : error.code === condition) {
            try {
              return {
                success: true,
                result: await handler(error, context),
                usedFallback: true,
                fallbackReason: error.message
              };
            } catch (fallbackError) {
              throw {
                primaryError: error,
                fallbackError,
                message: 'Both primary and fallback failed'
              };
            }
          }
        }

        throw error;
      }
    },

    clearFallbacks() {
      fallbacks.clear();
    }
  };
}
