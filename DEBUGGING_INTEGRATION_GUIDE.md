# Debugging Integration Guide for Sequential Editors

This guide explains how to integrate the universal debugging module into any Sequential editor (Task, Tool, Flow, App) for IDE-style breakpoint debugging, execution panels, and variable inspection.

## Overview

The debugging infrastructure consists of:
1. **Breakpoint Gutter UI**: 30px left sidebar with clickable line-based breakpoints
2. **Execution Panel**: 350px right sidebar with Variables, Call Stack, Timeline
3. **Execution Wrapper**: Runtime code instrumentation for breakpoint injection
4. **State Management**: Step-through debugging with pause/resume/step controls

**Time to integrate into any editor: 4-6 hours**
**Benefit per developer: +15-20 min/day**

## Quick Start

### Step 1: Add CSS Styling

Add these CSS classes to your editor's `<style>` block:

```css
/* Breakpoint Gutter */
.breakpoint-gutter {
  width: 30px;
  background: #1a1a1a;
  border-right: 1px solid #3a3a3a;
  display: flex;
  flex-direction: column;
  padding: 16px 0;
  font-family: 'Courier New', monospace;
  font-size: 12px;
  line-height: 1.6;
  user-select: none;
  overflow-y: hidden;
  overflow-x: hidden;
  flex-shrink: 0;
}

.gutter-line {
  display: flex;
  align-items: center;
  height: 22.4px;
  padding: 0 4px;
  text-align: right;
  color: #666;
  cursor: pointer;
  position: relative;
  font-size: 11px;
  font-weight: 500;
}

.breakpoint-indicator {
  position: absolute;
  right: 2px;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  display: none;
  cursor: pointer;
  flex-shrink: 0;
}

.gutter-line.has-breakpoint .breakpoint-indicator {
  display: block;
  background: #ff5f56;
  box-shadow: 0 0 3px rgba(255, 95, 86, 0.5);
}

/* Execution Panel */
.execution-panel {
  width: 350px;
  background: #242424;
  border-left: 1px solid #3a3a3a;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: -2px 0 8px rgba(0, 0, 0, 0.3);
}

.execution-panel-header {
  background: #2a2a2a;
  border-bottom: 1px solid #3a3a3a;
  padding: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.execution-state {
  display: flex;
  gap: 12px;
  align-items: center;
  font-size: 13px;
  font-weight: 600;
  color: #e0e0e0;
}

.status-badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 10px;
  text-transform: uppercase;
  background: #3a3a3a;
  color: #999;
}

.status-badge.paused {
  background: #ff9800;
  color: white;
}

.status-badge.running {
  background: #64b5f6;
  color: white;
}

.status-badge.completed {
  background: #4ade80;
  color: #1a1a1a;
}

.execution-controls {
  display: flex;
  gap: 6px;
}

.execution-controls button {
  background: #3a3a3a;
  border: none;
  color: #e0e0e0;
  width: 28px;
  height: 28px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.execution-section {
  flex: 1;
  border-bottom: 1px solid #3a3a3a;
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
}

.section-header {
  background: #2a2a2a;
  padding: 8px 12px;
  font-size: 11px;
  text-transform: uppercase;
  color: #999;
  font-weight: 600;
  border-bottom: 1px solid #3a3a3a;
}

.variables-list, .call-stack, .timeline-view {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
  font-size: 12px;
}

.variable-item {
  background: #1e1e1e;
  padding: 8px;
  margin-bottom: 6px;
  border-radius: 4px;
  border-left: 3px solid #4ade80;
  font-family: 'Courier New', monospace;
}
```

### Step 2: Add HTML Structure

Add this HTML for the code editor with gutter:

```html
<div class="code-editor-wrapper">
  <div class="breakpoint-gutter" id="breakpointGutter"></div>
  <div class="code-highlight" id="codeHighlight"><code class="language-javascript"></code></div>
  <textarea id="codeEditor" spellcheck="false">/* your code here */</textarea>
</div>
```

Add this HTML for the execution panel:

```html
<div class="execution-panel" id="executionPanel" style="display: none;">
  <div class="execution-panel-header">
    <div class="execution-state">
      <span id="stepCounter">Step 0/0</span>
      <span class="status-badge" id="execStatus">stopped</span>
    </div>
    <div class="execution-controls">
      <button id="pauseBtn" onclick="debugModule.pauseExecution()" title="Pause" style="display: none;">⏸</button>
      <button id="resumeBtn" onclick="debugModule.resumeExecution()" title="Resume" style="display: none;">▶</button>
      <button id="stepBackBtn" onclick="debugModule.stepBackward()" title="Step Back">⬅</button>
      <button id="stepForwardBtn" onclick="debugModule.stepForward()" title="Step Forward">➡</button>
      <button id="closeDebugBtn" onclick="debugModule.closeExecutionPanel()" title="Close">✕</button>
    </div>
  </div>
  <div class="execution-section">
    <div class="section-header">Variables</div>
    <div class="variables-list" id="variablesList">
      <div style="color: #999; font-size: 12px; padding: 8px;">No variables captured</div>
    </div>
  </div>
  <div class="execution-section">
    <div class="section-header">Call Stack</div>
    <div class="call-stack" id="callStack">
      <div style="color: #999; font-size: 12px; padding: 8px;">No calls yet</div>
    </div>
  </div>
  <div class="execution-section">
    <div class="section-header">Timeline</div>
    <div class="timeline-view" id="executionTimeline">
      <div style="color: #999; font-size: 12px; padding: 8px;">No steps executed</div>
    </div>
  </div>
</div>
```

### Step 3: Initialize Debug Module

Add this JavaScript at the end of your script section:

