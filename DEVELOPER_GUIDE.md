# Sequential Ecosystem - Developer Guide

## Quick Start

```bash
# Install
npm install -g sequential-ecosystem

# Initialize project
npx sequential-ecosystem init

# Create your first task
npx sequential-ecosystem create-task my-task

# Run it
npx sequential-ecosystem run my-task --input '{"data": "test"}'

# Launch GUI
npx sequential-ecosystem gui
```

## Task Development

### Basic Task Structure

```javascript
// tasks/my-task/code.js
export async function myTask(input) {
  // Your code here
  return { success: true, result: input };
}

export const config = {
  id: 'my-task',
  name: 'My Task',
  description: 'Does something useful',
  inputs: [
    {
      name: 'data',
      type: 'string',
      description: 'Input data',
      required: true
    }
  ]
};
```

### Using the Filesystem (VFS)

Tasks have access to a scoped filesystem:

```javascript
export async function myTask(input) {
  // Write to run scope (specific to this execution)
  await __callHostTool__('writeFile', {
    path: 'output.json',
    content: { result: 'success' },
    scope: 'run'
  });

  // Read from task scope (shared across runs)
  const config = await __callHostTool__('readFile', {
    path: 'config.json',
    scope: 'task'
  });

  // Write to global scope (accessible to all tasks)
  await __callHostTool__('writeFile', {
    path: 'shared/registry.json',
    content: { taskId: 'my-task', lastRun: new Date() },
    scope: 'global'
  });

  return { success: true };
}
```

### Available Host Tools

#### File Operations

```javascript
// Write file
await __callHostTool__('writeFile', {
  path: 'file.txt',
  content: 'Hello World',
  scope: 'run',        // 'run', 'task', or 'global'
  encoding: 'utf8',    // optional
  append: false        // optional
});

// Read file
const result = await __callHostTool__('readFile', {
  path: 'file.txt',
  scope: 'auto',       // 'auto' searches run -> task -> global
  encoding: 'utf8'     // optional
});
console.log(result.content);

// List files
const files = await __callHostTool__('listFiles', {
  path: '/',
  scope: 'run',
  recursive: false     // optional
});
console.log(files.files, files.directories);

// Check file exists
const exists = await __callHostTool__('fileExists', {
  path: 'file.txt',
  scope: 'run'
});

// Get file metadata
const stat = await __callHostTool__('fileStat', {
  path: 'file.txt',
  scope: 'run'
});
console.log(stat.size, stat.modified);

// Create directory
await __callHostTool__('mkdir', {
  path: 'logs',
  scope: 'run'
});

// Delete file
await __callHostTool__('deleteFile', {
  path: 'temp.txt',
  scope: 'run'
});

// Get VFS tree info
const tree = await __callHostTool__('vfsTree', {});
console.log(tree.tree); // Shows all scopes with sizes
```

### Error Handling

All host tools return `{ success: boolean, error?: string }`:

```javascript
const result = await __callHostTool__('writeFile', {
  path: 'output.json',
  content: data
});

if (!result.success) {
  console.error('Failed:', result.error);
  throw new Error(`Write failed: ${result.error}`);
}
```

### Logging Pattern

```javascript
export async function myTask(input) {
  const log = async (message) => {
    console.log(message);
    await __callHostTool__('writeFile', {
      path: 'execution.log',
      content: `[${new Date().toISOString()}] ${message}\n`,
      scope: 'run',
      append: true
    });
  };

  await log('Task started');
  // ... do work
  await log('Task completed');
}
```

### Configuration Pattern

```javascript
export async function myTask(input) {
  // Check for task-level config
  const configExists = await __callHostTool__('fileExists', {
    path: 'config.json',
    scope: 'task'
  });

  let config = { default: true };
  
  if (configExists.exists) {
    const configData = await __callHostTool__('readFile', {
      path: 'config.json',
      scope: 'task'
    });
    config = JSON.parse(configData.content);
  } else {
    // Create default config
    await __callHostTool__('writeFile', {
      path: 'config.json',
      content: config,
      scope: 'task'
    });
  }

  return { config };
}
```

