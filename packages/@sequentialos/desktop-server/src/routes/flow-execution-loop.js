/**
 * flow-execution-loop.js
 *
 * Main flow execution loop with state transitions and error handling
 */

export function createExecutionLoop(timeoutHandler, stateExecutor) {
  const MAX_ITERATIONS = 1000;

  return {
    async execute(flow, input, statesArray, cancellationToken, taskRepository, taskService, executionLog) {
      let currentState = statesArray.find(s => s.type === 'initial' || s.id === flow.initial);

      if (!currentState) {
        throw new Error('Flow must have an initial state');
      }

      let result = input || {};
      let error = null;
      let cancelled = false;
      const executedStates = [];
      let iterations = 0;
      let timedOut = false;
      let timeoutInfo = null;

      while (currentState?.type !== 'final' && iterations < MAX_ITERATIONS) {
        iterations++;
        cancellationToken.throwIfCancelled();

        // Check flow timeout
        const flowTimeout = timeoutHandler.checkFlowTimeout(executionLog, statesArray);
        if (flowTimeout.timedOut) {
          timedOut = true;
          timeoutInfo = flowTimeout.info;
          currentState = flowTimeout.handler;
          continue;
        }

        executionLog.push(`Executing state: ${currentState.id}`);
        try {
          executedStates.push(currentState.id);

          // Execute state based on type
          result = await stateExecutor.executeStateByType(currentState, result, statesArray, taskRepository, taskService, executionLog);

          // Check state timeout
          const stateTimeout = timeoutHandler.checkStateTimeout(currentState, 0, executionLog, statesArray);
          if (stateTimeout.timedOut) {
            timedOut = true;
            timeoutInfo = stateTimeout.info;
            if (stateTimeout.useFallback) {
              result = stateTimeout.fallbackData;
            } else {
              currentState = stateTimeout.handler;
              continue;
            }
          }

          // Move to next state
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

      return {
        finalState: currentState?.id || 'unknown',
        executedStates,
        result,
        executionLog,
        timedOut,
        timeoutInfo,
        cancelled,
        error
      };
    }
  };
}
