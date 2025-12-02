import path from 'path';
import { existsSync } from 'fs';
import { ensureDirectory, writeFileAtomicJson, writeFileAtomicString } from '@sequential/file-operations';

function generateDocumentation() {
  return `# Sequential Ecosystem - Quick Start Guide

## What is Sequential Ecosystem?

Sequential Ecosystem is a framework for building infinite-length task execution systems with automatic suspend/resume on HTTP calls. Write normal async code with \`fetch()\` and the system automatically pauses, saves state, and resumes—perfect for long-running workflows on stateless infrastructure.

## Quick Start (5 minutes)

\`\`\`bash
npm install -g sequential-ecosystem
npx sequential-ecosystem init
npx sequential-ecosystem create-task my-task
# Edit ./tasks/my-task/code.js
npx sequential-ecosystem run my-task --input '{}'
npx sequential-ecosystem gui  # Visual desktop UI on http://localhost:3001
\`\`\`

## Architecture Overview

**Three Execution Patterns:**
- **Implicit xstate (Sequential-JS)**: Auto-pause on \`fetch()\` - zero config
- **Explicit xstate (FlowState)**: State graphs for complex workflows
- **Container (Sequential-OS)**: Content-addressable layers for shell commands

**Storage Backends:**
- Folder (default): Zero setup, Git-friendly
- SQLite: Single-node persistence
- PostgreSQL/Supabase: Distributed deployments

## Folder Structure

\`\`\`
my-project/
├── .sequentialrc.json     # Configuration (adaptor, defaults)
├── tasks/                 # Task definitions
│   ├── my-task/
│   │   ├── code.js       # Task implementation
│   │   ├── config.json   # Metadata & input schema
│   │   └── runs/         # Execution history
│   └── my-flow/
│       ├── code.js
│       ├── graph.json    # State machine (explicit only)
│       └── config.json
├── tools/                # Reusable utility functions
│   ├── database.js
│   ├── api-client.js
│   └── filesystem.js
└── flows/               # Flow definitions
    ├── user-auth.json
    └── data-pipeline.json
\`\`\`

## CLI Commands

### Task Management
\`\`\`bash
npx sequential-ecosystem create-task <name> [--runner flow|machine]
npx sequential-ecosystem run <name> --input '{...}'
npx sequential-ecosystem list
npx sequential-ecosystem describe <name>
npx sequential-ecosystem history <name>
npx sequential-ecosystem show <name> <run-id>
npx sequential-ecosystem delete <name>
\`\`\`

### Configuration
\`\`\`bash
npx sequential-ecosystem config set adaptor sqlite
npx sequential-ecosystem config set defaults.userId john
npx sequential-ecosystem config show
\`\`\`

### Visual Tools
\`\`\`bash
npx sequential-ecosystem gui           # Desktop GUI (port 3001)
npx sequential-ecosystem gui --desktop # OS.js desktop mode
\`\`\`

## Writing Tasks

### Pattern 1: Implicit (Sequential-JS) - Recommended for 80% of use cases

Write normal async code. \`fetch()\` calls trigger automatic pause/resume.

\`\`\`javascript
export async function myTask(input) {
  const data = await fetch(\`/api/users/\${input.userId}\`)
    .then(r => r.json());
  const posts = await fetch(\`/api/posts\`).then(r => r.json());
  return { success: true, count: posts.length };
}

export const config = {
  id: 'my-task',
  name: 'My Task',
  inputs: [{ name: 'userId', type: 'string', required: true }]
};
\`\`\`

### Pattern 2: Explicit (FlowState) - For complex workflows

Define state graph, executor follows transitions.

\`\`\`javascript
export const graph = {
  id: 'workflow',
  initial: 'fetchData',
  states: {
    fetchData: { onDone: 'process', onError: 'handleError' },
    process: { onDone: 'complete' },
    handleError: { type: 'final' },
    complete: { type: 'final' }
  }
};

export async function fetchData(input) {
  const data = await fetch('/api/data').then(r => r.json());
  return { status: 'success', data };
}

export async function process(result) {
  return { count: result.data.length };
}

export async function handleError(error) {
  return { error: error.message };
}
\`\`\`

## Available Host Tools

Inside tasks, access filesystem via \`__callHostTool__()\`:

\`\`\`javascript
// Write file
await __callHostTool__('writeFile', {
  path: 'output.json',
  content: { result: 'success' },
  scope: 'run'  // 'run', 'task', or 'global'
});

// Read file
const result = await __callHostTool__('readFile', {
  path: 'config.json',
  scope: 'auto'  // Searches run -> task -> global
});

// List files
const files = await __callHostTool__('listFiles', {
  path: '/',
  scope: 'run'
});

// File operations
await __callHostTool__('mkdir', { path: 'logs', scope: 'run' });
await __callHostTool__('fileExists', { path: 'file.txt', scope: 'run' });
await __callHostTool__('deleteFile', { path: 'temp.txt', scope: 'run' });
\`\`\`

## HTTP API Endpoints

### Task Management
\`\`\`
POST   /api/tasks                      # Create task
GET    /api/tasks                      # List tasks
GET    /api/tasks/:taskName            # Get task details
PUT    /api/tasks/:taskName            # Update task
DELETE /api/tasks/:taskName            # Delete task
POST   /api/tasks/:taskName/run        # Execute task
GET    /api/tasks/:taskName/history    # Execution history
GET    /api/tasks/:taskName/runs/:id   # Run details
\`\`\`

### Flow Management
\`\`\`
POST   /api/flows                      # Create flow
GET    /api/flows                      # List flows
GET    /api/flows/:id                  # Get flow
PUT    /api/flows/:id                  # Update flow
DELETE /api/flows/:id                  # Delete flow
\`\`\`

### Scheduler
\`\`\`
POST   /api/scheduler/schedule         # Schedule task (once/recurring/interval)
GET    /api/scheduler/scheduled        # List schedules
GET    /api/scheduler/stats            # Scheduler statistics
GET    /api/scheduler/:id              # Get schedule
PUT    /api/scheduler/:id              # Update schedule
DELETE /api/scheduler/:id              # Cancel schedule
GET    /api/scheduler/:id/history      # Execution history
\`\`\`

### Execution
\`\`\`
GET    /api/runs                       # List all runs
GET    /api/runs/:id                   # Run details
POST   /api/runs/:id/cancel            # Cancel run
GET    /api/metrics                    # Aggregated metrics
\`\`\`

## Triggers & Events

### File-based Triggers
Monitor directories and auto-run tasks on file changes:

\`\`\`bash
npx sequential-ecosystem sync ./tasks --watch
\`\`\`

### Cron Scheduling
Schedule tasks using cron expressions:

\`\`\`bash
curl -X POST http://localhost:3000/api/scheduler/schedule \\
  -H 'Content-Type: application/json' \\
  -d '{
    "taskName": "daily-sync",
    "type": "recurring",
    "cronExpression": "0 9 * * *",
    "args": []
  }'
\`\`\`

### Interval Scheduling
Repeat tasks at fixed intervals:

\`\`\`bash
curl -X POST http://localhost:3000/api/scheduler/schedule \\
  -H 'Content-Type: application/json' \\
  -d '{
    "taskName": "background-job",
    "type": "interval",
    "intervalMs": 300000,
    "args": []
  }'
\`\`\`

### One-time Scheduling
Schedule task for specific future time:

\`\`\`bash
curl -X POST http://localhost:3000/api/scheduler/schedule \\
  -H 'Content-Type: application/json' \\
  -d '{
    "taskName": "send-report",
    "type": "once",
    "executeAt": 1702600000000,
    "args": ["john@example.com"]
  }'
\`\`\`

## Environment Variables

\`\`\`bash
# Storage
DATABASE_URL="sqlite:./tasks.db"           # SQLite
DATABASE_URL="postgres://host:port/db"     # PostgreSQL

# Server
PORT=3000
NODE_ENV=development
DEBUG=1                                     # Verbose logging

# Task Execution
TASK_TIMEOUT=300000                        # 5 minutes
TASK_MAX_RETRIES=3

# Storage Backend Selection
SEQUENTIAL_ADAPTOR=folder                  # default, sqlite, supabase
\`\`\`

## Common Patterns

### Retry Logic
\`\`\`javascript
export async function retryableTask(input) {
  for (let i = 0; i < 3; i++) {
    try {
      return await fetch(url).then(r => r.json());
    } catch (e) {
      if (i === 2) throw e;
      await new Promise(r => setTimeout(r, 1000 * Math.pow(2, i)));
    }
  }
}
\`\`\`

### Batch Processing
\`\`\`javascript
export async function batchTask(input) {
  const batchSize = 100;
  for (let i = 0; i < input.items.length; i += batchSize) {
    const batch = input.items.slice(i, i + batchSize);
    await Promise.all(batch.map(processItem));
  }
  return { processed: input.items.length };
}
\`\`\`

### Progress Tracking
\`\`\`javascript
export async function progressTask(input) {
  for (let i = 0; i < input.items.length; i++) {
    await processItem(input.items[i]);
    const progress = Math.round((i + 1) / input.items.length * 100);
    await __callHostTool__('writeFile', {
      path: 'progress.json',
      content: { current: i + 1, total: input.items.length, percent: progress },
      scope: 'run'
    });
  }
}
\`\`\`

### Checkpointing
\`\`\`javascript
export async function resumableTask(input) {
  const checkpointPath = 'checkpoint.json';
  let state = { processed: 0 };

  const checkpointExists = await __callHostTool__('fileExists', {
    path: checkpointPath,
    scope: 'run'
  });

  if (checkpointExists.exists) {
    const checkpoint = await __callHostTool__('readFile', {
      path: checkpointPath,
      scope: 'run'
    });
    state = JSON.parse(checkpoint.content);
  }

  for (let i = state.processed; i < input.items.length; i++) {
    await processItem(input.items[i]);
    state.processed = i + 1;
    await __callHostTool__('writeFile', {
      path: checkpointPath,
      content: state,
      scope: 'run'
    });
  }
}
\`\`\`

## Deployment

| Environment | Storage | Commands |
|---|---|---|
| Local Dev | Folder (default) | \`npx sequential-ecosystem init\` |
| Testing | Folder | Same, no config needed |
| Production (single) | SQLite | \`DATABASE_URL="sqlite:./tasks.db"\` |
| Production (distributed) | PostgreSQL | \`DATABASE_URL="postgres://..."\` |

## Desktop GUI

Visual interface available at \`http://localhost:3001\` after running \`npx sequential-ecosystem gui\`.

**Apps included:**
- Terminal - Full Sequential-OS CLI
- Code Editor - Edit task code with syntax highlighting
- Task Editor - Visual task builder with multiple runners
- Flow Editor - Drag-and-drop state machine designer
- Task Debugger - Test & debug tasks
- Flow Debugger - Visualize state machine execution
- Run Observer - Real-time metrics dashboard
- File Browser - Browse task files and outputs

## Troubleshooting

**Task won't run**
\`\`\`bash
npx sequential-ecosystem run my-task --dry-run --verbose
\`\`\`

**Check state**
\`\`\`bash
npx sequential-ecosystem show my-task <run-id>
npx sequential-ecosystem history my-task
\`\`\`

**Reset storage**
\`\`\`bash
rm -rf ./tasks/**/runs
npx sequential-ecosystem init  # Reinitialize
\`\`\`

**View logs**
\`\`\`bash
# Desktop GUI shows real-time execution logs
# Or read from task runs directory:
cat ./tasks/my-task/runs/<run-id>.json
\`\`\`

## Next Steps

1. Create your first task: \`npx sequential-ecosystem create-task <name>\`
2. Try the GUI: \`npx sequential-ecosystem gui\`
3. Run examples: \`npx sequential-ecosystem run example-simple-flow\`
4. Schedule tasks: Use \`/api/scheduler/schedule\` endpoint
5. Integrate: Embed in your app or use as microservice

## Key Concepts

- **State**: Automatically saved between HTTP calls, survives restarts
- **Scopes**: run (current execution), task (shared), global (all tasks)
- **Adaptor**: Pluggable storage (folder/sqlite/supabase)
- **Runner**: Execution strategy (sequential-js/flow/sequential-os)
- **Graph**: State machine definition for explicit workflows

Happy building! 🚀
`;
}

