export function createCompositionPatterns() {
  return {
    retry(taskFn, options = {}) {
      const { maxRetries = 3, initialDelay = 1000, backoffMultiplier = 2 } = options;

      return async function taskWithRetry(...args) {
        let lastError;
        let delay = initialDelay;

        for (let attempt = 0; attempt <= maxRetries; attempt++) {
          try {
            return await taskFn(...args);
          } catch (error) {
            lastError = error;
            if (attempt < maxRetries) {
              await new Promise(r => setTimeout(r, delay));
              delay = Math.min(delay * backoffMultiplier, 30000);
            }
          }
        }

        throw lastError;
      };
    },

    fallback(taskFn, fallbackFn) {
      return async function taskWithFallback(...args) {
        try {
          return await taskFn(...args);
        } catch (error) {
          return await fallbackFn(...args);
        }
      };
    },

    batch(taskFn, options = {}) {
      const { batchSize = 10, delay = 0 } = options;

      return async function batchTask(items) {
        const results = [];

        for (let i = 0; i < items.length; i += batchSize) {
          const batch = items.slice(i, i + batchSize);
          const batchResults = await Promise.all(batch.map(item => taskFn(item)));
          results.push(...batchResults);

          if (delay > 0 && i + batchSize < items.length) {
            await new Promise(r => setTimeout(r, delay));
          }
        }

        return results;
      };
    },

    parallel(taskFns, options = {}) {
      const { concurrency = 5 } = options;

      return async function parallelTask(inputs) {
        const results = [];
        const queue = inputs.slice();

        const worker = async () => {
          while (queue.length > 0) {
            const input = queue.shift();
            const taskFn = taskFns[0];
            const result = await taskFn(input);
            results.push(result);
          }
        };

        const workers = Array(Math.min(concurrency, inputs.length)).fill(null).map(() => worker());
        await Promise.all(workers);

        return results;
      };
    },

    pipeline(taskFns) {
      return async function pipelineTask(initialInput) {
        let result = initialInput;

        for (const taskFn of taskFns) {
          result = await taskFn(result);
        }

        return result;
      };
    },

    mapResults(taskFn, mapFn) {
      return async function mappedTask(...args) {
        const result = await taskFn(...args);
        return await mapFn(result);
      };
    },

    filterResults(taskFn, filterFn) {
      return async function filteredTask(items) {
        const results = await taskFn(items);
        return results.filter(filterFn);
      };
    },

    conditional(condition, trueFn, falseFn) {
      return async function conditionalTask(input) {
        const result = await condition(input);
        return result ? await trueFn(input) : await falseFn(input);
      };
    },

    aggregate(taskFns, aggregateFn) {
      return async function aggregateTask(input) {
        const results = await Promise.all(taskFns.map(fn => fn(input)));
        return aggregateFn(results);
      };
    },

    compose(...taskFns) {
      return async function composedTask(input) {
        return taskFns.reduce((result, taskFn) =>
          Promise.resolve(result).then(taskFn),
          Promise.resolve(input)
        );
      };
    }
  };
}

export function createFlowPatterns() {
  return {
    parallelBranches(branches) {
      return {
        initial: 'execute-branches',
        states: {
          'execute-branches': {
            type: 'parallel',
            branches: branches.map(b => ({
              name: b.name,
              startState: b.start,
              endState: b.end
            })),
            joinCondition: 'all',
            onDone: 'final'
          },
          final: { type: 'final' }
        }
      };
    },

    retryableState(stateName, handler, options = {}) {
      const { maxRetries = 3 } = options;

      return {
        [stateName]: { onDone: 'next', onError: `retry-${stateName}` },
        [`retry-${stateName}`]: {
          async handler(context) {
            context.retryCount = (context.retryCount || 0) + 1;
            if (context.retryCount >= maxRetries) {
              throw new Error(`Max retries exceeded for ${stateName}`);
            }
            return context;
          },
          onDone: stateName,
          onError: 'error'
        }
      };
    },

    conditionalFlow(condition) {
      return {
        initial: 'check-condition',
        states: {
          'check-condition': { onDone: 'condition-result', onError: 'error' },
          'condition-result': {
            type: 'conditional',
            condition,
            onTrue: 'success-path',
            onFalse: 'fallback-path'
          },
          'success-path': { onDone: 'final' },
          'fallback-path': { onDone: 'final' },
          error: { onDone: 'final' },
          final: { type: 'final' }
        }
      };
    },

    pipelineFlow(stages) {
      const states = {};

      for (let i = 0; i < stages.length; i++) {
        const stage = stages[i];
        const nextStage = i < stages.length - 1 ? stages[i + 1].name : 'final';

        states[stage.name] = {
          async handler(context) {
            return stage.handler(context);
          },
          onDone: nextStage,
          onError: 'error'
        };
      }

      states.error = { onDone: 'final' };
      states.final = { type: 'final' };

      return {
        initial: stages[0].name,
        states
      };
    },

    errorHandlingFlow(mainFlow, errorHandler) {
      const wrappedStates = {};

      for (const [stateName, stateConfig] of Object.entries(mainFlow.states || {})) {
        wrappedStates[stateName] = {
          ...stateConfig,
          onError: `error-handler-${stateName}`
        };

        wrappedStates[`error-handler-${stateName}`] = {
          async handler(context, error) {
            context.originalError = error;
            return errorHandler(context, error);
          },
          onDone: stateConfig.onError || 'final'
        };
      }

      return {
        initial: mainFlow.initial,
        states: wrappedStates
      };
    }
  };
}

export function generateCompositionPatternsTemplate() {
  return `/**
 * Composition Patterns
 *
 * Reusable patterns for task and flow composition.
 */

import { createCompositionPatterns, createFlowPatterns } from '@sequential/composition-patterns';

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
    // Return cached/default user if API fails
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
  (user) => ({ id: user.id, name: user.name }) // Project only id and name
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
  { /* main flow states */ },
  async (context, error) => {
    // Custom error handling
    console.error('Error:', error);
    return { recovered: true };
  }
);

// Export patterns for reuse
export { taskPatterns, flowPatterns };
`;
}
