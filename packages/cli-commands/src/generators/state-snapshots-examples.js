/**
 * State Snapshots Examples
 * Template content for state snapshots and checkpointing
 */

export const STATE_SNAPSHOTS_TEMPLATE = `/**
 * State Snapshots & Checkpointing
 *
 * Save flow state at checkpoints and resume from snapshots.
 */

import { createSnapshotManager, createCheckpointStrategy } from '@sequentialos/state-snapshots';

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
