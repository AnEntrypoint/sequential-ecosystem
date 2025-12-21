# @sequentialos/task-execution-service

Task and flow execution service for Sequential OS GXE webhook dispatch system.

## Overview

This package provides `TaskService` and `FlowService` classes that handle execution of tasks and flows via webhook-style invocations through the GXE (GitHub eXecution Engine) system.

## Installation

This package is part of the Sequential OS monorepo and is available locally at:
```
packages/@sequentialos/task-execution-service
```

## Usage

### TaskService

Execute tasks with lifecycle management, input/output handling, and consistent response formatting.

```javascript
import { TaskService } from '@sequentialos/task-execution-service';

const taskService = new TaskService();

// Register a task handler
taskService.registerTask('my-task', async (input, context) => {
  return {
    result: 'Task completed',
    processedData: input.data
  };
});

// Execute a task
const result = await taskService.executeTask('my-task', { data: 'value' }, {
  runId: 'custom-run-id',
  broadcast: true,
  timeout: 30000
});

console.log(result);
// {
//   success: true,
//   data: { result: 'Task completed', processedData: 'value' },
//   taskId: 'task-...',
//   runId: 'custom-run-id',
//   taskName: 'my-task',
//   startTime: '2025-12-21T10:00:00.000Z',
//   endTime: '2025-12-21T10:00:00.100Z',
//   duration: 100
// }
```

### FlowService

Execute flows with step orchestration and lifecycle management.

```javascript
import { FlowService } from '@sequentialos/task-execution-service';

const flowService = new FlowService();

// Register a flow handler
flowService.registerFlow('my-flow', async (input, context) => {
  return {
    result: 'Flow completed',
    steps: [
      { name: 'step1', status: 'completed' },
      { name: 'step2', status: 'completed' }
    ]
  };
});

// Execute a flow
const result = await flowService.executeFlow('my-flow', { data: 'value' }, {
  flowId: 'custom-flow-id',
  broadcast: true,
  timeout: 60000
});
```

### GXE Webhook Dispatch

This package is designed to work with the GXE webhook dispatch system:

```bash
# Execute a task via GXE
gxe . webhook:task --taskName=my-task --input='{"data":"value"}'

# Execute a flow via GXE
gxe . webhook:flow --flowName=my-flow --input='{"data":"value"}'
```

## API Reference

### TaskService

#### Methods

- `registerTask(taskName, handler)` - Register a task handler function
- `async executeTask(taskName, input, options)` - Execute a registered task
  - `taskName` (string): Name of the task to execute
  - `input` (object): JSON input data
  - `options` (object):
    - `runId` (string): Optional run ID (auto-generated if omitted)
    - `broadcast` (boolean): Whether to broadcast execution events
    - `timeout` (number): Execution timeout in milliseconds (default: 30000)
  - Returns: `Promise<Object>` with `{success, data, taskId, runId, taskName, startTime, endTime, duration}`

- `getExecutionHistory(filters)` - Get task execution history
- `getRegisteredTasks()` - Get list of registered task names
- `clearHistory()` - Clear execution history

### FlowService

#### Methods

- `registerFlow(flowName, handler)` - Register a flow handler function
- `async executeFlow(flowName, input, options)` - Execute a registered flow
  - `flowName` (string): Name of the flow to execute
  - `input` (object): JSON input data
  - `options` (object):
    - `flowId` (string): Optional flow ID (auto-generated if omitted)
    - `broadcast` (boolean): Whether to broadcast execution events
    - `timeout` (number): Execution timeout in milliseconds (default: 60000)
  - Returns: `Promise<Object>` with `{success, data, flowId, flowName, startTime, endTime, duration}`

- `async executeStep(stepName, input, context)` - Execute a single flow step
- `getExecutionHistory(filters)` - Get flow execution history
- `getRegisteredFlows()` - Get list of registered flow names
- `clearHistory()` - Clear execution history

## Mock Execution

When a task or flow is not registered, the service returns a mock success response for testing purposes:

```javascript
{
  success: true,
  data: {
    message: "Task 'unregistered-task' executed (mock)",
    input: { ... },
    taskName: "unregistered-task",
    mock: true
  },
  // ... metadata
}
```

In production, unregistered tasks should either throw an error or load task definitions dynamically.

## Response Format

All execution results follow a consistent format:

```javascript
{
  success: boolean,
  data: object,        // Execution result or error details
  taskId/flowId: string,
  runId/flowId: string,
  taskName/flowName: string,
  startTime: string,   // ISO 8601 timestamp
  endTime: string,     // ISO 8601 timestamp
  duration: number     // Milliseconds
}
```

Error responses include an `error` object instead of `data`:

```javascript
{
  success: false,
  error: {
    message: string,
    code: string,
    taskName/flowName: string
  },
  // ... metadata
}
```

## License

MIT
