/**
 * Performance Metrics Recorder
 * Records execution metrics with timestamps and metadata
 */

export function createMetricsRecorder() {
  const metrics = new Map();

  return {
    recordExecution(name, durationMs, success = true, metadata = {}) {
      if (!metrics.has(name)) {
        metrics.set(name, { executions: [] });
      }

      const entry = metrics.get(name);
      entry.executions.push({
        duration: durationMs,
        success,
        timestamp: new Date().toISOString(),
        ...metadata
      });

      return { name, duration: durationMs, success };
    },

    getExecutions(name) {
      const entry = metrics.get(name);
      return entry ? entry.executions : [];
    },

    getAllExecutions() {
      const allExecs = [];
      for (const [name, entry] of metrics.entries()) {
        allExecs.push({ name, executions: entry.executions });
      }
      return allExecs;
    },

    clear() {
      metrics.clear();
    }
  };
}
