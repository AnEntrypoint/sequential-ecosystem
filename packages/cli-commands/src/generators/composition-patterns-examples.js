/**
 * Composition Patterns Examples
 * Template content for task and flow composition patterns
 */

export const COMPOSITION_PATTERNS_TEMPLATE = `/**
 * Composition Patterns
 *
 * Reusable patterns for task and flow composition.
 */

import { createCompositionPatterns, createFlowPatterns } from '@sequentialos/composition-patterns';

const taskPatterns = createCompositionPatterns();
const flowPatterns = createFlowPatterns();

// Task Patterns

// 1. Retry pattern
export const fetchUserWithRetry = taskPatterns.retry(
  async (userId) => {
    return await __callHostTool__('api', 'getUser', { id: userId });
  },
  { maxRetries: 3, initialDelay: 1000 }
);

// 2. Fallback pattern
export const getProxyUser = taskPatterns.fallback(
  async (userId) => {
    return await __callHostTool__('api', 'getUser', { id: userId });
  },
  async (userId) => {
    return { id: userId, name: 'Unknown User', cached: true };
  }
);

// 3. Batch pattern
export const batchProcessUsers = taskPatterns.batch(
  async (userId) => {
    const user = await __callHostTool__('api', 'getUser', { id: userId });
    return user;
  },
  { batchSize: 10, delay: 100 }
);

// 4. Pipeline pattern
export const userProcessingPipeline = taskPatterns.pipeline([
  async (userId) => await __callHostTool__('api', 'getUser', { id: userId }),
  async (user) => ({ ...user, processed: true }),
  async (user) => ({ ...user, timestamp: Date.now() })
]);

// 5. Map results pattern
export const fetchAndTransform = taskPatterns.mapResults(
  async (userId) => {
    return await __callHostTool__('api', 'getUser', { id: userId });
  },
  (user) => ({ id: user.id, name: user.name })
);

// 6. Conditional pattern
export const processUserConditionally = taskPatterns.conditional(
  async (user) => user.isPremium,
  async (user) => ({ ...user, priority: 'high' }),
  async (user) => ({ ...user, priority: 'normal' })
);

// Flow Patterns

// 1. Parallel branches
export const parallelUserFetchGraph = flowPatterns.parallelBranches([
  { name: 'fetch-user', start: 'get-user', end: 'user-ready' },
  { name: 'fetch-orders', start: 'get-orders', end: 'orders-ready' }
]);

// 2. Retryable state
export const retryableFlow = {
  initial: 'process',
  states: {
    process: { onDone: 'next', onError: 'retry' },
    retry: {
      async handler(context) {
        context.retries = (context.retries || 0) + 1;
        if (context.retries >= 3) throw new Error('Max retries');
        return context;
      },
      onDone: 'process'
    },
    next: { type: 'final' }
  }
};

// 3. Pipeline flow
export const dataProcessingPipeline = flowPatterns.pipelineFlow([
  { name: 'fetch', handler: async (ctx) => ({ ...ctx, data: await __callHostTool__('db', 'fetch', {}) }) },
  { name: 'validate', handler: async (ctx) => ({ ...ctx, validated: true }) },
  { name: 'transform', handler: async (ctx) => ({ ...ctx, transformed: true }) }
]);

// 4. Error handling
export const robustFlow = flowPatterns.errorHandlingFlow(
  { },
  async (context, error) => {
    console.error('Error:', error);
    return { recovered: true };
  }
);

export { taskPatterns, flowPatterns };
`;
