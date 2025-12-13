/**
 * Checkpoint Statistics Analyzer
 * Analyzes checkpoint metrics and performance characteristics
 */

export function createCheckpointStatisticsAnalyzer(storage) {
  return {
    analyze(taskRunId) {
      const taskCheckpoints = storage.getTaskCheckpoints(taskRunId);
      const timeline = this.buildTimeline(taskRunId);

      const slowestCheckpoint = timeline.reduce((max, cp) =>
        cp.duration > max.duration ? cp : max,
      { duration: 0 }
      );

      const largestData = taskCheckpoints.reduce((max, cp) =>
        cp.dataSize > max.dataSize ? cp : max,
      { dataSize: 0 }
      );

      return {
        totalCheckpoints: taskCheckpoints.length,
        totalDuration: timeline[timeline.length - 1]?.cumulativeDuration || 0,
        slowestCheckpoint: {
          id: slowestCheckpoint.checkpoint,
          duration: slowestCheckpoint.duration,
          percentage: timeline.length > 0
            ? ((slowestCheckpoint.duration / timeline.reduce((sum, cp) => sum + cp.duration, 0)) * 100).toFixed(2)
            : 0
        },
        largestDataCheckpoint: {
          id: largestData.id,
          size: largestData.dataSize,
          keys: largestData.dataKeys
        },
        timeline
      };
    },

    buildTimeline(taskRunId) {
      const taskCheckpoints = storage.getTaskCheckpoints(taskRunId);
      const timeline = [];
      let cumulativeDuration = 0;

      for (let i = 0; i < taskCheckpoints.length; i++) {
        const cp = taskCheckpoints[i];
        const next = taskCheckpoints[i + 1];
        const interval = next
          ? new Date(next.timestamp) - new Date(cp.timestamp)
          : 0;

        cumulativeDuration += cp.duration;

        timeline.push({
          checkpoint: cp.id,
          state: cp.state,
          duration: cp.duration,
          interval: Math.round(interval),
          cumulativeDuration,
          timestamp: cp.timestamp,
          dataSize: cp.dataSize
        });
      }

      return timeline;
    }
  };
}
