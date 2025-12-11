/**
 * display-renderer.js
 *
 * Render variables, call stack, timeline, and step counter
 */

export function createDisplayRenderer(config) {
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

  return {
    updateDisplay(stepData, currentStep, totalSteps) {
      if (!stepData) return;

      this.updateStepCounter(currentStep, totalSteps);
      this.updateVariables(stepData.variables || {});
      this.updateCallStack(stepData.callStack || []);
    },

    updateStepCounter(currentStep, totalSteps) {
      const counter = document.getElementById(config.stepCounterId);
      if (counter) {
        counter.textContent = 'Step ' + (currentStep + 1) + '/' + totalSteps;
      }
    },

    updateVariables(varMap) {
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
    },

    updateCallStack(stack) {
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
    },

    updateTimeline(steps, currentStep) {
      const timeline = document.getElementById(config.timelineId);
      if (!timeline) return;

      if (steps.length === 0) {
        timeline.innerHTML = '<div style="color: #999; font-size: 12px; padding: 8px;">No steps executed</div>';
        return;
      }

      let html = '';
      steps.forEach((step, idx) => {
        const isActive = idx === currentStep;
        const bgColor = isActive ? '#2a5a3a' : '#1e1e1e';
        const borderColor = isActive ? '#4ade80' : '#3a3a3a';
        html += `<div onclick="debugModule.jumpToStep(${idx})" style="background: ${bgColor}; padding: 6px 8px; margin-bottom: 4px; border-radius: 3px; border-left: 3px solid ${borderColor}; cursor: pointer; font-size: 11px;"><span style="color: #4ade80; font-weight: 600;">Step ${idx + 1}</span></div>`;
      });
      timeline.innerHTML = html;
    }
  };
}
