/**
 * Task Batch & Parallel Patterns
 * Concurrency patterns for efficient processing
 */

export function createBatchPattern() {
  return {
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
    }
  };
}

export function createParallelPattern() {
  return {
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
    }
  };
}
