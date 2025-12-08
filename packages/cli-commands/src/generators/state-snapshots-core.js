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

export function createCheckpointStrategy() {
  return {
    strategies: {
      automatic: {
        interval: 30000,
        description: 'Create snapshot every 30 seconds'
      },
      stateChange: {
        description: 'Create snapshot when entering new state'
      },
      beforeRiskyOp: {
        description: 'Create snapshot before operations that might fail'
      },
      onError: {
        description: 'Create snapshot when error occurs'
      }
    },

    shouldCheckpoint(strategy, previousTimestamp = null) {
      if (strategy === 'automatic') {
        if (!previousTimestamp) return true;
        return Date.now() - previousTimestamp >= this.strategies.automatic.interval;
      }

      if (strategy === 'onStateChange') {
        return true;
      }

      if (strategy === 'beforeRiskyOp') {
        return true;
      }

      if (strategy === 'onError') {
        return true;
      }

      return false;
    },

    getStrategyDescription(strategy) {
      return this.strategies[strategy]?.description || 'Unknown strategy';
    }
  };
}

export function generateSnapshotTemplate() {
  return `/**
 * State Snapshots & Checkpointing
 *
 * Save flow state at checkpoints and resume from snapshots.
 */

import { createSnapshotManager, createCheckpointStrategy } from '@sequential/state-snapshots';

const snapshotManager = createSnapshotManager();
const checkpointStrategy = createCheckpointStrategy();

let lastCheckpoint = null;

export const graph = {
  initial: 'start',
  states: {
    start: { onDone: 'step1' },
    step1: { onDone: 'step2' },
    step2: { onDone: 'step3' },
    step3: { onDone: 'final' },
    final: { type: 'final' }
  }
};

export async function step1(input) {
  // Create checkpoint before risky operation
  const snapshot = snapshotManager.createSnapshot(
    'my-flow',
    'my-flow-name',
    'step1',
    input,
    { checkpointType: 'beforeRiskyOp', reason: 'Before API call' }
  );

  lastCheckpoint = snapshot.snapshotId;

  try {
    const result = await __callHostTool__('task', 'api-call', input);
    return result;
  } catch (error) {
    // On error, snapshot is already saved
    throw error;
  }
}

export async function step2(input) {
  // Processing step
  return { ...input, step2: 'done' };
}

export async function step3(input) {
  // Checkpoint after successful milestone
  const snapshot = snapshotManager.createSnapshot(
    'my-flow',
    'my-flow-name',
    'step3',
    input,
    { checkpointType: 'stateChange', reason: 'Entered step3' }
  );

  lastCheckpoint = snapshot.snapshotId;

  return { ...input, step3: 'done' };
}

// Resume from checkpoint
export async function resumeFromSnapshot(snapshotId, flowRunner) {
  const restored = await snapshotManager.restoreFromSnapshot(snapshotId, flowRunner);

  console.log(\`Resumed from state: \${restored.currentState}\`);
  console.log(\`Context restored: \${JSON.stringify(restored.context)}\`);

  return restored;
}

// Get snapshots for this flow
export function getFlowSnapshots() {
  return snapshotManager.listSnapshots('my-flow');
}

// Get last checkpoint
export function getLastCheckpoint() {
  return lastCheckpoint;
}

// Memory management
export function getSnapshotStats() {
  const memory = snapshotManager.getMemoryUsage();
  const snapshots = snapshotManager.listSnapshots('my-flow');

  return {
    snapshots,
    memory,
    recommendations: [
      memory.snapshotCount > 50 ? 'Consider pruning old snapshots' : null,
      memory.totalBytes > 10000000 ? 'High memory usage - implement TTL' : null
    ].filter(Boolean)
  };
}

// Prune old snapshots
export function pruneSnapshots(keepCount = 10) {
  return snapshotManager.pruneOldSnapshots('my-flow', keepCount);
}
`;
}

export function validateSnapshotConfig(config) {
  const errors = [];

  if (config.maxSnapshots && config.maxSnapshots < 1) {
    errors.push('maxSnapshots must be >= 1');
  }

  if (config.maxSize && config.maxSize < 1000) {
    errors.push('maxSize must be >= 1000 bytes');
  }

  if (config.ttl && config.ttl < 0) {
    errors.push('ttl must be >= 0');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}
