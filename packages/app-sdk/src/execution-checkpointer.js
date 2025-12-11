import { createCheckpointStorage } from './checkpoint-storage.js';
import { createCheckpointAnalyzer } from './checkpoint-analyzer.js';
import { createCheckpointSerializer } from './checkpoint-serializer.js';
import { createCheckpointMaintenance } from './checkpoint-maintenance.js';

/**
 * execution-checkpointer.js - Facade for execution checkpointing
 *
 * Delegates to focused modules:
 * - checkpoint-storage: Create and retrieve checkpoints
 * - checkpoint-analyzer: Progress and resume analysis
 * - checkpoint-serializer: Serialization for persistence
 * - checkpoint-maintenance: Cleanup and summary operations
 */

export function createExecutionCheckpointer() {
  const checkpointTTL = 24 * 60 * 60 * 1000;
  const storage = createCheckpointStorage();
  const analyzer = createCheckpointAnalyzer(storage, checkpointTTL);
  const serializer = createCheckpointSerializer(storage);
  const maintenance = createCheckpointMaintenance(storage, analyzer, checkpointTTL);

  return {
    createCheckpoint(executionId, toolName, input, metadata = {}) {
      return storage.createCheckpoint(executionId, toolName, input, metadata);
    },

    completeCheckpoint(executionId, toolIndex, result, error = null) {
      return storage.completeCheckpoint(executionId, toolIndex, result, error);
    },

    getCheckpoint(executionId, toolIndex) {
      return storage.getCheckpoint(executionId, toolIndex);
    },

    getExecutionCheckpoints(executionId) {
      return storage.getExecutionCheckpoints(executionId);
    },

    findLastCompletedToolIndex(executionId) {
      return analyzer.findLastCompletedToolIndex(executionId);
    },

    getExecutionProgress(executionId) {
      return analyzer.getExecutionProgress(executionId);
    },

    canResumeExecution(executionId) {
      return analyzer.canResumeExecution(executionId);
    },

    getResumePoint(executionId) {
      return analyzer.getResumePoint(executionId);
    },

    serializeCheckpoints(executionId) {
      return serializer.serializeCheckpoints(executionId, analyzer);
    },

    deserializeCheckpoints(serialized) {
      return serializer.deserializeCheckpoints(serialized, storage);
    },

    getCheckpointSummary(executionId) {
      return maintenance.getCheckpointSummary(executionId);
    },

    clearCheckpoints(executionId) {
      return storage.clearCheckpoints(executionId);
    },

    cleanupExpiredCheckpoints() {
      return maintenance.cleanupExpiredCheckpoints();
    }
  };
}
