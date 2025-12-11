import { createBreakpointManager } from './breakpoints.js';
import { createExecutionManager } from './execution.js';
import { ExecutionWrapper } from './wrapper.js';

export function createDebugModule(editorConfig) {
  const config = {
    editorId: editorConfig.editorId || 'codeEditor',
    breakpointGutterId: editorConfig.breakpointGutterId || 'breakpointGutter',
    executionPanelId: editorConfig.executionPanelId || 'executionPanel',
    consoleId: editorConfig.consoleId || 'console',
    statusBadgeId: editorConfig.statusBadgeId || 'statusBadge',
    stepCounterId: editorConfig.stepCounterId || 'stepCounter',
    variablesListId: editorConfig.variablesListId || 'variablesList',
    callStackId: editorConfig.callStackId || 'callStack',
    timelineId: editorConfig.timelineId || 'timeline',
    pauseBtn: editorConfig.pauseBtn || 'pauseBtn',
    resumeBtn: editorConfig.resumeBtn || 'resumeBtn',
    ...editorConfig
  };

  const breakpointMgr = createBreakpointManager(config);
  const executionMgr = createExecutionManager(config);

  function executeWithBreakpoints(code) {
    const wrapper = new ExecutionWrapper(code, breakpointMgr.getBreakpoints());
    wrapper.injectGlobals((line, vars, stack) => executionMgr.captureStep(line, vars, stack));

    try {
      executionMgr.openPanel();
      const execCode = wrapper.wrappedCode;
      const result = eval(execCode);

      if (config.onConsoleLog) {
        config.onConsoleLog('✓ Execution completed', 'success');
      }
      return result;
    } catch (error) {
      if (config.onConsoleLog) {
        config.onConsoleLog('✗ Execution error: ' + error.message, 'error');
      }
      throw error;
    }
  }

  return {
    renderBreakpointGutter: () => breakpointMgr.renderGutter(),
    toggleBreakpoint: (line) => breakpointMgr.toggle(line),
    openExecutionPanel: () => executionMgr.openPanel(),
    closeExecutionPanel: () => executionMgr.closePanel(),
    pauseExecution: () => executionMgr.pause(),
    resumeExecution: () => executionMgr.resume(),
    stepBackward: () => executionMgr.stepBack(),
    stepForward: () => executionMgr.stepForward(),
    updateExecutionDisplay: () => executionMgr.updateDisplay(),
    captureExecutionStep: (line, vars, stack) => executionMgr.captureStep(line, vars, stack),
    jumpToStep: (idx) => executionMgr.jumpToStep(idx),
    executeWithBreakpoints,
    getBreakpoints: () => breakpointMgr.getBreakpoints(),
    getExecutionState: () => executionMgr.getState()
  };
}

if (typeof window !== 'undefined') {
  window.createDebugModule = createDebugModule;
}