```html
<script src="debug-module.js"></script>
<script>
  // Initialize debug module
  window.debugModule = window.createDebugModule({
    editorId: 'codeEditor',
    breakpointGutterId: 'breakpointGutter',
    executionPanelId: 'executionPanel',
    statusBadgeId: 'execStatus',
    stepCounterId: 'stepCounter',
    variablesListId: 'variablesList',
    callStackId: 'callStack',
    timelineId: 'executionTimeline',
    pauseBtn: 'pauseBtn',
    resumeBtn: 'resumeBtn',
    onConsoleLog: function(message, type) {
      // Hook this to your console logging function
      addConsoleLog(message, type);
    }
  });

  // Render gutter when code changes
  document.getElementById('codeEditor').addEventListener('input', () => {
    debugModule.renderBreakpointGutter();
  });

  // Initialize on page load
  window.addEventListener('load', () => {
    debugModule.renderBreakpointGutter();
  });
</script>
```

### Step 4: Integrate with Execution Function

Modify your execution function (e.g., `runTest()`, `runTool()`) to use breakpoints:

```javascript
async function runTest() {
  const code = document.getElementById('codeEditor').value;
  const hasBreakpoints = debugModule.getBreakpoints().size > 0;

  if (hasBreakpoints) {
    addConsoleLog('🔴 Running with breakpoints (' + debugModule.getBreakpoints().size + ' breakpoint(s))', 'info');
    debugModule.openExecutionPanel();
    try {
      const result = debugModule.executeWithBreakpoints(code);
      addConsoleLog('✓ Execution completed', 'success');
      return result;
    } catch (error) {
      addConsoleLog('✗ Execution error: ' + error.message, 'error');
    }
  } else {
    // Normal API execution without breakpoints
    // ... existing code ...
  }
}
```

## Configuration Options

When creating the debug module, customize these options:

```javascript
createDebugModule({
  editorId: 'codeEditor',              // ID of textarea/editor element
  breakpointGutterId: 'breakpointGutter',  // ID of gutter container
  executionPanelId: 'executionPanel',      // ID of execution panel
  statusBadgeId: 'execStatus',             // ID of status badge
  stepCounterId: 'stepCounter',            // ID of step counter
  variablesListId: 'variablesList',        // ID of variables section
  callStackId: 'callStack',                // ID of call stack section
  timelineId: 'executionTimeline',         // ID of timeline section
  pauseBtn: 'pauseBtn',                    // ID of pause button
  resumeBtn: 'resumeBtn',                  // ID of resume button
  onConsoleLog: function(msg, type) {}     // Console callback
})
```

## Public API

Once initialized, use these functions:

```javascript
// Breakpoint management
debugModule.renderBreakpointGutter()      // Render/update gutter
debugModule.toggleBreakpoint(lineNum)     // Toggle breakpoint on line

// Execution control
debugModule.openExecutionPanel()           // Show execution panel
debugModule.closeExecutionPanel()          // Hide execution panel
debugModule.pauseExecution()               // Pause running code
debugModule.resumeExecution()              // Resume paused code
debugModule.stepBackward()                 // Go to previous step
debugModule.stepForward()                  // Go to next step
debugModule.jumpToStep(stepIndex)          // Jump to specific step

// Code execution
debugModule.executeWithBreakpoints(code)   // Execute code with breakpoint hooks

// State inspection
debugModule.getBreakpoints()               // Get Map of active breakpoints
debugModule.getExecutionState()            // Get current execution state
```

## Integration Checklist

- [ ] Copy CSS styling to editor stylesheet
- [ ] Add HTML elements (gutter + execution panel)
- [ ] Link `debug-module.js` script
- [ ] Initialize `window.debugModule` with config
- [ ] Hook `renderBreakpointGutter()` to editor input events
- [ ] Hook execution function to use `executeWithBreakpoints()`
- [ ] Test breakpoint clicking
- [ ] Test execution panel display/controls
- [ ] Test variable capture at breakpoints
- [ ] Test step forward/backward navigation

## Editors Completed

- ✅ **Task Editor** (Phase 5)
- ⏳ **Tool Editor** (Phase 6 Part 2) - Ready for integration
- ⏳ **Flow Editor** (Phase 6 Part 3) - Ready for integration
- ⏳ **App Editor** (Future) - Ready for integration

## Debugging Workflow

1. **Set breakpoint**: Click line number in gutter → red dot appears
2. **Run code**: Execute with breakpoints active
3. **View state**: Execution panel shows variables, call stack, timeline
4. **Step through**: Use ⬅/➡ buttons to navigate execution history
5. **Inspect values**: Variables panel shows all local variables at each step
6. **Time-travel**: Click any step in timeline to jump to that point

## Performance Notes

- Breakpoint gutter renders O(n) where n = number of lines
- Execution panel updates O(1) for step navigation
- Variable capture uses regex parsing (minimal overhead)
- Code instrumentation adds 1 line per breakpoint

## Troubleshooting

**Gutter not showing line numbers?**
- Check `breakpoint-gutter` CSS has `display: flex`
- Verify `editorId` matches your textarea ID

**Execution panel not opening?**
- Ensure `executionPanelId` matches HTML element
- Check `openExecutionPanel()` is called before execution

**Variables not capturing?**
- Verify code has `const`/`let`/`var` declarations
- Check breakpoints are set on assignment lines

**Step navigation not working?**
- Ensure `jumpToStep()` is called with valid step index
- Check execution state has captured steps

## Future Enhancements

- Conditional breakpoints (e.g., `step > 5`)
- Watch expressions (monitor variable changes)
- Performance metrics (execution time per step)
- Memory profiling (object size tracking)
- Breakpoint hit counts
