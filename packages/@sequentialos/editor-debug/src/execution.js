/**
 * execution.js - Facade for execution debugging
 *
 * Delegates to focused modules:
 * - panel-manager: Panel visibility and status badge control
 * - execution-navigator: Step navigation and execution control
 * - step-capturer: Capture and store execution steps
 * - display-renderer: Render variables, call stack, timeline
 */

import { createPanelManager } from './panel-manager.js';
import { createExecutionNavigator } from './execution-navigator.js';
import { createStepCapturer } from './step-capturer.js';
import { createDisplayRenderer } from './display-renderer.js';

export function createExecutionManager(config) {
  const executionState = {
    status: 'stopped',
    currentStep: 0,
    totalSteps: 0,
    steps: [],
    currentStepData: null
  };

  const panelManager = createPanelManager(config);
  const navigator = createExecutionNavigator(executionState, config);
  const capturer = createStepCapturer(executionState);
  const renderer = createDisplayRenderer(config);

  return {
    // Panel management
    openPanel() {
      panelManager.openPanel();
    },

    closePanel() {
      panelManager.closePanel();
    },

    // Execution control
    pause() {
      navigator.pause();
      executionState.status = 'paused';
      panelManager.updateStatusBadge('paused');
      panelManager.updateControlButtons('paused');
    },

    resume() {
      navigator.resume();
      executionState.status = 'running';
      panelManager.updateStatusBadge('running');
      panelManager.updateControlButtons('running');
    },

    // Navigation
    stepBack() {
      if (navigator.stepBack()) {
        this.updateDisplay();
      }
    },

    stepForward() {
      if (navigator.stepForward()) {
        this.updateDisplay();
      }
    },

    jumpToStep(stepIndex) {
      if (navigator.jumpToStep(stepIndex)) {
        this.updateDisplay();
      }
    },

    // Step capture
    captureStep(line, variables, callStack) {
      return capturer.captureStep(line, variables, callStack);
    },

    // Display updates
    updateDisplay() {
      const stepData = capturer.getCurrentStep();
      if (stepData) {
        renderer.updateDisplay(stepData, executionState.currentStep, executionState.totalSteps);
        renderer.updateTimeline(capturer.getSteps(), executionState.currentStep);
      }
    },

    // State access
    getState() {
      return { ...executionState };
    },

    getSteps() {
      return capturer.getSteps();
    },

    clearSteps() {
      capturer.clearSteps();
    }
  };
}
