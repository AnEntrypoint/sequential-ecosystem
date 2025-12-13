/**
 * flow-state-executor.js
 *
 * Execute different types of flow states (task, code, parallel)
 */

import { executeParallelStates, executeBackgroundTask, executeTaskState, executeCodeState } from './parallel-executor.js';

export async function executeStateByType(currentState, result, statesArray, taskRepository, taskService, executionLog) {
  if (currentState.type === 'if') {
    return await handleIfState(currentState, result, executionLog, statesArray);
  } else if (currentState.type === 'switch') {
    return await handleSwitchState(currentState, result, executionLog, statesArray);
  } else if (currentState.type === 'parallel') {
    return await executeParallelStates(currentState, statesArray, result, taskRepository, taskService, executionLog);
  } else if (currentState.handlerType === 'background-task' && currentState.taskName) {
    return await executeBackgroundTask(currentState, executionLog);
  } else if (currentState.handlerType === 'task' && currentState.taskName) {
    return await executeTaskState(currentState, taskRepository, taskService, result, executionLog);
  } else if (currentState.code) {
    return await executeCodeState(currentState, result, executionLog);
  }
  return result;
}

async function handleIfState(currentState, result, executionLog, statesArray) {
  let conditionResult = false;
  try {
    if (currentState.condition) {
      const conditionFn = typeof currentState.condition === 'string'
        ? new Function('input', `return ${currentState.condition}`)
        : currentState.condition;
      conditionResult = await conditionFn(result);
    }
  } catch (err) {
    executionLog.push(`Condition evaluation error: ${err.message}`);
    conditionResult = false;
  }
  const nextStateId = conditionResult ? currentState.onTrue : currentState.onFalse;
  executionLog.push(`If condition evaluated to: ${conditionResult}, routing to ${nextStateId}`);
  if (!nextStateId) throw new Error(`No routing defined for if-state ${currentState.id}`);
  return result;
}

async function handleSwitchState(currentState, result, executionLog, statesArray) {
  let switchValue = result;
  try {
    if (currentState.expression) {
      const exprFn = typeof currentState.expression === 'string'
        ? new Function('input', `return ${currentState.expression}`)
        : currentState.expression;
      switchValue = await exprFn(result);
    }
  } catch (err) {
    executionLog.push(`Switch expression error: ${err.message}`);
    switchValue = 'error';
  }
  const nextStateId = currentState.cases?.[switchValue] || currentState.default;
  executionLog.push(`Switch expression evaluated to: ${switchValue}, routing to ${nextStateId}`);
  if (!nextStateId) throw new Error(`No case or default defined for switch-state ${currentState.id}`);
  return result;
}
