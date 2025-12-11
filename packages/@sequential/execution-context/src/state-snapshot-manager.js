/**
 * state-snapshot-manager.js
 *
 * State snapshots and execution history
 */

export function createStateSnapshotManager() {
  const stateSnapshots = new Map();

  return {
    recordSnapshot(stateName, snapshot) {
      stateSnapshots.set(stateName, snapshot);
      return snapshot;
    },

    getSnapshot(stateName) {
      return stateSnapshots.get(stateName) || null;
    },

    getAllSnapshots() {
      return Array.from(stateSnapshots.entries()).map(([state, snapshot]) => ({
        state,
        snapshot
      }));
    },

    clearSnapshots() {
      stateSnapshots.clear();
    },

    getSnapshotCount() {
      return stateSnapshots.size;
    },

    getSnapshotsMap() {
      return stateSnapshots;
    },

    getSummary(stateStackManager) {
      const completedStates = Array.from(stateSnapshots.values());
      const totalDuration = completedStates.reduce((sum, s) => sum + (s.duration || 0), 0);

      return {
        statesVisited: stateStackManager.getAllStates().length,
        statesCompleted: completedStates.length,
        currentPath: stateStackManager.getAllStates().map((s) => s.state),
        totalDuration: totalDuration,
        averageStateDuration: completedStates.length > 0 ? totalDuration / completedStates.length : 0
      };
    }
  };
}
