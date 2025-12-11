export function createExecutionManager(config) {
  const executionState = {
    status: 'stopped',
    currentStep: 0,
    totalSteps: 0,
    steps: [],
    currentStepData: null
  };

  function openPanel() {
    const panel = document.getElementById(config.executionPanelId);
    if (panel) {
      panel.style.display = 'flex';
      updateStatusBadge('paused');
    }
  }

  function closePanel() {
    const panel = document.getElementById(config.executionPanelId);
    if (panel) {
      panel.style.display = 'none';
      executionState.status = 'stopped';
      updateStatusBadge('stopped');
    }
  }

  function updateStatusBadge(status) {
    const badge = document.getElementById(config.statusBadgeId);
    if (badge) {
      badge.className = 'status-badge ' + status;
      badge.textContent = status.toUpperCase();
    }
    executionState.status = status;
  }

  function pause() {
    executionState.status = 'paused';
    updateStatusBadge('paused');
    if (config.pauseBtn) {
      document.getElementById(config.pauseBtn).style.display = 'none';
    }
    if (config.resumeBtn) {
      document.getElementById(config.resumeBtn).style.display = 'flex';
    }
    if (config.onConsoleLog) {
      config.onConsoleLog('Execution paused at step ' + executionState.currentStep, 'info');
    }
  }

  function resume() {
    executionState.status = 'running';
    updateStatusBadge('running');
    if (config.pauseBtn) {
      document.getElementById(config.pauseBtn).style.display = 'flex';
    }
    if (config.resumeBtn) {
      document.getElementById(config.resumeBtn).style.display = 'none';
    }
    if (config.onConsoleLog) {
      config.onConsoleLog('Execution resumed from step ' + executionState.currentStep, 'info');
    }
  }

  function stepBack() {
    if (executionState.currentStep > 0) {
      executionState.currentStep--;
      updateDisplay();
      if (config.onConsoleLog) {
        config.onConsoleLog('Stepped back to step ' + executionState.currentStep, 'info');
      }
    }
  }

  function stepForward() {
    if (executionState.currentStep < executionState.totalSteps - 1) {
      executionState.currentStep++;
      updateDisplay();
      if (config.onConsoleLog) {
        config.onConsoleLog('Stepped forward to step ' + executionState.currentStep, 'info');
      }
    }
  }

  function jumpToStep(stepIndex) {
    if (stepIndex >= 0 && stepIndex < executionState.steps.length) {
      executionState.currentStep = stepIndex;
      updateDisplay();
      if (config.onConsoleLog) {
        config.onConsoleLog('Jumped to step ' + (stepIndex + 1), 'info');
      }
    }
  }

  function captureStep(line, variables, callStack) {
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
      updateDisplay();
    }
  }

  function updateDisplay() {
    const stepData = executionState.steps[executionState.currentStep];
    if (!stepData) return;

    const counter = document.getElementById(config.stepCounterId);
    if (counter) {
      counter.textContent = 'Step ' + (executionState.currentStep + 1) + '/' + executionState.totalSteps;
    }

    updateVariables(stepData.variables || {});
    updateCallStack(stepData.callStack || []);
    updateTimeline();
  }

  function updateVariables(varMap) {
    const list = document.getElementById(config.variablesListId);
    if (!list) return;

    if (Object.keys(varMap).length === 0) {
      list.innerHTML = '<div style="color: #999; font-size: 12px; padding: 8px;">No variables</div>';
      return;
    }

    let html = '';
    for (const [name, value] of Object.entries(varMap)) {
      const displayValue = formatValue(value);
      html += `<div class="variable-item"><strong style="color: #4ade80;">${name}</strong><div style="color: #999; font-size: 11px; margin-top: 3px; word-break: break-all;">${displayValue}</div></div>`;
    }
    list.innerHTML = html;
  }

  function formatValue(value) {
    if (value === null) return 'null';
    if (value === undefined) return 'undefined';
    if (typeof value === 'string') return `"${value.substring(0, 100)}${value.length > 100 ? '...' : ''}"`;
    if (typeof value === 'object') {
      const str = JSON.stringify(value);
      return str.substring(0, 100) + (str.length > 100 ? '...' : '');
    }
    return String(value);
  }

  function updateCallStack(stack) {
    const callStack = document.getElementById(config.callStackId);
    if (!callStack) return;

    if (stack.length === 0) {
      callStack.innerHTML = '<div style="color: #999; font-size: 12px; padding: 8px;">No calls yet</div>';
      return;
    }

    let html = '';
    stack.forEach((frame) => {
      html += `<div style="background: #1e1e1e; padding: 8px; margin-bottom: 6px; border-radius: 3px; border-left: 3px solid #64b5f6;"><div style="color: #64b5f6; font-size: 11px; font-weight: 600;">${frame.name}</div><div style="color: #999; font-size: 10px; margin-top: 2px;">at line ${frame.line}</div></div>`;
    });
    callStack.innerHTML = html;
  }

  function updateTimeline() {
    const timeline = document.getElementById(config.timelineId);
    if (!timeline) return;

    if (executionState.steps.length === 0) {
      timeline.innerHTML = '<div style="color: #999; font-size: 12px; padding: 8px;">No steps executed</div>';
      return;
    }

    let html = '';
    executionState.steps.forEach((step, idx) => {
      const isActive = idx === executionState.currentStep;
      const bgColor = isActive ? '#2a5a3a' : '#1e1e1e';
      const borderColor = isActive ? '#4ade80' : '#3a3a3a';
      html += `<div onclick="debugModule.jumpToStep(${idx})" style="background: ${bgColor}; padding: 6px 8px; margin-bottom: 4px; border-radius: 3px; border-left: 3px solid ${borderColor}; cursor: pointer; font-size: 11px;"><span style="color: #4ade80; font-weight: 600;">Step ${idx + 1}</span></div>`;
    });
    timeline.innerHTML = html;
  }

  return {
    openPanel,
    closePanel,
    pause,
    resume,
    stepBack,
    stepForward,
    jumpToStep,
    captureStep,
    updateDisplay,
    getState: () => ({ ...executionState })
  };
}
