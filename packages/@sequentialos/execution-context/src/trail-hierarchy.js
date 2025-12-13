/**
 * trail-hierarchy.js
 *
 * Child trail creation and hierarchy management
 */

export function createTrailHierarchy(storage) {
  return {
    createChildTrail(parentExecutionId, childName) {
      const parentTrail = storage.getTrail(parentExecutionId);
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

      storage.getTrailsMap().set(childId, childTrail);
      return childTrail;
    },

    getTrailChain(executionId) {
      const trails = storage.getTrailsMap();
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
    }
  };
}
