# @sequentialos/event-emitter

Event emitter utility for Sequential OS with support for custom broadcast functions.

## Installation

```bash
npm install @sequentialos/event-emitter
```

## Usage

### Basic Usage

```javascript
import { EventEmitter } from '@sequentialos/event-emitter';

const emitter = new EventEmitter();

// Register event listener
const unsubscribe = emitter.on('user:created', (data) => {
  console.log('User created:', data);
});

// Emit event
await emitter.emit('user:created', { id: 'user_123', name: 'Alice' });

// Unsubscribe
unsubscribe();
```

### One-time Listeners

```javascript
emitter.once('initialized', (data) => {
  console.log('App initialized:', data);
});
```

### Custom Broadcast Function

For distributed systems, you can provide a custom broadcast function:

```javascript
import { createEventEmitter } from '@sequentialos/event-emitter';
import Redis from 'ioredis';

const redis = new Redis();

const emitter = createEventEmitter({
  broadcast: async (event, data) => {
    // Broadcast to other instances via Redis pub/sub
    await redis.publish(event, JSON.stringify(data));
  }
});

// Now emit() will call both local handlers AND the broadcast function
await emitter.emit('user:created', { id: 'user_123' });
```

## API

### `new EventEmitter(options)`

Create a new event emitter.

**Parameters:**
- `options.broadcast` (Function, optional): Custom broadcast function for distributed events

### `on(event, handler)`

Register an event listener.

**Parameters:**
- `event` (string): Event name
- `handler` (Function): Event handler function

**Returns:** Unsubscribe function

### `once(event, handler)`

Register a one-time event listener that auto-removes after first invocation.

**Parameters:**
- `event` (string): Event name
- `handler` (Function): Event handler function

**Returns:** Unsubscribe function

### `off(event, handler)`

Remove an event listener.

**Parameters:**
- `event` (string): Event name
- `handler` (Function): Handler to remove

**Returns:** `true` if removed, `false` if not found

### `emit(event, data)`

Emit an event to all registered listeners.

**Parameters:**
- `event` (string): Event name
- `data` (any): Event data

**Returns:** Promise<void>

### `removeAllListeners([event])`

Remove all listeners for an event, or all events if no event specified.

**Parameters:**
- `event` (string, optional): Event name to clear

### `listenerCount(event)`

Get the number of listeners for an event.

**Parameters:**
- `event` (string): Event name

**Returns:** Number of listeners

### `eventNames()`

Get all event names with registered listeners.

**Returns:** Array of event names

## Features

- Simple, lightweight event emitter
- Async/await support for handlers
- One-time listeners with `once()`
- Custom broadcast function for distributed systems
- Error handling (handlers don't crash on error)
- Automatic cleanup of empty event arrays
- TypeScript-friendly API

## License

MIT
