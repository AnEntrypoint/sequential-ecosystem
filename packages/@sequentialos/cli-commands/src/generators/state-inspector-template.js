export function generateStateInspectorTemplate() {
  return `/**
 * State Inspector
 *
 * Debug and analyze task pause/resume states at each checkpoint.
 */

import { createStateInspector } from '@sequentialos/state-inspector';

const inspector = createStateInspector(stateManager);

// Record checkpoints as task executes
export async function longRunningTask(input) {
  const taskRunId = __context__.runId;

  // Checkpoint 1: After fetching user
  const user = await fetch(\\\`/api/users/\\\${input.userId}\\\`).then(r => r.json());
  inspector.recordCheckpoint(taskRunId, 'fetch-user', 'paused', 5, { user });

  // Checkpoint 2: After validating user
  const validated = validateUser(user);
  inspector.recordCheckpoint(taskRunId, 'validate-user', 'paused', 10, { user, validated });

  // Checkpoint 3: After creating orders
  const orders = await __callHostTool__('database', 'createOrders', { userId: user.id });
  inspector.recordCheckpoint(taskRunId, 'create-orders', 'paused', 15, { user, validated, orders });

  return { user, validated, orders };
}

// Inspect checkpoints
export function inspectTaskExecution(taskRunId) {
  const checkpoints = inspector.getTaskCheckpoints(taskRunId);
  const timeline = inspector.getCheckpointTimeline(taskRunId);
  const analysis = inspector.analyzeCheckpoints(taskRunId);

  console.log('Checkpoints:', checkpoints.length);
  console.log('Timeline:', timeline);
  console.log('Analysis:');
  console.log('  - Slowest:', analysis.slowestCheckpoint);
  console.log('  - Largest data:', analysis.largestDataCheckpoint);

  return { checkpoints, timeline, analysis };
}

// Get data available at specific checkpoint
export function getCheckpointData(taskRunId, checkpointId) {
  const data = inspector.getCheckpointData(taskRunId, checkpointId);
  console.log('Checkpoint data:', data);
  return data;
}

// Debug resume failures
export function debugResumeFailure(taskRunId) {
  const checkpoints = inspector.getTaskCheckpoints(taskRunId);
  const lastCheckpoint = checkpoints[checkpoints.length - 1];

  if (!lastCheckpoint) {
    console.log('No checkpoints recorded');
    return;
  }

  console.log('Last successful checkpoint:', lastCheckpoint.id);
  console.log('Data available for resume:');
  const data = inspector.getCheckpointData(taskRunId, lastCheckpoint.id);
  console.log(JSON.stringify(data.data, null, 2));

  const resumePayload = inspector.getResumePayload(taskRunId, lastCheckpoint.id);
  console.log('Resume payload:', resumePayload);

  return resumePayload;
}

// Compare two execution runs
export function compareExecutions(run1Id, cp1, run2Id, cp2) {
  const comparison = inspector.compareCheckpoints(run1Id, cp1, run2Id, cp2);
  console.log('Data added:', comparison.added);
  console.log('Data removed:', comparison.removed);
  console.log('Data modified:', comparison.modified);
  return comparison;
}

// Export checkpoint data for analysis
export function exportRunData(taskRunId) {
  const exported = inspector.exportCheckpoints(taskRunId);
  console.log('Exported:', exported);
  return exported;
}
`;
}
