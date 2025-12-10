export function createBatchExecutor(options = {}) {
  const {
    concurrency = 5,
    timeout = 30000,
    retries = 0,
    continueOnError = false
  } = options;

  return {
    async executeSequential(items, taskFn) {
      const results = [];
      const errors = [];

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        try {
          const result = await this.executeWithRetry(item, taskFn, retries, timeout);
          results.push({ index: i, item, success: true, result });
        } catch (error) {
          const errorEntry = { index: i, item, success: false, error: error.message };
          errors.push(errorEntry);
          results.push(errorEntry);

          if (!continueOnError) throw error;
        }
      }

      return {
        results,
        successful: results.filter(r => r.success),
        failed: errors,
        successRate: ((results.filter(r => r.success).length / results.length) * 100).toFixed(1)
      };
    },

    async executeParallel(items, taskFn) {
      const results = [];
      const errors = [];
      let activeCount = 0;
      let currentIndex = 0;

      return new Promise((resolve, reject) => {
        const processNext = async () => {
          if (currentIndex >= items.length && activeCount === 0) {
            resolve({
              results,
              successful: results.filter(r => r.success),
              failed: errors,
              successRate: ((results.filter(r => r.success).length / results.length) * 100).toFixed(1)
            });
            return;
          }

          if (currentIndex < items.length && activeCount < concurrency) {
            activeCount++;
            const index = currentIndex++;
            const item = items[index];

            this.executeWithRetry(item, taskFn, retries, timeout)
              .then(result => {
                results[index] = { index, item, success: true, result };
              })
              .catch(error => {
                const errorEntry = { index, item, success: false, error: error.message };
                errors.push(errorEntry);
                results[index] = errorEntry;

                if (!continueOnError) {
                  reject(error);
                }
              })
              .finally(() => {
                activeCount--;
                processNext();
              });

            processNext();
          }
        };

        processNext();
      });
    },

    async executeWithRetry(item, taskFn, retryCount, timeoutMs) {
      let lastError;

      for (let attempt = 0; attempt <= retryCount; attempt++) {
        try {
          return await Promise.race([
            taskFn(item),
            new Promise((_, reject) =>
              setTimeout(() => reject(new Error('Timeout')), timeoutMs)
            )
          ]);
        } catch (error) {
          lastError = error;
          if (attempt < retryCount) {
            await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
          }
        }
      }

      throw lastError;
    },

    async executeBatched(items, batchSize, taskFn) {
      const batches = [];
      for (let i = 0; i < items.length; i += batchSize) {
        batches.push(items.slice(i, i + batchSize));
      }

      const allResults = [];
      for (const batch of batches) {
        const batchResults = await this.executeParallel(batch, taskFn);
        allResults.push({
          batchSize: batch.length,
          results: batchResults.results
        });
      }

      const flatResults = allResults.flatMap(b => b.results);
      return {
        batches: allResults,
        totalResults: flatResults,
        successful: flatResults.filter(r => r.success),
        failed: flatResults.filter(r => !r.success),
        successRate: ((flatResults.filter(r => r.success).length / flatResults.length) * 100).toFixed(1)
      };
    }
  };
}

export function generateBatchOperationsTemplate() {
  return `/**
 * Batch Operations
 *
 * Execute multiple tasks efficiently.
 * Strategies: sequential, parallel, batched with retries.
 */

import { createBatchExecutor } from '@sequentialos/batch-operations';

const executor = createBatchExecutor({
  concurrency: 5,
  timeout: 30000,
  retries: 2,
  continueOnError: true
});

// Process items sequentially
export async function processSequential(items) {
  return await executor.executeSequential(items, async (item) => {
    const result = await __callHostTool__('task', 'processItem', item);
    return result;
  });
}

// Process items in parallel
export async function processParallel(items) {
  return await executor.executeParallel(items, async (item) => {
    const result = await __callHostTool__('task', 'processItem', item);
    return result;
  });
}

// Process items in batches
export async function processBatched(items, batchSize = 10) {
  return await executor.executeBatched(items, batchSize, async (item) => {
    const result = await __callHostTool__('task', 'processItem', item);
    return result;
  });
}

// Batch import
export async function importUsers(csvPath) {
  const items = await readCSV(csvPath);

  return await executor.executeBatched(items, 50, async (user) => {
    return await __callHostTool__('task', 'createUser', user);
  });
}
`;
}

export function createTaskBatcher() {
  return {
    async batchBySize(items, size, taskName) {
      const batches = [];
      for (let i = 0; i < items.length; i += size) {
        batches.push(items.slice(i, i + size));
      }

      const results = [];
      for (const batch of batches) {
        const result = await this.executeBatch(batch, taskName);
        results.push(result);
      }

      return {
        totalBatches: batches.length,
        totalItems: items.length,
        results,
        allSuccessful: results.every(r => r.success)
      };
    },

    async batchByCount(items, count, taskName) {
      const results = [];
      for (let i = 0; i < count; i++) {
        const batch = items.filter((_, idx) => idx % count === i);
        const result = await this.executeBatch(batch, taskName);
        results.push(result);
      }

      return {
        totalPartitions: count,
        totalItems: items.length,
        results,
        allSuccessful: results.every(r => r.success)
      };
    },

    async executeBatch(items, taskName) {
      try {
        const result = await this.callHostTool('task', taskName, { items });
        return { success: true, itemCount: items.length, result };
      } catch (error) {
        return { success: false, itemCount: items.length, error: error.message };
      }
    }
  };
}
