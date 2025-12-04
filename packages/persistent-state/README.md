# @sequential/persistent-state

State manager with automatic TTL, memory cleanup, and optional persistence for Sequential ecosystem.

## Features

- **Automatic Cleanup**: Expired cache entries removed every configurable interval
- **TTL Support**: Entries expire after configurable time (default 5 minutes)
- **Size Limits**: Memory cache bounded with LRU eviction when full
- **Lifecycle Management**: Graceful shutdown with resource cleanup
- **Pluggable Storage**: Use FileSystemAdapter, MemoryAdapter, or custom implementation
- **Zero Config**: Works with sensible defaults

## Installation

```bash
npm install @sequential/persistent-state
```

## Quick Start

### With FileSystem Persistence

```javascript
import { StateManager, FileSystemAdapter } from '@sequential/persistent-state';

const adapter = new FileSystemAdapter('./data');
const manager = new StateManager(adapter, {
  maxCacheSize: 1000,
  cacheTTL: 300000,          // 5 minutes
  cleanupInterval: 60000     // 1 minute
});

// Store data (persists to filesystem, caches in memory)
await manager.set('users', 'user123', { name: 'Alice', email: 'alice@example.com' });

// Retrieve data (reads from cache if fresh, else from filesystem)
const user = await manager.get('users', 'user123');

// Delete
await manager.delete('users', 'user123');

// Clear all data of a type
await manager.clear('users');

// Graceful shutdown
await manager.shutdown();
```

### With Memory-Only Storage (Testing)

```javascript
import { StateManager, MemoryAdapter } from '@sequential/persistent-state';

const adapter = new MemoryAdapter();
const manager = new StateManager(adapter);

// No persistence, just in-memory cache with TTL/cleanup
```

## API

### StateManager

#### Constructor

```javascript
new StateManager(adapter, config)
```

**Config Options**:
- `maxCacheSize` (number, default 1000): Maximum cached entries before LRU eviction
- `cacheTTL` (ms, default 300000): Time to live for cached entries (5 minutes)
- `cleanupInterval` (ms, default 60000): Interval between cleanup runs (1 minute)

#### Methods

```javascript
// Get value (reads from cache if fresh, else from adapter)
const value = await manager.get(type, id);

// Set value (persists via adapter, updates cache)
await manager.set(type, id, value);

// Delete value (removes from both cache and adapter)
await manager.delete(type, id);

// Clear all values of type (or all if no type specified)
await manager.clear(type);

// Get cache statistics
const stats = manager.getCacheStats();
// Returns: { cacheSize, maxSize, ttlMs, cleanupIntervalMs, isShutdown }

// Graceful shutdown (clears cache, closes timers, shuts down adapter)
await manager.shutdown();
```

## Lifecycle

```
Manager Created
    ↓
Cleanup Timer Starts (runs every cleanupInterval)
    ↓
Data Operations (get, set, delete, clear)
    ↓
Expired Entries Removed (by cleanup timer)
    ↓
Size Limit Enforced (LRU eviction if maxCacheSize exceeded)
    ↓
shutdown() Called
    ↓
Cleanup Timer Stopped
    ↓
Cache Cleared
    ↓
Adapter Shutdown
    ↓
No More Operations Allowed
```

## Use Cases

### 1. Long-Running Server State

```javascript
// Application state with automatic cleanup
const manager = new StateManager(
  new FileSystemAdapter('./state'),
  { cacheTTL: 600000, maxCacheSize: 5000 }
);

// Store active connections
await manager.set('connections', connectionId, { socket: ws, startedAt: Date.now() });

// Periodic cleanup automatically removes old connections
```

### 2. Task Execution Tracking

```javascript
// Track running tasks with timeout
const taskManager = new StateManager(
  new FileSystemAdapter('./tasks'),
  { cacheTTL: 1800000, maxCacheSize: 10000 } // 30 min TTL
);

await taskManager.set('tasks', taskId, { status: 'running', progress: 0.5 });
```

### 3. Testing

```javascript
// Use memory adapter to avoid filesystem writes
const testManager = new StateManager(new MemoryAdapter());
```

## Architecture

Solves Issue #7: In-Memory Singletons Without Lifecycle Management

**Before**:
- Unbounded Maps that grow forever
- No cleanup mechanism
- No TTL or expiry
- Module-level state pollution
- Hard to test

**After**:
- Bounded cache with TTL
- Automatic cleanup via interval
- LRU eviction when full
- Optional persistence
- Clean shutdown
- Easily testable with MemoryAdapter

## Related Packages

- `@sequential/server-utilities`: Server configuration and management
- `@sequential/error-handling`: Error handling patterns