## GUI Development

### Launching the GUI

```bash
# Sequential GUI (React-based)
npx sequential-ecosystem gui

# OS.js Desktop Mode
npx sequential-ecosystem gui --desktop

# Custom port
npx sequential-ecosystem gui --port 8080
```

### Viewing Task Files

1. Open GUI at http://localhost:3001
2. Navigate to task
3. Click "Files" tab
4. Switch between Run/Task/Global scopes
5. Enable "Watch" mode for real-time updates

### File Viewer Features

- **Real-time Updates**: Enable watch mode to see files as tasks create them
- **Inline Editor**: Click Edit to modify files directly
- **Upload Files**: Drag-and-drop or click Upload
- **Create Files/Folders**: Use + buttons in toolbar
- **Search**: Filter files by name
- **Download**: Download individual files
- **Delete**: Remove files/directories
- **Scope Indicator**: Color-coded scope badges

### OS.js Integration

Files are automatically mounted at `tasks:/{taskId}/{scope}/` in OS.js:

```
tasks:/my-task/run/       # Run-specific files
tasks:/my-task/task/      # Task-level files
tasks:/my-task/global/    # Global files
```

## Best Practices

### 1. File Organization

```
tasks/my-task/
├── fs/                   # Task scope
│   ├── config.json      # Configuration
│   └── templates/       # Reusable templates
└── runs/
    └── run-123/
        └── fs/          # Run scope
            ├── logs/    # Execution logs
            ├── outputs/ # Results
            └── temp/    # Temporary files
```

### 2. Scoping Strategy

- **Run Scope**: Logs, outputs, temporary data
- **Task Scope**: Configuration, templates, documentation
- **Global Scope**: Shared registries, cross-task data

### 3. Naming Conventions

```javascript
// Good
await __callHostTool__('writeFile', {
  path: 'outputs/results-2024-01-15.json',
  content: results,
  scope: 'run'
});

// Bad - no structure
await __callHostTool__('writeFile', {
  path: 'result.json',
  content: results,
  scope: 'run'
});
```

### 4. Always Use Directories

```javascript
// Create structure first
await __callHostTool__('mkdir', { path: 'outputs', scope: 'run' });
await __callHostTool__('mkdir', { path: 'logs', scope: 'run' });

// Then write files
await __callHostTool__('writeFile', {
  path: 'outputs/result.json',
  content: data,
  scope: 'run'
});
```

### 5. JSON for Data, Markdown for Summaries

