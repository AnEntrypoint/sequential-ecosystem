/**
 * checkpoint-maintenance.js
 *
 * Maintenance operations and summary generation
 */

export function createCheckpointMaintenance(storage, analyzer, checkpointTTL = 24 * 60 * 60 * 1000) {
  return {
    getCheckpointSummary(executionId) {
      const execution = storage.getExecutionCheckpoints(executionId);
      if (!execution || execution.length === 0) {
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
        progress: analyzer.getExecutionProgress(executionId),
        canResume: analyzer.canResumeExecution(executionId),
        resumePoint: analyzer.getResumePoint(executionId)
      };
    },

    cleanupExpiredCheckpoints() {
      const checkpointsMap = storage.getCheckpointsMap();
      const now = new Date();
      for (const executionId of checkpointsMap.keys()) {
        const execution = storage.getExecutionCheckpoints(executionId);
        if (execution && execution.length > 0) {
          const createdAt = new Date(execution[0].createdAt);
          if (now - createdAt > checkpointTTL) {
            storage.clearCheckpoints(executionId);
          }
        }
      }
    }
  };
}
