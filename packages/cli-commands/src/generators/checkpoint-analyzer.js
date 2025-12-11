/**
 * checkpoint-analyzer.js
 *
 * Checkpoint analysis and timeline generation
 */

export function createCheckpointAnalyzer(storage) {
  return {
    getTimeline(taskRunId) {
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
    },

    analyze(taskRunId) {
      const taskCheckpoints = storage.getTaskCheckpoints(taskRunId);
      const timeline = this.getTimeline(taskRunId);

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

    compare(taskRunId1, checkpoint1, taskRunId2, checkpoint2) {
      const cp1 = storage.get(taskRunId1, checkpoint1);
      const cp2 = storage.get(taskRunId2, checkpoint2);

      const data1 = {
        checkpointId: cp1.checkpointId,
        state: cp1.state,
        timestamp: cp1.timestamp,
        duration: cp1.duration,
        data: cp1.data
      };

      const data2 = {
        checkpointId: cp2.checkpointId,
        state: cp2.state,
        timestamp: cp2.timestamp,
        duration: cp2.duration,
        data: cp2.data
      };

      const keys1 = Object.keys(data1.data);
      const keys2 = Object.keys(data2.data);

      const added = keys2.filter(k => !keys1.includes(k));
      const removed = keys1.filter(k => !keys2.includes(k));
      const modified = keys1.filter(k => keys2.includes(k) && data1.data[k] !== data2.data[k]);

      return {
        added,
        removed,
        modified,
        data1,
        data2
      };
    }
  };
}
