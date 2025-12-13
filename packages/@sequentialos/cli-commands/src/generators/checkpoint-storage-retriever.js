/**
 * Checkpoint Storage Retriever
 * Retrieves checkpoint data and constructs queries
 */

export function createCheckpointRetriever(storage) {
  return {
    get(taskRunId, checkpointId) {
      const key = `${taskRunId}:${checkpointId}`;
      const checkpoint = storage.get(key);

      if (!checkpoint) {
        throw new Error(`Checkpoint not found: ${key}`);
      }

      return checkpoint;
    },

    getTaskCheckpoints(taskRunId) {
      const taskCheckpoints = [];

      for (const [key, checkpoint] of storage.entries()) {
        if (checkpoint.taskRunId === taskRunId) {
          taskCheckpoints.push({
            id: checkpoint.checkpointId,
            state: checkpoint.state,
            line: checkpoint.line,
            timestamp: checkpoint.timestamp,
            duration: checkpoint.duration,
            dataKeys: Object.keys(checkpoint.data),
            dataSize: JSON.stringify(checkpoint.data).length
          });
        }
      }

      return taskCheckpoints.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    }
  };
}