```javascript
// Structured data
await __callHostTool__('writeFile', {
  path: 'outputs/data.json',
  content: { items: [...] },
  scope: 'run'
});

// Human-readable summary
await __callHostTool__('writeFile', {
  path: 'outputs/summary.md',
  content: `# Summary\n\nProcessed ${count} items`,
  scope: 'run'
});
```

### 6. Clean Up Temporary Files

```javascript
export async function myTask(input) {
  // Create temp file
  await __callHostTool__('writeFile', {
    path: 'temp/processing.json',
    content: tempData,
    scope: 'run'
  });

  // ... do work

  // Clean up
  await __callHostTool__('deleteFile', {
    path: 'temp/processing.json',
    scope: 'run'
  });
}
```

### 7. Error Recovery

```javascript
export async function myTask(input) {
  try {
    // ... main logic
  } catch (error) {
    // Log error to file
    await __callHostTool__('writeFile', {
      path: 'logs/error.json',
      content: {
        error: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
      },
      scope: 'run'
    });
    
    throw error;
  }
}
```

## Debugging

### Enable Debug Mode

```bash
DEBUG=1 npx sequential-ecosystem run my-task --input '{}'
```

This enables verbose VFS logging:
```
[TaskVFS] VFS initialized { taskId: 'my-task', runId: '...' }
[TaskVFS] File written { path: 'output.json', size: 123 }
[TaskVFS] File read { path: 'config.json', scope: 'task' }
```

### Check VFS Tree

```javascript
const tree = await __callHostTool__('vfsTree', {});
console.log(JSON.stringify(tree.tree, null, 2));
```

Output:
```json
{
  "run": {
    "path": "/path/to/tasks/my-task/runs/123/fs",
    "exists": true,
    "size": 45678
  },
  "task": {
    "path": "/path/to/tasks/my-task/fs",
    "exists": true,
    "size": 1234
  },
  "global": {
    "path": "/path/to/vfs/global",
    "exists": true,
    "size": 5678
  }
}
```

### View Files in GUI

1. Enable Watch mode
2. Run task
3. See files appear in real-time
4. Click to view contents
5. Check VFS Storage panel for sizes

## Advanced Patterns

### Batch Processing

```javascript
export async function processBatch(input) {
  const { items } = input;
  
  await __callHostTool__('mkdir', {
    path: 'batch-results',
    scope: 'run'
  });

  for (let i = 0; i < items.length; i++) {
    const result = await processItem(items[i]);
    
    await __callHostTool__('writeFile', {
      path: `batch-results/item-${i}.json`,
      content: result,
      scope: 'run'
    });
  }

  return { success: true, processed: items.length };
}
```

### Progress Tracking

```javascript
export async function longRunningTask(input) {
  const total = input.items.length;
  
  for (let i = 0; i < total; i++) {
    // ... process item
    
    const progress = {
      current: i + 1,
      total,
      percent: Math.round((i + 1) / total * 100),
      timestamp: new Date().toISOString()
    };
    
    await __callHostTool__('writeFile', {
      path: 'progress.json',
      content: progress,
      scope: 'run'
    });
  }
}
```

### Checkpointing

```javascript
export async function resumableTask(input) {
  // Check for checkpoint
  const checkpointExists = await __callHostTool__('fileExists', {
    path: 'checkpoint.json',
    scope: 'run'
  });

  let state = { processed: [], currentIndex: 0 };
  
  if (checkpointExists.exists) {
    const checkpoint = await __callHostTool__('readFile', {
      path: 'checkpoint.json',
      scope: 'run'
    });
    state = JSON.parse(checkpoint.content);
  }

  // Resume from checkpoint
  for (let i = state.currentIndex; i < input.items.length; i++) {
    // ... process
    state.processed.push(result);
    state.currentIndex = i + 1;
    
    // Save checkpoint
    await __callHostTool__('writeFile', {
      path: 'checkpoint.json',
      content: state,
      scope: 'run'
    });
  }
}
```

## Troubleshooting

### Files Not Appearing in GUI

1. Check scope is correct (run/task/global)
2. Verify path doesn't start with `/` (relative paths only)
3. Enable Debug mode: `DEBUG=1`
4. Check VFS tree for actual paths

### Write Failures

```javascript
const result = await __callHostTool__('writeFile', {
  path: 'output.json',
  content: data
});

if (!result.success) {
  console.error('Error:', result.error);
  // Common issues:
  // - Path traversal (..)
  // - Invalid scope name
  // - Content not serializable
}
```

### Read Failures

```javascript
// Use 'auto' scope to search all scopes
const result = await __callHostTool__('readFile', {
  path: 'config.json',
  scope: 'auto'  // Searches run -> task -> global
});

if (!result.success) {
  console.error('Not found in any scope:', result.error);
}
```

## API Reference

See [VFS_GUIDE.md](./VFS_GUIDE.md) for complete API documentation.

## Examples

See `tasks/filesystem-demo/` for a comprehensive example showcasing all features.

```bash
npx sequential-ecosystem run filesystem-demo --input '{"items": 5}'
```

This creates:
- Execution logs in run scope
- Configuration in task scope
- Registry in global scope
- Multiple sample files
- Markdown summary
- Real-time progress updates
