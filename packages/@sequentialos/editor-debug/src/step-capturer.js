/**
 * step-capturer.js
 *
 * Capture and store execution steps with variables and call stack
 */

export function createStepCapturer(executionState) {
  return {
    captureStep(line, variables, callStack) {
      if (executionState.status === 'running' || executionState.status === 'paused') {
        const step = {
          line: line,
          variables: { ...variables },
          callStack: [...(callStack || [])],
          timestamp: Date.now()
        };
        executionState.steps.push(step);
        executionState.totalSteps = executionState.steps.length;
        executionState.currentStep = executionState.totalSteps - 1;
        executionState.currentStepData = step;
        return step;
      }
      return null;
    },

    getCurrentStep() {
      return executionState.steps[executionState.currentStep] || null;
    },

    getSteps() {
      return executionState.steps.slice();
    },

    clearSteps() {
      executionState.steps = [];
      executionState.totalSteps = 0;
      executionState.currentStep = 0;
      executionState.currentStepData = null;
    }
  };
}
