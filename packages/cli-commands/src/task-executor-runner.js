/**
 * task-executor-runner.js
 *
 * Execute tasks with different runners (sequential-machine, sequential-flow)
 */

import { createAdapter } from '@sequentialos/sequential-adaptor';
import { nowISO } from '@sequentialos/timestamp-utilities';
import path from 'path';

export async function executeMachineTask(taskFunction, taskName, input, runId, runStartTime, verbose) {
  const result = await taskFunction(input);

  const runData = {
    id: runId,
    taskName,
    runner: 'sequential-machine',
    status: 'success',
    input,
    output: result,
    startedAt: runStartTime,
    completedAt: nowISO()
  };

  if (verbose) {
    console.info('Result:', result);
  }

  return runData;
}

export async function executeFlowTask(taskFunction, taskName, input, runId, runStartTime, save, verbose) {
  const tasksDir = path.resolve(process.cwd(), 'tasks');
  const adapter = await createAdapter('folder', { basePath: tasksDir });

  try {
    await adapter.createTaskRun({
      id: runId,
      taskName,
      status: 'running',
      input,
      startedAt: runStartTime
    });

    const result = await taskFunction(input);

    const runData = {
      id: runId,
      taskName,
      runner: 'sequential-flow',
      status: 'success',
      input,
      output: result,
      startedAt: runStartTime,
      completedAt: nowISO()
    };

    if (save) {
      await adapter.updateTaskRun(runId, {
        status: 'success',
        output: result,
        completedAt: nowISO()
      });
    }

    if (verbose) {
      console.info('Result:', result);
    }

    return runData;
  } finally {
    await adapter.close();
  }
}
