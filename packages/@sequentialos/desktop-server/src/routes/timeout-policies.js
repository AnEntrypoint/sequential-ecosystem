export class TimeoutPolicyEngine {
  constructor(flowTimeout = 30000) {
    this.flowStartTime = Date.now();
    this.flowTimeout = flowTimeout;
    this.stateTimeouts = {};
  }

  checkStateTimeout(stateName, elapsed, stateTimeout) {
    if (elapsed > stateTimeout) {
      return { timedOut: true, elapsed, limit: stateTimeout, exceeded: elapsed - stateTimeout };
    }
    return { timedOut: false, elapsed, limit: stateTimeout };
  }

  checkFlowTimeout() {
    const elapsed = Date.now() - this.flowStartTime;
    if (elapsed > this.flowTimeout) {
      return { timedOut: true, elapsed, limit: this.flowTimeout, exceeded: elapsed - this.flowTimeout };
    }
    return { timedOut: false, elapsed, limit: this.flowTimeout };
  }

  recordStateTimeout(stateName, duration) {
    this.stateTimeouts[stateName] = duration;
  }

  calculateBackoffDelay(attempt, initialDelay = 100, multiplier = 2, maxDelay = 5000) {
    const delay = initialDelay * Math.pow(multiplier, attempt - 1);
    return Math.min(delay, maxDelay);
  }

  getElapsedTime() {
    return Date.now() - this.flowStartTime;
  }
}

export class TimeoutPolicyValidator {
  validate(policy) {
    const issues = [];

    if (policy.stateTimeout && policy.stateTimeout < 100) {
      issues.push('State timeout must be >= 100ms');
    }
    if (policy.flowTimeout < 1000) {
      issues.push('Flow timeout must be >= 1000ms');
    }
    if (policy.flowTimeout && policy.stateTimeout && policy.flowTimeout < policy.stateTimeout) {
      issues.push('Flow timeout must be >= state timeout');
    }

    return { valid: issues.length === 0, issues };
  }
}

export function handleFlowTimeout(flowTimeoutCheck, flow, statesArray, executionLog) {
  if (!flowTimeoutCheck.timedOut) return null;

  executionLog.push(`Flow timeout exceeded: ${flowTimeoutCheck.elapsed}ms > ${flowTimeoutCheck.limit}ms`);

  if (flow.onFlowTimeout) {
    const timeoutHandler = statesArray.find(s => s.id === flow.onFlowTimeout);
    if (timeoutHandler) {
      return { handled: true, nextState: timeoutHandler };
    }
  }

  return { handled: false, error: `Flow execution timeout: ${flowTimeoutCheck.exceeded}ms over limit` };
}

export function handleStateTimeout(stateTimeoutCheck, currentState, statesArray, executionLog) {
  if (!stateTimeoutCheck.timedOut) return null;

  executionLog.push(`State timeout exceeded: ${stateTimeoutCheck.elapsed}ms > ${stateTimeoutCheck.limit}ms`);

  if (currentState.onTimeout) {
    const timeoutHandler = statesArray.find(s => s.id === currentState.onTimeout);
    if (timeoutHandler) {
      executionLog.push(`Routing to timeout handler: ${currentState.onTimeout}`);
      return { handled: true, nextState: timeoutHandler, shouldContinue: true };
    }
  }

  if (currentState.fallbackData !== undefined) {
    executionLog.push('Using fallback data due to timeout');
    return { handled: true, fallbackData: currentState.fallbackData };
  }

  return { handled: false, error: `State '${currentState.id}' timeout: ${stateTimeoutCheck.exceeded}ms over limit` };
}
