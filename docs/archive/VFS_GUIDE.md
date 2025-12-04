# Task Filesystem (VFS) Guide

## Overview

Tasks in the sequential-ecosystem have access to a scoped filesystem that integrates with OS.js desktop. Files created by tasks are observable in real-time through the GUI.

## Filesystem Scopes

### 1. Run Scope (`run`)
Files specific to a single task execution.
- **Path**: `tasks/{taskId}/runs/{runId}/fs/`
- **Lifetime**: Persists after run completes
- **Use case**: Execution logs, temporary data, run-specific outputs

### 2. Task Scope (`task`)
Files shared across all runs of a task.
- **Path**: `tasks/{taskId}/fs/`
- **Lifetime**: Persists across all runs
- **Use case**: Configuration, templates, shared data

### 3. Global Scope (`global`)
Files accessible to all tasks.
- **Path**: `vfs/global/`
- **Lifetime**: Permanent
- **Use case**: Shared libraries, global configuration, cross-task data

## Using Filesystem in Tasks

### Host Tools API

Tasks can use `__callHostTool__()` to access the filesystem:

```javascript
// Write a file to run scope
await __callHostTool__('writeFile', {
  path: 'output.json',
  content: JSON.stringify({ result: 'success' }),
  scope: 'run'
});

// Read from auto-resolving scope (checks run -> task -> global)
const data = await __callHostTool__('readFile', {
  path: 'config.json',
  scope: 'auto'
});

// List files in a directory
const files = await __callHostTool__('listFiles', {
  path: '/logs',
  scope: 'task'
});

// Check if file exists
const exists = await __callHostTool__('fileExists', {
  path: 'data.txt',
  scope: 'run'
});

// Get file metadata
const stat = await __callHostTool__('fileStat', {
  path: 'output.json',
  scope: 'run'
});

// Delete a file
await __callHostTool__('deleteFile', {
  path: 'temp.txt',
  scope: 'run'
});
```

## Viewing Files in OS.js

Files are automatically mounted in OS.js at:
```
tasks:/{taskId}/run/{path}
tasks:/{taskId}/task/{path}
tasks:/{taskId}/global/{path}
```

### Real-time Updates

The OS.js file manager shows real-time updates as tasks write files. Enable "Watch" mode in the GUI to see changes as they happen.

## Example Task

```javascript
// tasks/data-processor/code.js
export async function processData(input) {
  // Write progress log to run scope
  await __callHostTool__('writeFile', {
    path: 'progress.log',
    content: 'Starting data processing...\n',
    scope: 'run'
  });

  // Read configuration from task scope
  const config = await __callHostTool__('readFile', {
    path: 'config.json',
    scope: 'task'
  });

  // Process data
  const result = { 
    processed: input.data.length,
    timestamp: new Date().toISOString()
  };

  // Save result to run scope
  await __callHostTool__('writeFile', {
    path: 'result.json',
    content: JSON.stringify(result, null, 2),
    scope: 'run'
  });

  // Save summary to global scope for cross-task access
  await __callHostTool__('writeFile', {
    path: `summaries/${input.taskName}.json`,
    content: JSON.stringify(result, null, 2),
    scope: 'global'
  });

  return result;
}
```

## GUI Integration

### Sequential GUI

View task files at: `http://localhost:3001`
- Navigate to Task Runner
- Select a task
- Click "Files" tab
- Switch between Run/Task/Global scopes

### OS.js Desktop

Launch with: `npx sequential-ecosystem gui --desktop`
- Open File Manager
- Navigate to `tasks:/` mount
- Browse task filesystems
- Real-time file watching enabled

## API Endpoints

### List Files
```
GET /api/vfs/tasks/:taskId/:scope/:path
```

### Read File
```
GET /api/vfs/tasks/:taskId/:scope/:filepath
```

### Write File
```
POST /api/vfs/tasks/:taskId/:scope/:filepath
Body: { content: "..." }
```

### Delete File
```
DELETE /api/vfs/tasks/:taskId/:scope/:filepath
```

### Watch Files (WebSocket)
```
ws://localhost:3001/vfs/watch?path=tasks:/:taskId/:scope/:path
```

## Best Practices

1. **Use Run Scope for Execution Data**: Logs, temporary files, run-specific outputs
2. **Use Task Scope for Configuration**: Settings, templates that don't change between runs
3. **Use Global Scope Sparingly**: Only for truly shared data across tasks
4. **Structure Directories**: Create subdirectories to organize files (e.g., `logs/`, `outputs/`, `cache/`)
5. **Clean Up**: Delete temporary files in run scope when no longer needed
6. **JSON for Structured Data**: Use JSON for data that might be consumed by other tasks or the GUI

## Architecture

```
sequential-ecosystem/
├── tasks/
│   ├── task-name/
│   │   ├── fs/                    # Task scope
│   │   │   ├── config.json
│   │   │   └── templates/
│   │   └── runs/
│   │       └── run-id/
│   │           └── fs/            # Run scope
│   │               ├── output.json
│   │               └── logs/
└── vfs/
    └── global/                    # Global scope
        └── shared/
```

## VFS Implementation

- **sequential-runner/taskcode/vfs.js**: Core VFS implementation
- **sequential-runner/taskcode/host-tools.js**: Host tool wrappers
- **osjs-webdesktop/src/server/vfs-task-adapter.js**: OS.js adapter
- **osjs-webdesktop/src/server/task-vfs-provider.js**: OS.js service provider
- **sequential-gui/packages/web/src/components/TaskFileViewer.jsx**: GUI component
