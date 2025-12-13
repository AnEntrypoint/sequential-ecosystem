/**
 * flow-executor.js - Flow Executor Facade
 *
 * Delegates to focused modules:
 * - flow-state-executor: Execute different state types
 * - flow-timeout-handler: Handle flow and state timeouts
 * - flow-execution-loop: Main execution loop
 */

import { executeStateByType } from './flow-state-executor.js';
import { createTimeoutHandler } from './flow-timeout-handler.js';
import { createExecutionLoop } from './flow-execution-loop.js';

export async function executeFlow(flow, input, executionId, cancellationToken, taskRepository, taskService) {
  const startTime = Date.now();
  const statesArray = Array.isArray(flow.states) ? flow.states : Object.entries(flow.states).map(([id, state]) => ({ id, ...state }));
  const executionLog = [];

  // Create handlers
  const timeoutHandler = createTimeoutHandler(flow);
  const stateExecutor = { executeStateByType };
  const executionLoop = createExecutionLoop(timeoutHandler, stateExecutor);

  try {
    const loopResult = await executionLoop.execute(flow, input, statesArray, cancellationToken, taskRepository, taskService, executionLog);
    const duration = Date.now() - startTime;

    return {
      duration,
      finalState: loopResult.finalState,
      executedStates: loopResult.executedStates,
      result: loopResult.result,
      executionLog: loopResult.executionLog,
      timedOut: loopResult.timedOut,
      timeoutInfo: loopResult.timeoutInfo,
      cancelled: loopResult.cancelled,
      error: loopResult.error
    };
  } catch (err) {
    return {
      duration: Date.now() - startTime,
      executedStates: [],
      executionLog,
      error: err.message,
      timedOut: false
    };
  }
}
