/**
 * execution-navigator.js
 *
 * Step navigation and execution control (pause, resume, step forward/back)
 */

export function createExecutionNavigator(executionState, config) {
  return {
    pause() {
      executionState.status = 'paused';
      if (config.onConsoleLog) {
        config.onConsoleLog('Execution paused at step ' + executionState.currentStep, 'info');
      }
    },

    resume() {
      executionState.status = 'running';
      if (config.onConsoleLog) {
        config.onConsoleLog('Execution resumed from step ' + executionState.currentStep, 'info');
      }
    },

    stepBack() {
      if (executionState.currentStep > 0) {
        executionState.currentStep--;
        if (config.onConsoleLog) {
          config.onConsoleLog('Stepped back to step ' + executionState.currentStep, 'info');
        }
        return true;
      }
      return false;
    },

    stepForward() {
      if (executionState.currentStep < executionState.totalSteps - 1) {
        executionState.currentStep++;
        if (config.onConsoleLog) {
          config.onConsoleLog('Stepped forward to step ' + executionState.currentStep, 'info');
        }
        return true;
      }
      return false;
    },

    jumpToStep(stepIndex) {
      if (stepIndex >= 0 && stepIndex < executionState.steps.length) {
        executionState.currentStep = stepIndex;
        if (config.onConsoleLog) {
          config.onConsoleLog('Jumped to step ' + (stepIndex + 1), 'info');
        }
        return true;
      }
      return false;
    }
  };
}
