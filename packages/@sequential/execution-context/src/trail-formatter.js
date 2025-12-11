/**
 * trail-formatter.js
 *
 * Trail formatting and summaries
 */

export function createTrailFormatter(storage) {
  return {
    getTrailSummary(executionId) {
      const trail = storage.getTrail(executionId);
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
      const trail = storage.getTrail(executionId);
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

      const trail = storage.getTrail(executionId);
      if (!trail) {
        return error;
      }

      error.executionTrail = {
        origin: trail.origin,
        steps: trail.steps,
        summary: this.formatTrailForDisplay(executionId)
      };

      return error;
    }
  };
}
