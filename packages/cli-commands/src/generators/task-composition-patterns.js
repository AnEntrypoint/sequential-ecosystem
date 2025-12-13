/**
 * Task Composition Patterns
 * Retry, fallback, batch, parallel, and transform patterns
 */

export function createTaskPatterns() {
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
    }
  };
}

export function createPipelinePatterns() {
  return {
    pipeline(taskFns) {
      return async function pipelineTask(initialInput) {
        let result = initialInput;

        for (const taskFn of taskFns) {
          result = await taskFn(result);
        }

        return result;
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
