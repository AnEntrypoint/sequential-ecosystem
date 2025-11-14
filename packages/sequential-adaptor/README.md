# Tasker Adaptor

Base interfaces and core execution logic for task execution with pluggable storage backends.

## Installation

```bash
npm install sequential-adaptor
```

## Exports

### Interfaces
- `StorageAdapter` - Abstract base class for storage implementations

### Core Classes
- `ServiceClient` - Makes HTTP calls to wrapped services
- `TaskExecutor` - Executes task code with automatic suspend/resume
- `StackProcessor` - Processes pending service calls sequentially

## Usage

```javascript
import {
  StorageAdapter,
  ServiceClient,
  TaskExecutor,
  StackProcessor
} from 'sequential-adaptor';
```

## Implementations

This package provides the base interfaces. Use one of the backend implementations:

- **sequential-adaptor-supabase** - For Supabase backend
- **sequential-adaptor-sqlite** - For SQLite backend

## Storage Adapter Interface

All storage backends must implement:

```javascript
class MyStorageAdapter extends StorageAdapter {
  async init() { }
  async createTaskRun(taskRun) { }
  async getTaskRun(id) { }
  async updateTaskRun(id, updates) { }
  async queryTaskRuns(filter) { }
  async createStackRun(stackRun) { }
  async getStackRun(id) { }
  async updateStackRun(id, updates) { }
  async queryStackRuns(filter) { }
  async getPendingStackRuns() { }
  async storeTaskFunction(taskFunction) { }
  async getTaskFunction(identifier) { }
  async setKeystore(key, value) { }
  async getKeystore(key) { }
  async deleteKeystore(key) { }
  async close() { }
}
```

## Architecture

**Base (sequential-adaptor):**
- StorageAdapter interface
- ServiceClient for HTTP calls
- TaskExecutor for task execution
- StackProcessor for service call processing

**Implementations:**
- sequential-adaptor-supabase - Supabase PostgreSQL backend
- sequential-adaptor-sqlite - SQLite backend

## License

MIT
