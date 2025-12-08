# Flow Debugger Migration to Dynamic Renderer

## Overview

Complete migration guide for app-flow-debugger from vanilla DOM to dynamic renderer, following the pattern established in app-task-debugger.

## Before & After Comparison

### Current Implementation (Vanilla DOM - 722 lines)
- Inline styles and hardcoded colors
- Manual DOM manipulation
- State management via closures
- No theme support
- Hard to maintain and extend

### Target Implementation (Dynamic Renderer)
- ThemeEngine integration
- Component-based architecture
- AppRenderingBridge state management
- 60%+ code reduction
- Production-ready dynamic components

## Architecture Overview

### Component Structure
```
FlowDebugger (Dynamic)
├── Header Panel
│   ├── Flow selector
│   ├── Control buttons (step, run, reset)
│   └── Mode toggle
├── Main Content
│   ├── Flow Graph Visualization
│   │   ├── State nodes (positioned)
│   │   ├── Transition lines
│   │   └── Current state highlight
│   └── Execution Panel (right sidebar)
│       ├── State details
│       ├── Watch expressions
│       └── Execution log
└── Modal Dialogs
    ├── Watch expression input
    └── Breakpoint configuration
```

### State Management via AppRenderingBridge

**Core State Keys**:
- `selectedFlow` - Currently selected flow ID
- `currentState` - Active state in execution
- `executionHistory` - Array of visited states
- `breakpoints` - Set of breakpoint state IDs
- `watches` - Array of watch expressions
- `simulationMode` - true/false

**Update Pattern**:
```javascript
bridge.setState('currentState', stateName);
bridge.subscribe('currentState', (state) => {
  updateVisualization(state);
  updateDetailsPanel(state);
});
```

## Implementation Plan

### Phase 1: Core Infrastructure (Current)

1. **Create base structure**:
   - Initialize AppRenderingBridge with dark theme
   - Set up state management
   - Create event system

2. **Header & Controls**:
   - Flow selector dropdown
   - Control buttons (Step, Run, Reset, etc.)
   - Mode toggles (Breakpoints, Watches)

3. **Graph Visualization**:
   - State node rendering with positioning
   - Transition line drawing
   - Current state highlighting
   - Click handling for state selection

### Phase 2: Execution Control

4. **Execution Engine**:
   - Step forward/backward
   - Run to completion
   - Reset execution
   - Breakpoint support

5. **State Tracking**:
   - History management
   - Watch expression evaluation
   - Log entries with timestamps

### Phase 3: Polish & Integration

6. **Advanced Features**:
   - Conditional breakpoints
   - Watch expression editor
   - Export execution trace
   - Performance metrics

## Code Examples

### Header Component

```javascript
buildHeader() {
  return {
    type: 'flex',
    direction: 'column',
    style: {
      background: this.theme.getColor('primary'),
      padding: this.theme.getSpacing('lg'),
      gap: this.theme.getSpacing('md')
    },
    children: [
      {
        type: 'heading',
        content: '🔍 Flow Debugger',
        level: 2,
        style: { color: 'white', margin: 0 }
      },
      {
        type: 'flex',
        direction: 'row',
        gap: this.theme.getSpacing('md'),
        children: [
          {
            type: 'select',
            options: this.flows.map(f => ({ label: f.name, value: f.id })),
            onChange: (id) => this.selectFlow(id),
            style: { flex: 1 }
          },
          {
            type: 'button',
            label: '⏮ Step Back',
            onClick: () => this.stepBack(),
            variant: 'secondary'
          },
          {
            type: 'button',
            label: '⏭ Step Forward',
            onClick: () => this.stepForward(),
            variant: 'primary'
          },
          {
            type: 'button',
            label: '▶▶ Run to End',
            onClick: () => this.runToEnd(),
            variant: 'secondary'
          },
          {
            type: 'button',
            label: '🔄 Reset',
            onClick: () => this.reset(),
            variant: 'secondary'
          }
        ]
      }
    ]
  };
}
```

### Graph Panel Component

