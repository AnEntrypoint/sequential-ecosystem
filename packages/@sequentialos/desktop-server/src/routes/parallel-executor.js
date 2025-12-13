import { executeTaskWithTimeout, backgroundTaskManager } from '@sequentialos/server-utilities';

export async function executeParallelStates(currentState, statesArray, result, taskRepository, taskService, executionLog) {
  const branchIds = currentState.branches || [];
  if (branchIds.length === 0) throw new Error(`Parallel state ${currentState.id} has no branches`);
  const branchStates = branchIds.map(bid => statesArray.find(s => s.id === bid)).filter(Boolean);
  if (branchStates.length !== branchIds.length) throw new Error(`One or more branch states not found in parallel state ${currentState.id}`);
  executionLog.push(`Executing ${branchIds.length} parallel branches: ${branchIds.join(', ')}`);

  const branchResults = [];
  const branchErrors = [];
  const executeParallelBranch = async (branchState, branchIndex) => {
    try {
      let branchResult = result;
      let branchCurrent = branchState;
      let branchIterations = 0;

      while (branchCurrent && branchCurrent.type !== 'final' && branchIterations < 100) {
        branchIterations++;
        if (branchCurrent.handlerType === 'task' && branchCurrent.taskName) {
          const task = await taskRepository.get(branchCurrent.taskName);
          if (!task) throw new Error(`Task not found: ${branchCurrent.taskName}`);
          const runId = taskService.createRunId();
          let taskInput = {};
          if (branchCurrent.taskInput) {
            try {
              taskInput = JSON.parse(branchCurrent.taskInput);
            } catch {
              throw new Error(`Invalid JSON in taskInput: ${branchCurrent.taskInput}`);
            }
          }
          branchResult = await taskService.executeTask(runId, branchCurrent.taskName, task.code, taskInput);
        } else if (branchCurrent.code) {
          branchResult = await executeTaskWithTimeout(branchCurrent.id, branchCurrent.code, branchResult, 30000);
        }

        const nextStateId = branchCurrent.onDone;
        if (!nextStateId) break;
        branchCurrent = statesArray.find(s => s.id === nextStateId);
      }

      return { index: branchIndex, result: branchResult, error: null, completed: true };
    } catch (err) {
      return { index: branchIndex, result: null, error: err.message, completed: false };
    }
  };

  const parallelPromises = branchStates.map((bs, idx) => executeParallelBranch(bs, idx));
  const outcomes = await Promise.all(parallelPromises);

  outcomes.forEach(outcome => {
    if (outcome.completed) {
      branchResults[outcome.index] = outcome.result;
    } else {
      branchErrors.push({ branch: branchIds[outcome.index], error: outcome.error });
    }
  });

  const joinCondition = currentState.joinCondition || 'all';
  let joinMet = false;

  if (joinCondition === 'all') {
    joinMet = branchErrors.length === 0;
    if (!joinMet) throw new Error(`Parallel join condition 'all' failed: ${branchErrors.map(e => `${e.branch}: ${e.error}`).join('; ')}`);
  } else if (joinCondition === 'any') {
    joinMet = branchResults.length > 0;
    if (!joinMet) throw new Error('Parallel join condition \'any\' failed: all branches failed');
  } else if (joinCondition === 'all-or-error') {
    joinMet = true;
  }

  executionLog.push(`Parallel execution completed: ${branchResults.length}/${branchIds.length} branches succeeded (join: ${joinCondition})`);

  return {
    branches: branchResults,
    errors: branchErrors,
    joinCondition,
    branchCount: branchIds.length,
    successCount: branchResults.length,
    errorCount: branchErrors.length
  };
}

export async function executeBackgroundTask(currentState, executionLog) {
  const { id: bgTaskId } = backgroundTaskManager.spawn(currentState.taskName, [], {});
  const timeout = currentState.timeout || 30000;
  const bgResult = await Promise.race([
    backgroundTaskManager.waitFor(bgTaskId),
    new Promise((_, reject) => setTimeout(() => reject(new Error(`Background task timeout after ${timeout}ms`)), timeout))
  ]);
  if (bgResult.status !== 'completed') throw new Error(`Background task failed: ${bgResult.error || bgResult.status}`);
  executionLog.push(`Background task completed: ${bgTaskId}`);
  return { taskId: bgTaskId, status: bgResult.status, duration: bgResult.duration };
}

export async function executeTaskState(currentState, taskRepository, taskService, result, executionLog) {
  const task = await taskRepository.get(currentState.taskName);
  if (!task) throw new Error(`Task not found: ${currentState.taskName}`);
  const runId = taskService.createRunId();
  let taskInput = {};
  if (currentState.taskInput) {
    try {
      taskInput = JSON.parse(currentState.taskInput);
    } catch {
      throw new Error(`Invalid JSON in taskInput: ${currentState.taskInput}`);
    }
  }
  const result_out = await taskService.executeTask(runId, currentState.taskName, task.code, taskInput);
  executionLog.push(`Task output: ${JSON.stringify(result_out)}`);
  return result_out;
}

export async function executeCodeState(currentState, result, executionLog) {
  const result_out = await executeTaskWithTimeout(currentState.id, currentState.code, result, 30000);
  executionLog.push(`Code output: ${JSON.stringify(result_out)}`);
  return result_out;
}
