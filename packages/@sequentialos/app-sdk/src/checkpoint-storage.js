/**
 * checkpoint-storage.js
 *
 * Store and retrieve execution checkpoints
 */

export function createCheckpointStorage() {
  const checkpoints = new Map();

  return {
    createCheckpoint(executionId, toolName, input, metadata = {}) {
      const checkpoint = {
        executionId: executionId,
        toolName: toolName,
        toolIndex: 0,
        input: input,
        status: 'in_progress',
        createdAt: new Date().toISOString(),
        metadata: metadata
      };

      if (!checkpoints.has(executionId)) {
        checkpoints.set(executionId, []);
      }

      const execution = checkpoints.get(executionId);
      checkpoint.toolIndex = execution.length;
      execution.push(checkpoint);

      return checkpoint;
    },

    completeCheckpoint(executionId, toolIndex, result, error = null) {
      const execution = checkpoints.get(executionId);
      if (!execution || !execution[toolIndex]) {
        return null;
      }

      const checkpoint = execution[toolIndex];
      checkpoint.status = error ? 'error' : 'completed';
      checkpoint.result = result;
      checkpoint.error = error;
      checkpoint.completedAt = new Date().toISOString();

      if (checkpoint.createdAt && checkpoint.completedAt) {
        checkpoint.duration = new Date(checkpoint.completedAt) - new Date(checkpoint.createdAt);
      }

      return checkpoint;
    },

    getCheckpoint(executionId, toolIndex) {
      const execution = checkpoints.get(executionId);
      if (!execution || !execution[toolIndex]) {
        return null;
      }

      return execution[toolIndex];
    },

    getExecutionCheckpoints(executionId) {
      const execution = checkpoints.get(executionId);
      return execution ? execution.slice() : [];
    },

    clearCheckpoints(executionId) {
      if (executionId) {
        checkpoints.delete(executionId);
      } else {
        checkpoints.clear();
      }
    },

    getCheckpointsMap() {
      return checkpoints;
    }
  };
}
