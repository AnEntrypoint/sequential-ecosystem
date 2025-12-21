# @sequentialos/execution-service-base

Base execution service class providing common functionality for task and flow execution services.

## Overview

`ExecutionService` is an abstract base class that provides shared functionality for execution services in the Sequential OS ecosystem. It eliminates code duplication by centralizing common patterns like timeout management, ID generation, event broadcasting, and execution history tracking.

## Features

- **Handler Registration**: Register and retrieve execution handlers
- **Timeout Management**: Execute promises with configurable timeouts
- **ID Generation**: Generate unique execution IDs with entity-specific prefixes
- **Event Broadcasting**: Placeholder for event system integration with debug logging
- **Execution History**: Track and filter execution history across all entities
- **Configurable Options**: Support for debug mode, exit-on-error, and default timeouts

## Installation

```bash
npm install @sequentialos/execution-service-base
```

## Usage

### Basic Extension

```javascript
import { ExecutionService } from '@sequentialos/execution-service-base';

class MyService extends ExecutionService {
  constructor(options = {}) {
    super('my-entity', options);
  }

  async execute(name, input, options = {}) {
    const handler = this.handlers.get(name);
    const id = this.generateId();
    const timeout = options.timeout || this.timeout;

    const result = await this.executeWithTimeout(
      handler(input),
      timeout
    );

    return {
      success: true,
      data: result,
      entityId: id
    };
  }
}
```

### Configuration Options

```javascript
const service = new ExecutionService('task', {
  debug: true,           // Enable debug logging
  exitOnError: false,    // Exit process on errors
  timeout: 30000         // Default timeout in milliseconds
});
```

## API Reference

### Constructor

```javascript
constructor(entityName = 'entity', options = {})
```

- `entityName`: Name of the entity type (e.g., 'task', 'flow')
- `options.debug`: Enable debug logging (default: false)
- `options.exitOnError`: Exit process on errors (default: false)
- `options.timeout`: Default timeout in milliseconds (default: 30000)

### Methods

#### `executeWithTimeout(promise, timeoutMs)`

Execute a promise with timeout protection.

```javascript
const result = await service.executeWithTimeout(
  someAsyncOperation(),
  5000  // 5 second timeout
);
```

#### `generateId()`

Generate a unique ID with entity-specific prefix.

```javascript
const id = service.generateId();
// Returns: 'task-1234567890-abc123def'
```

#### `registerHandler(name, handler)`

Register an execution handler.

```javascript
service.registerHandler('my-handler', async (input) => {
  return { result: 'success' };
});
```

#### `getRegisteredHandlers()`

Get list of all registered handler names.

```javascript
const handlers = service.getRegisteredHandlers();
// Returns: ['handler1', 'handler2', ...]
```

#### `broadcastEvent(eventName, data)`

Broadcast an event (logs to console in debug mode).

```javascript
service.broadcastEvent('entity:completed', {
  id: 'xyz',
  status: 'success'
});
```

#### `getExecutionHistory(filters = {})`

Get filtered execution history.

```javascript
// Get all history
const all = service.getExecutionHistory();

// Get successful executions only
const successful = service.getExecutionHistory({ success: true });

// Get specific entity executions
const filtered = service.getExecutionHistory({
  entityName: 'my-task',
  success: true
});
```

#### `clearHistory()`

Clear execution history.

```javascript
service.clearHistory();
```

## Real-World Usage

This base class is used by:

- **@sequentialos/task-execution-service**: TaskService for individual task execution
- **@sequentialos/task-execution-service**: FlowService for multi-step workflow execution

## Design Principles

1. **Single Responsibility**: Base class handles only common execution patterns
2. **Open/Closed**: Open for extension (inheritance), closed for modification
3. **DRY**: Eliminates duplication across service implementations
4. **Configurable**: Supports various configuration options for different use cases

## Testing

```bash
npm test
```

Tests cover:
- Constructor initialization
- ID generation with entity prefixes
- Handler registration and retrieval
- Timeout execution (success and timeout cases)
- History tracking and filtering
- Event broadcasting

## License

MIT