```javascript
buildGraphPanel() {
  const flow = this.currentFlow;
  if (!flow) {
    return {
      type: 'paragraph',
      content: 'Select a flow to visualize',
      style: {
        padding: this.theme.getSpacing('lg'),
        color: this.theme.getColor('textMuted')
      }
    };
  }

  const stateNodes = flow.states.map((state, idx) => {
    const isCurrentState = state.name === this.currentStateName;
    const isBreakpoint = this.breakpoints.has(state.name);

    return {
      type: 'card',
      title: state.name,
      variant: isCurrentState ? 'elevated' : 'default',
      style: {
        position: 'absolute',
        left: (idx % 3) * 280 + 'px',
        top: Math.floor(idx / 3) * 120 + 'px',
        width: '200px',
        cursor: 'pointer',
        borderLeft: isBreakpoint ? `4px solid ${this.theme.getColor('danger')}` : '',
        background: isCurrentState ? this.theme.getColor('primary') : '',
        color: isCurrentState ? 'white' : ''
      },
      onClick: () => this.selectState(state.name),
      children: [
        {
          type: 'paragraph',
          content: state.name,
          style: { fontWeight: '600' }
        },
        {
          type: 'paragraph',
          content: `Type: ${state.type || 'default'}`,
          style: { fontSize: '12px', opacity: 0.8 }
        }
      ]
    };
  });

  return {
    type: 'flex',
    direction: 'column',
    style: {
      position: 'relative',
      flex: 2,
      background: this.theme.getColor('backgroundLight'),
      overflow: 'auto'
    },
    children: stateNodes
  };
}
```

### Details Panel Component

```javascript
buildDetailsPanel() {
  const state = this.selectedState;
  if (!state) {
    return {
      type: 'paragraph',
      content: 'No state selected',
      style: {
        padding: this.theme.getSpacing('lg'),
        color: this.theme.getColor('textMuted')
      }
    };
  }

  return {
    type: 'flex',
    direction: 'column',
    gap: this.theme.getSpacing('md'),
    style: { padding: this.theme.getSpacing('lg') },
    children: [
      {
        type: 'heading',
        content: 'State Details',
        level: 3
      },
      {
        type: 'card',
        variant: 'flat',
        children: [
          { type: 'paragraph', content: `State: ${state.name}` },
          { type: 'paragraph', content: `Type: ${state.type}` },
          { type: 'paragraph', content: `Duration: ${state.duration}ms` },
          { type: 'paragraph', content: `Entered: ${state.enteredAt}` }
        ]
      },
      this.buildWatchesPanel(),
      this.buildExecutionLog()
    ]
  };
}
```

## Migration Checklist

- [ ] Create dynamic-index.html with AppRenderingBridge
- [ ] Implement header component with controls
- [ ] Implement graph visualization component
- [ ] Implement details/properties panel
- [ ] Set up execution engine
- [ ] Add state history tracking
- [ ] Implement breakpoint system
- [ ] Add watch expressions
- [ ] Test with real flows
- [ ] Verify feature parity
- [ ] Measure code reduction
- [ ] Document migration

## Expected Results

### Code Reduction
- **Before**: 722 lines vanilla DOM
- **After**: ~280 lines dynamic renderer
- **Reduction**: ~61%

### Features Maintained
- ✅ Flow visualization (state graph)
- ✅ Step execution (forward/backward)
- ✅ Breakpoint debugging
- ✅ Watch expressions
- ✅ Execution history
- ✅ State details panel
- ✅ Log viewing

### Improvements
- ✅ Theme support (dark/light automatic)
- ✅ Responsive layout
- ✅ Better component reuse
- ✅ Cleaner state management
- ✅ Easier to extend

## Performance Metrics

| Metric | Expected |
|--------|----------|
| Initial render | < 100ms |
| State transition | < 50ms |
| Step operation | < 30ms |
| Memory footprint | -40% |

## Next Apps in Tier 1

After completing flow-debugger migration:
1. **app-run-observer** (observability)
2. **app-observability-console** (real-time events)
3. **app-observability-dashboard** (metrics)

---

**Status**: Planning Phase
**Timeline**: 2-3 hours implementation
**Priority**: High (Tier 1 critical infrastructure)
