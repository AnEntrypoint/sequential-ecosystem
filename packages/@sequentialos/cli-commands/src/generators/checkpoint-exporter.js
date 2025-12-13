/**
 * checkpoint-exporter.js
 *
 * Export checkpoints with analysis and timeline
 */

export function createCheckpointExporter(storage, analyzer) {
  return {
    export(taskRunId) {
      const taskCheckpoints = storage.getTaskCheckpoints(taskRunId);
      const timeline = analyzer.getTimeline(taskRunId);
      const analysis = analyzer.analyze(taskRunId);

      return {
        taskRunId,
        exportedAt: new Date().toISOString(),
        checkpoints: taskCheckpoints,
        timeline,
        analysis
      };
    },

    getResumePayload(taskRunId, fromCheckpoint) {
      const checkpoint = storage.get(taskRunId, fromCheckpoint);

      return {
        taskRunId,
        resumeFrom: fromCheckpoint,
        resumeAt: new Date().toISOString(),
        context: checkpoint.data,
        executionLine: checkpoint.line
      };
    }
  };
}
