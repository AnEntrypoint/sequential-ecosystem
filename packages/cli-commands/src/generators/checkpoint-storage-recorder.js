/**
 * Checkpoint Storage Recorder
 * Records and updates checkpoint data
 */

export function createCheckpointRecorder(storage) {
  return {
    record(taskRunId, checkpointId, state, line, data) {
      const key = `${taskRunId}:${checkpointId}`;

      storage.set(key, {
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
      const checkpoint = storage.get(key);

      if (checkpoint) {
        checkpoint.duration = duration;
      }

      return this;
    }
  };
}
