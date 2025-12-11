export function createSnapshotManager() {
  const snapshots = new Map();

  return {
    createSnapshot(flowId, flowName, currentState, context, metadata = {}) {
      const snapshotId = `${flowId}-${Date.now()}`;

      snapshots.set(snapshotId, {
        id: snapshotId,
        flowId,
        flowName,
        currentState,
        context: JSON.parse(JSON.stringify(context)),
        metadata: {
          createdAt: new Date().toISOString(),
          checkpointType: metadata.checkpointType || 'manual',
          reason: metadata.reason || null,
          ...metadata
        }
      });

      return {
        snapshotId,
        timestamp: snapshots.get(snapshotId).metadata.createdAt
      };
    },

    getSnapshot(snapshotId) {
      return snapshots.get(snapshotId);
    },

    listSnapshots(flowId) {
      const flowSnapshots = [];

      for (const [id, snapshot] of snapshots.entries()) {
        if (snapshot.flowId === flowId) {
          flowSnapshots.push({
            id,
            state: snapshot.currentState,
            createdAt: snapshot.metadata.createdAt,
            type: snapshot.metadata.checkpointType
          });
        }
      }

      return flowSnapshots.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    },

    deleteSnapshot(snapshotId) {
      return snapshots.delete(snapshotId);
    },

    async restoreFromSnapshot(snapshotId, flowRunner) {
      const snapshot = this.getSnapshot(snapshotId);
      if (!snapshot) {
        throw new Error(`Snapshot not found: ${snapshotId}`);
      }

      return {
        flowId: snapshot.flowId,
        currentState: snapshot.currentState,
        context: snapshot.context,
        resumedFrom: snapshotId,
        resumedAt: new Date().toISOString()
      };
    },

    getMemoryUsage() {
      let totalSize = 0;

      for (const snapshot of snapshots.values()) {
        totalSize += JSON.stringify(snapshot).length;
      }

      return {
        snapshotCount: snapshots.size,
        totalBytes: totalSize,
        averageBytesPerSnapshot: snapshots.size > 0 ? Math.round(totalSize / snapshots.size) : 0
      };
    },

    pruneOldSnapshots(flowId, keepCount = 10) {
      const flowSnapshots = this.listSnapshots(flowId);

      if (flowSnapshots.length > keepCount) {
        const toDelete = flowSnapshots.slice(keepCount);
        for (const snapshot of toDelete) {
          this.deleteSnapshot(snapshot.id);
        }
      }

      return { deleted: Math.max(0, flowSnapshots.length - keepCount) };
    }
  };
}
