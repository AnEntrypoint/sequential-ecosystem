export function createParallelExecutor() {
  return {
    async mapParallel(items, taskFn, options = {}) {
      const { concurrency = 5 } = options;
      const results = [];
      const activePromises = [];

      for (let i = 0; i < items.length; i++) {
        const promise = (async () => {
          try {
            const result = await taskFn(items[i], i);
            results[i] = { index: i, success: true, result };
          } catch (error) {
            results[i] = { index: i, success: false, error: error.message };
          }
        })();

        activePromises.push(promise);

        if (activePromises.length >= concurrency) {
          await Promise.race(activePromises);
          activePromises.splice(
            activePromises.findIndex(p => p === promise),
            1
          );
        }
      }

      await Promise.all(activePromises);

      return {
        results,
        successful: results.filter(r => r.success),
        failed: results.filter(r => !r.success),
        successRate: ((results.filter(r => r.success).length / results.length) * 100).toFixed(1)
      };
    },

    async reduceParallel(items, reduceFn, initialValue, options = {}) {
      const { chunkSize = 10 } = options;
      const chunks = [];

      for (let i = 0; i < items.length; i += chunkSize) {
        chunks.push(items.slice(i, i + chunkSize));
      }

      let accumulator = initialValue;

      for (const chunk of chunks) {
        const chunkResults = await Promise.all(chunk.map(item => reduceFn(item)));
        for (const result of chunkResults) {
          accumulator = { ...accumulator, ...result };
        }
      }

      return accumulator;
    },

    async parallelPipeline(tasks, input, options = {}) {
      const { concurrency = 5 } = options;

      const results = await Promise.allSettled(
        tasks.map((task, idx) =>
          Promise.race([
            task(input),
            new Promise((_, reject) =>
              setTimeout(() => reject(new Error('Task timeout')), options.timeout || 30000)
            )
          ])
        )
      );

      return {
        results: results.map((r, idx) => ({
          taskIndex: idx,
          success: r.status === 'fulfilled',
          result: r.status === 'fulfilled' ? r.value : r.reason
        })),
        successful: results.filter(r => r.status === 'fulfilled').length,
        failed: results.filter(r => r.status === 'rejected').length
      };
    }
  };
}
