/**
 * Error Recovery Core - Template Module
 * Code template generation for recovery policies
 */

export function generateRecoveryPolicyTemplate() {
  return `/**
 * Error Recovery
 *
 * Implement resilient error handling with automatic retries and fallbacks.
 */

import { createRetryStrategy, createCircuitBreaker, createFallbackStrategy } from '@sequentialos/error-recovery';

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
