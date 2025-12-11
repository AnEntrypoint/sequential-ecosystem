/**
 * state-inspector-core.js - State Inspector Facade
 *
 * Delegates to focused modules:
 * - checkpoint-storage: Record and retrieve checkpoints
 * - checkpoint-analyzer: Timeline and analysis
 * - checkpoint-exporter: Export and resume functionality
 */

import { createCheckpointStorage } from './checkpoint-storage.js';
import { createCheckpointAnalyzer } from './checkpoint-analyzer.js';
import { createCheckpointExporter } from './checkpoint-exporter.js';

export function createStateInspector(stateManager) {
  const storage = createCheckpointStorage();
  const analyzer = createCheckpointAnalyzer(storage);
  const exporter = createCheckpointExporter(storage, analyzer);

  return {
    recordCheckpoint(taskRunId, checkpointId, state, line, data) {
      storage.record(taskRunId, checkpointId, state, line, data);
      return this;
    },

    recordCheckpointDuration(taskRunId, checkpointId, duration) {
      storage.recordDuration(taskRunId, checkpointId, duration);
      return this;
    },

    getTaskCheckpoints(taskRunId) {
      return storage.getTaskCheckpoints(taskRunId);
    },

    getCheckpointData(taskRunId, checkpointId) {
      const checkpoint = storage.get(taskRunId, checkpointId);
      return {
        checkpointId: checkpoint.checkpointId,
        state: checkpoint.state,
        timestamp: checkpoint.timestamp,
        duration: checkpoint.duration,
        data: checkpoint.data
      };
    },

    getCheckpointTimeline(taskRunId) {
      return analyzer.getTimeline(taskRunId);
    },

    analyzeCheckpoints(taskRunId) {
      return analyzer.analyze(taskRunId);
    },

    compareCheckpoints(taskRunId1, checkpoint1, taskRunId2, checkpoint2) {
      return analyzer.compare(taskRunId1, checkpoint1, taskRunId2, checkpoint2);
    },

    exportCheckpoints(taskRunId) {
      return exporter.export(taskRunId);
    },

    getResumePayload(taskRunId, fromCheckpoint) {
      return exporter.getResumePayload(taskRunId, fromCheckpoint);
    },

    clearCheckpoints(taskRunId) {
      storage.clear(taskRunId);
      return this;
    }
  };
}
