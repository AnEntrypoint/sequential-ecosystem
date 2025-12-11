/**
 * trail-tracker.js - Facade for execution trail tracking
 *
 * Delegates to focused modules:
 * - trail-storage: Trail creation and step management
 * - trail-formatter: Trail formatting and summaries
 * - trail-hierarchy: Child trail creation and hierarchy
 * - trail-metadata: Trail metadata and statistics
 */

import { createTrailStorage } from './trail-storage.js';
import { createTrailFormatter } from './trail-formatter.js';
import { createTrailHierarchy } from './trail-hierarchy.js';
import { createTrailMetadata } from './trail-metadata.js';

export function createTrailTracker(bufferSize = 5) {
  const storage = createTrailStorage(bufferSize);
  const formatter = createTrailFormatter(storage);
  const hierarchy = createTrailHierarchy(storage);
  const metadata = createTrailMetadata(storage);

  return {
    // Storage operations
    createTrail(executionId, origin = {}) {
      return storage.createTrail(executionId, origin);
    },

    addStep(executionId, stepName, stepType = 'execution', metadata = {}) {
      return storage.addStep(executionId, stepName, stepType, metadata);
    },

    getTrail(executionId) {
      return storage.getTrail(executionId);
    },

    clearTrail(executionId) {
      return storage.clearTrail(executionId);
    },

    // Formatting operations
    getTrailSummary(executionId) {
      return formatter.getTrailSummary(executionId);
    },

    formatTrailForDisplay(executionId) {
      return formatter.formatTrailForDisplay(executionId);
    },

    enrichErrorWithTrail(error, executionId) {
      return formatter.enrichErrorWithTrail(error, executionId);
    },

    // Hierarchy operations
    createChildTrail(parentExecutionId, childName) {
      return hierarchy.createChildTrail(parentExecutionId, childName);
    },

    getTrailChain(executionId) {
      return hierarchy.getTrailChain(executionId);
    },

    // Metadata operations
    getTrailMetadata(executionId) {
      return metadata.getTrailMetadata(executionId);
    },

    getActiveTrails() {
      return metadata.getActiveTrails();
    },

    getTrailStatistics() {
      return metadata.getTrailStatistics();
    }
  };
}
