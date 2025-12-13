/**
 * checkpoint-analyzer.js
 *
 * Analyze execution progress and resumption capability
 */

export function createCheckpointAnalyzer(storage, checkpointTTL = 24 * 60 * 60 * 1000) {
  return {
    findLastCompletedToolIndex(executionId) {
      const execution = storage.getExecutionCheckpoints(executionId);
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
      const execution = storage.getExecutionCheckpoints(executionId);
      if (!execution || execution.length === 0) {
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
      const execution = storage.getExecutionCheckpoints(executionId);
      if (!execution || execution.length === 0) {
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
      const execution = storage.getExecutionCheckpoints(executionId);

      return {
        executionId: executionId,
        resumeFromToolIndex: lastCompleted + 1,
        lastCompletedTool: lastCompleted >= 0 ? execution[lastCompleted].toolName : null,
        toolsToRun: execution.length - (lastCompleted + 1),
        skippedTools: lastCompleted + 1
      };
    }
  };
}
