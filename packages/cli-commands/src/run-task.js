/**
 * run-task.js - Run Task Facade
 *
 * Delegates to focused modules:
 * - task-loader: Load task files and functions
 * - task-dry-runner: Execute in dry-run mode
 * - task-executor-runner: Execute with runners (machine, flow)
 */

import { randomUUID } from 'crypto';
import logger from '@sequentialos/sequential-logging';
import { nowISO } from '@sequentialos/timestamp-utilities';
import { loadTaskFile, importTaskModule, extractTaskFunction, getTaskConfig } from './task-loader.js';
import { runDryRun } from './task-dry-runner.js';
import { executeMachineTask, executeFlowTask } from './task-executor-runner.js';

export async function runTask(options) {
  const { taskName, input = {}, save = false, dryRun = false, verbose = false } = options;

  try {
    if (verbose) {
      logger.info(`Running task: ${taskName}`);
      logger.info('Input:', input);
    }

    // Load task file
    const { codeFile } = await loadTaskFile(taskName);

    // Import task module
    const taskModule = await importTaskModule(codeFile);

    // Extract task function
    const taskFunction = extractTaskFunction(taskModule, taskName, codeFile);

    // Handle dry run
    if (dryRun) {
      return await runDryRun(taskFunction, taskName, input, verbose);
    }

    // Get task config and determine runner
    const config = getTaskConfig(taskModule);
    const runner = config.runner || 'sequential-flow';

    const runId = randomUUID();
    const runStartTime = nowISO();

    if (verbose) {
      logger.info(`Using ${runner} runner`);
    }

    if (runner === 'sequential-machine') {
      return await executeMachineTask(taskFunction, taskName, input, runId, runStartTime, verbose);
    } else {
      return await executeFlowTask(taskFunction, taskName, input, runId, runStartTime, save, verbose);
    }
  } catch (e) {
    const error = e instanceof Error ? e.message : String(e);
    const runId = randomUUID();
    const runStartTime = nowISO();

    const runData = {
      id: runId,
      taskName,
      status: 'error',
      input,
      error,
      startedAt: runStartTime,
      completedAt: nowISO()
    };

    if (verbose) {
      logger.error('Error:', error);
    }

    return runData;
  }
}
