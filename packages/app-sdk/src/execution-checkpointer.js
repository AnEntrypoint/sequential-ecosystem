export function createExecutionCheckpointer() {
  const checkpoints = new Map();
  const checkpointTTL = 24 * 60 * 60 * 1000;

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

    findLastCompletedToolIndex(executionId) {
      const execution = checkpoints.get(executionId);
      if (!execution) {
        return -1;
      }

      for (let i = execution.length - 1; i >= 0; i--) {
        if (execution[i].status === 'completed') {
          return i;
        }
      }

      return -1;
    },

    getExecutionProgress(executionId) {
      const execution = checkpoints.get(executionId);
      if (!execution) {
        return null;
      }

      const completed = execution.filter(function(cp) { return cp.status === 'completed'; }).length;
      const failed = execution.filter(function(cp) { return cp.status === 'error'; }).length;
      const inProgress = execution.filter(function(cp) { return cp.status === 'in_progress'; }).length;

      return {
        executionId: executionId,
        totalTools: execution.length,
        completedTools: completed,
        failedTools: failed,
        inProgressTools: inProgress,
        percentComplete: Math.round((completed / execution.length) * 100) || 0
      };
    },

    canResumeExecution(executionId) {
      const execution = checkpoints.get(executionId);
      if (!execution) {
        return false;
      }

      const hasCompleted = execution.some(function(cp) { return cp.status === 'completed'; });
      const isExpired = new Date() - new Date(execution[0].createdAt) > checkpointTTL;

      return hasCompleted && !isExpired;
    },

    getResumePoint(executionId) {
      if (!this.canResumeExecution(executionId)) {
        return null;
      }

      const lastCompleted = this.findLastCompletedToolIndex(executionId);
      const execution = checkpoints.get(executionId);

      return {
        executionId: executionId,
        resumeFromToolIndex: lastCompleted + 1,
        lastCompletedTool: lastCompleted >= 0 ? execution[lastCompleted].toolName : null,
        toolsToRun: execution.length - (lastCompleted + 1),
        skippedTools: lastCompleted + 1
      };
    },

    serializeCheckpoints(executionId) {
      const execution = checkpoints.get(executionId);
      if (!execution) {
        return null;
      }

      return JSON.stringify({
        executionId: executionId,
        checkpoints: execution,
        progress: this.getExecutionProgress(executionId)
      });
    },

    deserializeCheckpoints(serialized) {
      try {
        const data = JSON.parse(serialized);
        checkpoints.set(data.executionId, data.checkpoints);
        return data;
      } catch (err) {
        return null;
      }
    },

    getCheckpointSummary(executionId) {
      const execution = checkpoints.get(executionId);
      if (!execution) {
        return null;
      }

      const toolNames = execution.map(function(cp) { return cp.toolName; });
      const totalDuration = execution.reduce(function(sum, cp) {
        return sum + (cp.duration || 0);
      }, 0);

      return {
        executionId: executionId,
        tools: toolNames,
        toolCount: execution.length,
        totalDuration: totalDuration,
        progress: this.getExecutionProgress(executionId),
        canResume: this.canResumeExecution(executionId),
        resumePoint: this.getResumePoint(executionId)
      };
    },

    clearCheckpoints(executionId) {
      if (executionId) {
        checkpoints.delete(executionId);
      } else {
        checkpoints.clear();
      }
    },

    cleanupExpiredCheckpoints() {
      const now = new Date();
      for (const executionId of checkpoints.keys()) {
        const execution = checkpoints.get(executionId);
        if (execution && execution.length > 0) {
          const createdAt = new Date(execution[0].createdAt);
          if (now - createdAt > checkpointTTL) {
            checkpoints.delete(executionId);
          }
        }
      }
    }
  };
}