export async function initCommand(options) {
  try {
    const paths = [
      path.join(process.cwd(), 'tasks'),
      path.join(process.cwd(), 'tools')
    ];

    for (const p of paths) {
      if (!existsSync(p)) {
        await ensureDirectory(p);
        console.log(`✓ Created ${p}`);
      }
    }

    const configFile = path.join(process.cwd(), '.sequentialrc.json');
    if (!existsSync(configFile)) {
      await writeFileAtomicJson(configFile, {
        adaptor: 'default',
        defaults: {}
      });
      console.log(`✓ Created ${configFile}`);
    }

    const docContent = generateDocumentation();
    const docFiles = ['README.md', 'CLAUDE.md', 'AGENTS.md', 'GEMINI.md'];
    for (const fileName of docFiles) {
      const docPath = path.join(process.cwd(), fileName);
      await writeFileAtomicString(docPath, docContent);
      console.log(`✓ Created ${docPath}`);
    }

    if (options.examples !== false) {
      const { createExamples } = await import('../create-examples.js');
      await createExamples();
    }

    console.log('\n✓ Initialized sequential-ecosystem');
    console.log('\n📦 Quick Commands:');
    console.log('  npx sequential-ecosystem create-task <name> [--runner flow|machine]');
    console.log('  npx sequential-ecosystem run <name> --input \'{}\'');
    console.log('  npx sequential-ecosystem gui');

    if (options.examples !== false) {
      console.log('\n📚 Example Tasks (./tasks/):');
      console.log('  - example-simple-flow: Sequential-JS with auto-pause');
      console.log('  - example-complex-flow: FlowState with explicit state machine');
      console.log('  - example-api-integration: HTTP client with retry logic');
      console.log('  - example-batch-processing: Concurrency control and batching');
      console.log('  - example-sequential-os: Container-based with layer management');

      console.log('\n🔧 Example Tools (./tools/):');
      console.log('  - database.js: Database operations (query, insert, update, delete)');
      console.log('  - api-client.js: HTTP client with retry and backoff');
      console.log('  - filesystem.js: File operations with safety checks');

      console.log('\n🔄 Example Flows (./tasks/flows/):');
      console.log('  - user-authentication.json: Authentication workflow');
      console.log('  - data-pipeline.json: ETL processing pipeline');
      console.log('  - order-processing.json: E-commerce order flow');

      console.log('\n🚀 Try it out:');
      console.log('  npx sequential-ecosystem run example-simple-flow --input \'{"message":"hello"}\'');
      console.log('  npx sequential-ecosystem gui  # Visual Desktop GUI');
      console.log('\n📖 Read: ./tasks/EXAMPLES.md for detailed documentation');
    }
  } catch (e) {
    console.error('Error:', e instanceof Error ? e.message : String(e));
    process.exit(1);
  }
}
