export function createTrailTracker(bufferSize = 5) {
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

    getTrailSummary(executionId) {
      const trail = trails.get(executionId);
      if (!trail) {
        return null;
      }

      return {
        executionId: executionId,
        origin: trail.origin,
        stepCount: trail.steps.length,
        steps: trail.steps.map((s) => s.name),
        duration: new Date() - new Date(trail.startedAt)
      };
    },

    formatTrailForDisplay(executionId) {
      const trail = trails.get(executionId);
      if (!trail) {
        return null;
      }

      const lines = [];
      lines.push(`Execution Trail: ${executionId}`);
      lines.push(`Origin: ${trail.origin.source} (${trail.origin.initiator})`);
      lines.push(`Started: ${trail.origin.timestamp}`);
      lines.push('');
      lines.push('Steps:');

      for (let i = 0; i < trail.steps.length; i++) {
        const step = trail.steps[i];
        lines.push(`  ${i + 1}. ${step.name} [${step.type}]`);
      }

      return lines.join('\n');
    },

    enrichErrorWithTrail(error, executionId) {
      if (!error) return null;

      const trail = trails.get(executionId);
      if (!trail) {
        return error;
      }

      error.executionTrail = {
        origin: trail.origin,
        steps: trail.steps,
        summary: this.formatTrailForDisplay(executionId)
      };

      return error;
    },

    createChildTrail(parentExecutionId, childName) {
      const parentTrail = trails.get(parentExecutionId);
      if (!parentTrail) {
        return null;
      }

      const childId = `${parentExecutionId}:${childName}:${Date.now()}`;
      const childTrail = {
        executionId: childId,
        parentExecutionId: parentExecutionId,
        origin: parentTrail.origin,
        steps: [],
        startedAt: new Date().toISOString(),
        childName: childName
      };

      trails.set(childId, childTrail);
      return childTrail;
    },

    getTrailChain(executionId) {
      const chain = [];
      let current = trails.get(executionId);

      while (current) {
        chain.unshift(current);
        if (current.parentExecutionId) {
          current = trails.get(current.parentExecutionId);
        } else {
          current = null;
        }
      }

      return chain.map((t) => ({
        executionId: t.executionId,
        origin: t.origin,
        childName: t.childName || null
      }));
    },

    getTrailMetadata(executionId) {
      const trail = trails.get(executionId);
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

    clearTrail(executionId) {
      if (executionId) {
        trails.delete(executionId);
      } else {
        trails.clear();
      }
    },

    getActiveTrails() {
      return Array.from(trails.keys());
    },

    getTrailStatistics() {
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
