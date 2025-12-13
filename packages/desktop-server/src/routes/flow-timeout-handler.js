/**
 * flow-timeout-handler.js
 *
 * Handle flow and state timeouts with timeout policies
 */

import { TimeoutPolicyEngine } from './timeout-policies.js';

export function createTimeoutHandler(flow) {
  const timeoutEngine = new TimeoutPolicyEngine(flow.flowTimeout || 30000);

  return {
    checkFlowTimeout(executionLog, statesArray) {
      const flowTimeoutCheck = timeoutEngine.checkFlowTimeout();
      if (flowTimeoutCheck.timedOut) {
        executionLog.push(`Flow timeout exceeded: ${flowTimeoutCheck.elapsed}ms > ${flowTimeoutCheck.limit}ms`);

        if (flow.onFlowTimeout) {
          const timeoutHandler = statesArray.find(s => s.id === flow.onFlowTimeout);
          if (timeoutHandler) {
            return { timedOut: true, handler: timeoutHandler, info: { type: 'flow', ...flowTimeoutCheck } };
          }
        }

        throw new Error(`Flow execution timeout: ${flowTimeoutCheck.exceeded}ms over limit`);
      }
      return { timedOut: false };
    },

    checkStateTimeout(currentState, elapsedTime, executionLog, statesArray) {
      if (!currentState.timeout) return { timedOut: false };

      const stateTimeoutCheck = timeoutEngine.checkStateTimeout(currentState.id, elapsedTime, currentState.timeout);
      if (stateTimeoutCheck.timedOut) {
        executionLog.push(`State timeout exceeded: ${stateTimeoutCheck.elapsed}ms > ${stateTimeoutCheck.limit}ms`);

        if (currentState.onTimeout) {
          const timeoutHandler = statesArray.find(s => s.id === currentState.onTimeout);
          if (timeoutHandler) {
            executionLog.push(`Routing to timeout handler: ${currentState.onTimeout}`);
            return { timedOut: true, handler: timeoutHandler, info: { type: 'state', state: currentState.id, ...stateTimeoutCheck } };
          }
        }

        if (currentState.fallbackData !== undefined) {
          executionLog.push('Using fallback data due to timeout');
          return { timedOut: true, useFallback: true, fallbackData: currentState.fallbackData };
        }

        throw new Error(`State '${currentState.id}' timeout: ${stateTimeoutCheck.exceeded}ms over limit`);
      }
      return { timedOut: false };
    }
  };
}
