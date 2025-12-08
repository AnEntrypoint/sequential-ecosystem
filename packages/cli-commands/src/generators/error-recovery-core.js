export function createRetryStrategy(options = {}) {
  const {
    maxRetries = 3,
    initialDelay = 1000,
    maxDelay = 30000,
    backoffMultiplier = 2,
    jitter = true,
    retryableErrors = [
      'ECONNREFUSED',
      'ECONNRESET',
      'ETIMEDOUT',
      'EHOSTUNREACH',
      'NetworkError',
      'TimeoutError'
    ]
  } = options;

  return {
    async executeWithRetry(fn, context = {}) {
      let lastError;
      let delay = initialDelay;

      for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
          const result = await fn();
          return {
            success: true,
            result,
            attempts: attempt + 1,
            finalDelay: 0
          };
        } catch (error) {
          lastError = error;

          if (!this.isRetryable(error)) {
            throw error;
          }

          if (attempt < maxRetries) {
            const actualDelay = Math.min(delay, maxDelay);
            const jitterValue = jitter ? Math.random() * actualDelay * 0.1 : 0;
            const totalDelay = actualDelay + jitterValue;

            await new Promise(resolve => setTimeout(resolve, totalDelay));

            delay = actualDelay * backoffMultiplier;
          }
        }
      }

      throw {
        originalError: lastError,
        message: `Failed after ${maxRetries + 1} attempts`,
        attempts: maxRetries + 1,
        retryable: true
      };
    },

    isRetryable(error) {
      const errorString = `${error.code || error.name || error.message}`;
      return this.retryableErrors.some(pattern => errorString.includes(pattern));
    },

    retryableErrors,

    getRetryConfig() {
      return {
        maxRetries,
        initialDelay,
        maxDelay,
        backoffMultiplier,
        jitter
      };
    }
  };
}

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

export function createErrorRecoveryPolicy(options = {}) {
  const {
    strategy = 'exponential',
    maxAttempts = 3,
    timeout = 5000
  } = options;

  return {
    async apply(taskFn, taskName = 'task') {
      const retryStrategy = createRetryStrategy({
        maxRetries: maxAttempts - 1,
        initialDelay: 100,
        maxDelay: timeout
      });

      const circuitBreaker = createCircuitBreaker();

      return await circuitBreaker.execute(async () => {
        return await retryStrategy.executeWithRetry(taskFn);
      });
    },

    async applyWithFallback(primaryFn, fallbackFn, context = {}) {
      const fallback = createFallbackStrategy();
      fallback.registerFallback('ECONNREFUSED', fallbackFn);
      fallback.registerFallback('NetworkError', fallbackFn);

      return await fallback.executeWithFallback(primaryFn, context);
    }
  };
}

export function generateRecoveryPolicyTemplate() {
  return `/**
 * Error Recovery
 *
 * Implement resilient error handling with automatic retries and fallbacks.
 */

import { createRetryStrategy, createCircuitBreaker, createFallbackStrategy } from '@sequential/error-recovery';

const retryStrategy = createRetryStrategy({
  maxRetries: 3,
  initialDelay: 1000,
  maxDelay: 30000,
  backoffMultiplier: 2,
  jitter: true
});

const circuitBreaker = createCircuitBreaker({
  failureThreshold: 5,
  resetTimeout: 60000
});

const fallback = createFallbackStrategy();

// Register fallback handlers
fallback.registerFallback('ECONNREFUSED', async (error, context) => {
  return await __callHostTool__('task', 'cache-fallback', context);
});

fallback.registerFallback('TimeoutError', async (error, context) => {
  return { cached: true, data: null };
});

// Task with automatic retry
export async function resilientFetch(input) {
  return await retryStrategy.executeWithRetry(async () => {
    const response = await fetch(\`/api/users/\${input.id}\`);
    if (!response.ok) throw new Error('API error');
    return response.json();
  });
}

// Task with circuit breaker
export async function protectedAPI(input) {
  const result = await circuitBreaker.execute(async () => {
    return await fetch(\`/api/data\`, { body: JSON.stringify(input) })
      .then(r => r.json());
  });

  return result.success ? result.result : { error: result.error };
}

// Task with fallback
export async function fetchWithFallback(input) {
  return await fallback.executeWithFallback(
    async () => {
      const user = await __callHostTool__('task', 'fetch-user', input);
      return user;
    },
    async (error) => {
      return await __callHostTool__('task', 'get-cached-user', input);
    }
  );
}

export function getRecoveryStats() {
  return {
    circuitBreaker: circuitBreaker.getState()
  };
}
`;
}
