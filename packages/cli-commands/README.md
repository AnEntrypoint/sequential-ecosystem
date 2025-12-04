# @sequential/cli-commands

CLI commands for sequential-ecosystem task management.

## Overview

This package provides all CLI commands for the sequential-ecosystem, including task creation, execution, management, and configuration.

## Commands

### Task Management
- `create-task` - Create new tasks with templates
- `run-task` - Execute tasks with multiple runners
- `sync-tasks` - Sync tasks to storage adapters
- `list-command` - List all available tasks
- `describe-command` - Show task details
- `history-command` - View task execution history
- `show-command` - Display specific run results
- `delete-command` - Remove tasks

### System Commands
- `init-command` - Initialize sequential-ecosystem with examples
- `gui-command` - Launch Sequential Desktop GUI

### Configuration
- `config` - Get/set configuration values
- `command-loader` - Dynamic command loading system

## Usage

```javascript
import {
  createTask,
  runTask,
  syncTasks,
  listCommand,
  getConfig,
  setConfig
} from '@sequential/cli-commands';

// Create a new task
await createTask({
  name: 'my-task',
  runner: 'flow',
  inputs: ['userId', 'email']
});

// Run a task
await runTask({
  taskName: 'my-task',
  input: { userId: '123', email: 'test@example.com' },
  save: true
});

// List tasks
await listCommand({ verbose: true });

// Get config value
const adaptor = getConfig('adaptor');

// Set config value
setConfig('adaptor', 'sqlite');
```

## Templates

This package includes task templates for:
- Flow-based tasks (implicit xstate)
- Graph-based tasks (explicit xstate)
- Machine-based tasks (Sequential-OS)

## Examples

Contains comprehensive examples for:
- Simple flows
- Complex workflows
- API integrations
- Batch processing
- Sequential-OS usage
- Pre-configured tools

## License

MIT
