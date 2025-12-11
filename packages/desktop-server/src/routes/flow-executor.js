import { TimeoutPolicyEngine } from './timeout-policies.js';
import { executeParallelStates, executeBackgroundTask, executeTaskState, executeCodeState } from './parallel-executor.js';

export async function executeFlow(flow, input, executionId, cancellationToken, taskRepository, taskService) {
  const startTime = Date.now();
  const statesArray = Array.isArray(flow.states) ? flow.states : Object.entries(flow.states).map(([id, state]) => ({ id, ...state }));
  let currentState = statesArray.find(s => s.type === 'initial' || s.id === flow.initial);

  if (!currentState) {
    throw new Error('Flow must have an initial state');
  }

  const executionLog = [];
  let result = input || {};
  let error = null;
  let cancelled = false;
  const executedStates = [];
  const MAX_ITERATIONS = 1000;
  let iterations = 0;
  const timeoutEngine = new TimeoutPolicyEngine(flow.flowTimeout || 30000);
  let timedOut = false;
  let timeoutInfo = null;

  try {
    while (currentState?.type !== 'final' && iterations < MAX_ITERATIONS) {
      iterations++;
      cancellationToken.throwIfCancelled();

      const flowTimeoutCheck = timeoutEngine.checkFlowTimeout();
      if (flowTimeoutCheck.timedOut) {
        timedOut = true;
        timeoutInfo = { type: 'flow', ...flowTimeoutCheck };
        executionLog.push(`Flow timeout exceeded: ${flowTimeoutCheck.elapsed}ms > ${flowTimeoutCheck.limit}ms`);
        if (flow.onFlowTimeout) {
          const timeoutHandler = statesArray.find(s => s.id === flow.onFlowTimeout);
          if (timeoutHandler) {
            currentState = timeoutHandler;
            continue;
          }
        }
        throw new Error(`Flow execution timeout: ${flowTimeoutCheck.exceeded}ms over limit`);
      }

      executionLog.push(`Executing state: ${currentState.id}`);
      try {
        executedStates.push(currentState.id);

        if (currentState.type === 'if') {
          result = await handleIfState(currentState, result, executionLog, statesArray);
        } else if (currentState.type === 'switch') {
          result = await handleSwitchState(currentState, result, executionLog, statesArray);
        } else if (currentState.type === 'parallel') {
          result = await executeParallelStates(currentState, statesArray, result, taskRepository, taskService, executionLog);
        } else if (currentState.handlerType === 'background-task' && currentState.taskName) {
          result = await executeBackgroundTask(currentState, executionLog);
        } else if (currentState.handlerType === 'task' && currentState.taskName) {
          result = await executeTaskState(currentState, taskRepository, taskService, result, executionLog);
        } else if (currentState.code) {
          result = await executeCodeState(currentState, result, executionLog);
        }

        if (currentState.timeout) {
          const stateTimeoutCheck = timeoutEngine.checkStateTimeout(currentState.id, timeoutEngine.getElapsedTime(), currentState.timeout);
          if (stateTimeoutCheck.timedOut) {
            timedOut = true;
            timeoutInfo = { type: 'state', state: currentState.id, ...stateTimeoutCheck };
            executionLog.push(`State timeout exceeded: ${stateTimeoutCheck.elapsed}ms > ${stateTimeoutCheck.limit}ms`);

            if (currentState.onTimeout) {
              const timeoutHandler = statesArray.find(s => s.id === currentState.onTimeout);
              if (timeoutHandler) {
                executionLog.push(`Routing to timeout handler: ${currentState.onTimeout}`);
                currentState = timeoutHandler;
                continue;
              }
            }

            if (currentState.fallbackData !== undefined) {
              result = currentState.fallbackData;
              executionLog.push(`Using fallback data due to timeout`);
            } else {
              throw new Error(`State '${currentState.id}' timeout: ${stateTimeoutCheck.exceeded}ms over limit`);
            }
          }
        }

        const nextStateId = currentState.onDone;
        if (!nextStateId) {
          executionLog.push(`No onDone state defined for ${currentState.id}, ending execution`);
          break;
        }
        const nextState = statesArray.find(s => s.id === nextStateId);
        if (!nextState) {
          throw new Error(`State '${nextStateId}' not found in flow`);
        }
        currentState = nextState;
      } catch (err) {
        if (err.message.includes('cancelled')) {
          cancelled = true;
          executionLog.push(`Flow cancelled: ${err.message}`);
          break;
        }
        error = err.message;
        executionLog.push(`Error: ${err.message}`);
        const fallbackStateId = currentState.onError;
        if (fallbackStateId) {
          const fallbackState = statesArray.find(s => s.id === fallbackStateId);
          if (fallbackState) {
            currentState = fallbackState;
            error = null;
          } else {
            throw new Error(`Error handler state '${fallbackStateId}' not found in flow`);
          }
        } else {
          break;
        }
      }
    }

    if (iterations >= MAX_ITERATIONS) {
      error = `Flow execution exceeded maximum iterations (${MAX_ITERATIONS})`;
      executionLog.push(error);
    }

    const duration = Date.now() - startTime;
    return {
      duration,
      finalState: currentState?.id || 'unknown',
      executedStates,
      result,
      executionLog,
      timedOut,
      timeoutInfo,
      cancelled,
      error
    };
  } catch (err) {
    return {
      duration: Date.now() - startTime,
      executedStates,
      executionLog,
      error: err.message,
      timedOut,
      timeoutInfo
    };
  }
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
