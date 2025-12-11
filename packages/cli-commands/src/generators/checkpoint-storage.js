/**
 * checkpoint-storage.js
 *
 * Checkpoint recording and retrieval
 */

export function createCheckpointStorage() {
  const checkpoints = new Map();

  return {
    record(taskRunId, checkpointId, state, line, data) {
      const key = `${taskRunId}:${checkpointId}`;

      checkpoints.set(key, {
        taskRunId,
        checkpointId,
        state,
        line,
        data: JSON.parse(JSON.stringify(data)),
        timestamp: new Date().toISOString(),
        duration: 0
      });

      return this;
    },

    recordDuration(taskRunId, checkpointId, duration) {
      const key = `${taskRunId}:${checkpointId}`;
      const checkpoint = checkpoints.get(key);

      if (checkpoint) {
        checkpoint.duration = duration;
      }

      return this;
    },

    get(taskRunId, checkpointId) {
      const key = `${taskRunId}:${checkpointId}`;
      const checkpoint = checkpoints.get(key);

      if (!checkpoint) {
        throw new Error(`Checkpoint not found: ${key}`);
      }

      return checkpoint;
    },

    getTaskCheckpoints(taskRunId) {
      const taskCheckpoints = [];

      for (const [key, checkpoint] of checkpoints.entries()) {
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
    },

    clear(taskRunId) {
      const keysToDelete = [];

      for (const key of checkpoints.keys()) {
        if (key.startsWith(taskRunId)) {
          keysToDelete.push(key);
        }
      }

      keysToDelete.forEach(key => checkpoints.delete(key));
      return this;
    }
  };
}
