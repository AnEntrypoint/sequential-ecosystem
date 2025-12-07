export function createStateInspector(stateManager) {
  const checkpoints = new Map();

  return {
    recordCheckpoint(taskRunId, checkpointId, state, line, data) {
      const key = `${taskRunId}:${checkpointId}`;

      checkpoints.set(key, {
        taskRunId,
        checkpointId,
        state,
        line,
        data: JSON.parse(JSON.stringify(data)),
        timestamp: new Date().toISOString(),
        duration: 0
      });

      return this;
    },

    recordCheckpointDuration(taskRunId, checkpointId, duration) {
      const key = `${taskRunId}:${checkpointId}`;
      const checkpoint = checkpoints.get(key);

      if (checkpoint) {
        checkpoint.duration = duration;
      }

      return this;
    },

    getTaskCheckpoints(taskRunId) {
      const taskCheckpoints = [];

      for (const [key, checkpoint] of checkpoints.entries()) {
        if (checkpoint.taskRunId === taskRunId) {
          taskCheckpoints.push({
            id: checkpoint.checkpointId,
            state: checkpoint.state,
            line: checkpoint.line,
            timestamp: checkpoint.timestamp,
            duration: checkpoint.duration,
            dataKeys: Object.keys(checkpoint.data),
            dataSize: JSON.stringify(checkpoint.data).length
          });
        }
      }

      return taskCheckpoints.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    },

    getCheckpointData(taskRunId, checkpointId) {
      const key = `${taskRunId}:${checkpointId}`;
      const checkpoint = checkpoints.get(key);

      if (!checkpoint) {
        throw new Error(`Checkpoint not found: ${key}`);
      }

      return {
        checkpointId: checkpoint.checkpointId,
        state: checkpoint.state,
        timestamp: checkpoint.timestamp,
        duration: checkpoint.duration,
        data: checkpoint.data
      };
    },

    getResumePayload(taskRunId, fromCheckpoint) {
      const key = `${taskRunId}:${fromCheckpoint}`;
      const checkpoint = checkpoints.get(key);

      if (!checkpoint) {
        throw new Error(`Cannot resume from checkpoint: ${fromCheckpoint}`);
      }

      return {
        taskRunId,
        resumeFrom: fromCheckpoint,
        resumeAt: new Date().toISOString(),
        context: checkpoint.data,
        executionLine: checkpoint.line
      };
    },

    getCheckpointTimeline(taskRunId) {
      const taskCheckpoints = this.getTaskCheckpoints(taskRunId);
      const timeline = [];

      let cumulativeDuration = 0;

      for (let i = 0; i < taskCheckpoints.length; i++) {
        const cp = taskCheckpoints[i];
        const next = taskCheckpoints[i + 1];
        const interval = next
          ? new Date(next.timestamp) - new Date(cp.timestamp)
          : 0;

        cumulativeDuration += cp.duration;

        timeline.push({
          checkpoint: cp.id,
          state: cp.state,
          duration: cp.duration,
          interval: Math.round(interval),
          cumulativeDuration,
          timestamp: cp.timestamp,
          dataSize: cp.dataSize
        });
      }

      return timeline;
    },

    analyzeCheckpoints(taskRunId) {
      const taskCheckpoints = this.getTaskCheckpoints(taskRunId);
      const timeline = this.getCheckpointTimeline(taskRunId);

      const slowestCheckpoint = timeline.reduce((max, cp) =>
        cp.duration > max.duration ? cp : max,
        { duration: 0 }
      );

      const largestData = taskCheckpoints.reduce((max, cp) =>
        cp.dataSize > max.dataSize ? cp : max,
        { dataSize: 0 }
      );

      return {
        totalCheckpoints: taskCheckpoints.length,
        totalDuration: timeline[timeline.length - 1]?.cumulativeDuration || 0,
        slowestCheckpoint: {
          id: slowestCheckpoint.checkpoint,
          duration: slowestCheckpoint.duration,
          percentage: timeline.length > 0
            ? ((slowestCheckpoint.duration / timeline.reduce((sum, cp) => sum + cp.duration, 0)) * 100).toFixed(2)
            : 0
        },
        largestDataCheckpoint: {
          id: largestData.id,
          size: largestData.dataSize,
          keys: largestData.dataKeys
        },
        timeline
      };
    },

    compareCheckpoints(taskRunId1, checkpoint1, taskRunId2, checkpoint2) {
      const data1 = this.getCheckpointData(taskRunId1, checkpoint1);
      const data2 = this.getCheckpointData(taskRunId2, checkpoint2);

      const keys1 = Object.keys(data1.data);
      const keys2 = Object.keys(data2.data);

      const added = keys2.filter(k => !keys1.includes(k));
      const removed = keys1.filter(k => !keys2.includes(k));
      const modified = keys1.filter(k => keys2.includes(k) && data1.data[k] !== data2.data[k]);

      return {
        added,
        removed,
        modified,
        data1,
        data2
      };
    },

    exportCheckpoints(taskRunId) {
      const taskCheckpoints = this.getTaskCheckpoints(taskRunId);
      const timeline = this.getCheckpointTimeline(taskRunId);
      const analysis = this.analyzeCheckpoints(taskRunId);

      return {
        taskRunId,
        exportedAt: new Date().toISOString(),
        checkpoints: taskCheckpoints,
        timeline,
        analysis
      };
    },

    clearCheckpoints(taskRunId) {
      const keysToDelete = [];

      for (const key of checkpoints.keys()) {
        if (key.startsWith(taskRunId)) {
          keysToDelete.push(key);
        }
      }

      keysToDelete.forEach(key => checkpoints.delete(key));
      return this;
    }
  };
}

export function generateStateInspectorTemplate() {
  return `/**
 * State Inspector
 *
 * Debug and analyze task pause/resume states at each checkpoint.
 */

import { createStateInspector } from '@sequential/state-inspector';

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
