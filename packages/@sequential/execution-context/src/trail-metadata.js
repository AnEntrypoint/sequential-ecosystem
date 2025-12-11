/**
 * trail-metadata.js
 *
 * Trail metadata and statistics
 */

export function createTrailMetadata(storage) {
  return {
    getTrailMetadata(executionId) {
      const trail = storage.getTrail(executionId);
      if (!trail) {
        return null;
      }

      return {
        executionId: executionId,
        source: trail.origin.source,
        sourceId: trail.origin.sourceId,
        initiator: trail.origin.initiator,
        context: trail.origin.context,
        stepCount: trail.steps.length,
        isChild: !!trail.parentExecutionId,
        parentId: trail.parentExecutionId || null
      };
    },

    getActiveTrails() {
      return Array.from(storage.getTrailsMap().keys());
    },

    getTrailStatistics() {
      const trails = storage.getTrailsMap();
      let totalSteps = 0;
      let childTrails = 0;

      for (const trail of trails.values()) {
        totalSteps += trail.steps.length;
        if (trail.parentExecutionId) {
          childTrails++;
        }
      }

      return {
        totalTrails: trails.size,
        childTrails: childTrails,
        rootTrails: trails.size - childTrails,
        totalSteps: totalSteps,
        averageStepsPerTrail: trails.size > 0 ? Math.round(totalSteps / trails.size) : 0
      };
    }
  };
}
