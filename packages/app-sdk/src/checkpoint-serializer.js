/**
 * checkpoint-serializer.js
 *
 * Serialize and deserialize checkpoints for persistence
 */

export function createCheckpointSerializer(storage) {
  return {
    serializeCheckpoints(executionId, analyzer) {
      const execution = storage.getExecutionCheckpoints(executionId);
      if (!execution || execution.length === 0) {
        return null;
      }

      return JSON.stringify({
        executionId: executionId,
        checkpoints: execution,
        progress: analyzer.getExecutionProgress(executionId)
      });
    },

    deserializeCheckpoints(serialized, storage) {
      try {
        const data = JSON.parse(serialized);
        const checkpointsMap = storage.getCheckpointsMap();
        checkpointsMap.set(data.executionId, data.checkpoints);
        return data;
      } catch (err) {
        return null;
      }
    }
  };
}
