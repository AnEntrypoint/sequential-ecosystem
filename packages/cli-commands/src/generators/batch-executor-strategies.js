/**
 * Batch Executor Strategies
 * Sequential, parallel, and batched execution strategies
 */

export function createExecutionStrategies(options, executeWithRetry) {
  const { continueOnError = false } = options;

  return {
    async executeSequential(items, taskFn) {
      const results = [];
      const errors = [];

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        try {
          const result = await executeWithRetry(item, taskFn);
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

    async executeParallel(items, taskFn, concurrency) {
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

            executeWithRetry(item, taskFn)
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

    async executeBatched(items, batchSize, taskFn, concurrency) {
      const batches = [];
      for (let i = 0; i < items.length; i += batchSize) {
        batches.push(items.slice(i, i + batchSize));
      }

      const allResults = [];
      for (const batch of batches) {
        const batchResults = await this.executeParallel(batch, taskFn, concurrency);
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
