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
