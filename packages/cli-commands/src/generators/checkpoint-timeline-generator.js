/**
 * Checkpoint Timeline Generator
 * Generates chronological timeline of checkpoint execution
 */

export function createCheckpointTimelineGenerator(storage) {
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
    }
  };
}
