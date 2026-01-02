# @sequentialos/gui-flow-builder

Comprehensive GUI flow builder with visual composition, execution monitoring, and state machine visualization for the Sequential ecosystem.

## Features

- **Visual Flow Composition**: Drag-drop interface for building flows from tasks, flows, and tools
- **Flow Visualization**: Interactive diagram showing states, transitions, and flow topology
- **Real-Time Execution Monitoring**: Track execution progress, state changes, and error details
- **State Machine Visualization**: View and interact with xstate machines
- **Component Palette**: Searchable registry of available tasks, flows, and tools
- **Interactive Canvas**: Edit flows directly on the canvas
- **Error Handling**: Graceful error display with retry capabilities
- **ES Module Compatible**: Full ES module support for modern Node.js

## Installation

This package is part of the Sequential monorepo and is available locally:

```javascript
import { FlowVisualizer, ExecutionMonitor, ComponentPalette } from '@sequentialos/gui-flow-builder';
```

## Usage

### 1. Flow Visualization

Display a flow as an interactive diagram:

```javascript
import { FlowVisualizer } from '@sequentialos/gui-flow-builder';

function MyApp() {
  const flowConfig = {
    name: 'My Flow',
    description: 'A sample flow',
    states: {
      validate: {
        type: 'task',
        next: 'process'
      },
      process: {
        type: 'task',
        next: 'complete'
      },
      complete: {
        type: 'final'
      }
    }
  };

  return (
    <FlowVisualizer
      flow={flowConfig}
      onNodeClick={(node) => console.log('Clicked:', node)}
    />
  );
}
```

### 2. Execution Monitoring

Track real-time execution progress:

```javascript
import { ExecutionMonitor } from '@sequentialos/gui-flow-builder';

function MonitorFlow() {
  const execution = {
    id: 'exec-123',
    status: 'running',
    currentState: 'process',
    startedAt: new Date(),
    steps: [
      {
        name: 'validate',
        status: 'completed',
        startedAt: new Date(),
        endedAt: new Date(),
        output: { valid: true }
      },
      {
        name: 'process',
        status: 'running',
        startedAt: new Date()
      }
    ]
  };

  return (
    <ExecutionMonitor
      execution={execution}
      onRetry={() => console.log('Retry')}
      onCancel={() => console.log('Cancel')}
    />
  );
}
```

### 3. Component Palette

Display available components for composition:

```javascript
import { ComponentPalette } from '@sequentialos/gui-flow-builder';

function BuilderUI() {
  const tasks = ['validate', 'process', 'complete'];
  const flows = ['myFlow', 'anotherFlow'];
  const tools = [
    { name: 'logger', category: 'logging' },
    { name: 'validator', category: 'validation' }
  ];

  return (
    <ComponentPalette
      tasks={tasks}
      flows={flows}
      tools={tools}
      onSelect={(component) => console.log('Selected:', component)}
      onDragStart={(component, e) => console.log('Dragging:', component)}
    />
  );
}
```

### 4. Flow Canvas

Interactive canvas for building flows:

```javascript
import { FlowCanvas } from '@sequentialos/gui-flow-builder';

function FlowBuilder() {
  const flow = {
    states: {
      start: { type: 'task', description: 'Initial state' },
      end: { type: 'final' }
    }
  };

  return (
    <FlowCanvas
      flow={flow}
      selectedNode={selected}
      onNodeSelect={(node) => setSelected(node)}
      onDrop={(component, event) => console.log('Dropped:', component)}
    />
  );
}
```

### 5. State Machine Visualization

View xstate machine state and transitions:

```javascript
import { StateMachineVisualizer } from '@sequentialos/gui-flow-builder';

function MachineView() {
  const machine = {
    id: 'traffic-light',
    states: {
      red: { on: { TIMER: 'green' } },
      green: { on: { TIMER: 'yellow' } },
      yellow: { on: { TIMER: 'red' } }
    }
  };

  return (
    <StateMachineVisualizer
      machine={machine}
      currentState="red"
      onTransition={(target) => console.log('Transition to:', target)}
      context={{ count: 0 }}
    />
  );
}
```

## API Reference

### FlowVisualizer

Renders flow definition as interactive diagram.

#### Props

- **`flow: object`** (required)
  - Flow configuration with states and transitions
  - Must have `states` property

- **`onNodeClick: function`** (optional)
  - Called when a state node is clicked
  - Receives node object: `{ id, label, type, config }`

- **`selectedNode: object`** (optional)
  - Currently selected node for highlighting

- **`execution: object`** (optional)
  - Execution data to highlight active/completed states

### ExecutionMonitor

Displays real-time execution progress and details.

#### Props

- **`execution: object`** (required)
  - Execution data with status, steps, timing

- **`onRetry: function`** (optional)
  - Called when retry button clicked

- **`onCancel: function`** (optional)
  - Called when cancel button clicked

Status values: `running`, `completed`, `failed`, `pending`

### ComponentPalette

Searchable palette of available components.

#### Props

- **`tasks: array`** (optional)
  - Array of task names
  - Default: `[]`

- **`flows: array`** (optional)
  - Array of flow names
  - Default: `[]`

- **`tools: array`** (optional)
  - Array of tool objects: `{ name, category }`
  - Default: `[]`

- **`onSelect: function`** (optional)
  - Called when component is clicked

- **`onDragStart: function`** (optional)
  - Called when component drag begins

### FlowCanvas

Interactive canvas for building flows.

#### Props

- **`flow: object`** (optional)
  - Current flow configuration

- **`selectedNode: object`** (optional)
  - Currently selected state node

- **`onNodeSelect: function`** (optional)
  - Called when node selected

- **`onDrop: function`** (optional)
  - Called when component dropped on canvas

### StateMachineVisualizer

Displays xstate machine with states and transitions.

#### Props

- **`machine: object`** (required)
  - xstate machine configuration
  - Must have `states` property

- **`currentState: string|object`** (optional)
  - Current active state

- **`onTransition: function`** (optional)
  - Called when transition triggered

- **`context: object`** (optional)
  - Machine context data

## Integration with DynamicRenderer

All components are compatible with `@sequentialos/dynamic-react-renderer` for dynamic composition:

```javascript
import DynamicRenderer from '@sequentialos/dynamic-react-renderer';

<DynamicRenderer
  type="FlowVisualizer"
  props={{
    flow: myFlow,
    execution: executionData
  }}
/>
```

## Error Handling

All components include error boundaries and graceful fallbacks:

- Invalid input displays user-friendly error messages
- Missing data shows helpful prompts
- Execution errors display with stack context
- All errors logged via sequential-logging

## Best Practices

1. **Register Early**: Load registries before rendering palette
2. **Real-Time Updates**: Poll execution data or use WebSocket for live updates
3. **Error Handling**: Provide custom error handlers for production
4. **Component Isolation**: Render one component per container
5. **Performance**: Memoize flow configurations for large diagrams

## License

MIT
