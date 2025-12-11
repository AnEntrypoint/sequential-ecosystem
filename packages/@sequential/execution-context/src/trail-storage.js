/**
 * trail-storage.js
 *
 * Trail creation and step management
 */

export function createTrailStorage(bufferSize = 5) {
  const trails = new Map();

  return {
    createTrail(executionId, origin = {}) {
      const trail = {
        executionId: executionId,
        origin: {
          source: origin.source || 'unknown',
          sourceId: origin.sourceId || null,
          initiator: origin.initiator || 'manual',
          timestamp: new Date().toISOString(),
          context: origin.context || {}
        },
        steps: [],
        startedAt: new Date().toISOString()
      };

      trails.set(executionId, trail);
      return trail;
    },

    addStep(executionId, stepName, stepType = 'execution', metadata = {}) {
      const trail = trails.get(executionId);
      if (!trail) {
        return null;
      }

      const step = {
        name: stepName,
        type: stepType,
        timestamp: new Date().toISOString(),
        metadata: metadata
      };

      trail.steps.push(step);

      if (trail.steps.length > bufferSize) {
        trail.steps.shift();
      }

      return step;
    },

    getTrail(executionId) {
      return trails.get(executionId) || null;
    },

    clearTrail(executionId) {
      if (executionId) {
        trails.delete(executionId);
      } else {
        trails.clear();
      }
    },

    getTrailsMap() {
      return trails;
    }
  };
}
