# Sequential Ecosystem - Architecture Reference

## Overview

**sequential-ecosystem** builds infinite-length task execution systems with automatic suspend/resume on HTTP calls using xstate:

1. **Implicit xstate (FetchFlow)**: Auto-pause on every `fetch()` - zero config, write normal code
2. **Explicit xstate (FlowState)**: State graphs for complex workflows with branches/retries

Deployment-agnostic: works on Node.js, Deno, and Bun without changes.

## Structure

```
sequential-ecosystem/
├── cli.{ts,js}                        # NPX entry point
├── tools/                             # CLI utilities (create-task, sync-tasks)
├── tasks/                             # Default folder storage
│   └── task-name/
│       ├── code.js                    # Task implementation
│       ├── config.json                # Metadata + inputs
│       ├── graph.json                 # State machine (explicit only)
│       └── runs/*.json                # Execution history
└── packages/
    ├── sequential-fetch/              # Implicit xstate VM (FetchFlow)
    ├── sequential-flow/               # Explicit xstate VM (FlowState)
    ├── sequential-runner/             # Task execution engine
    ├── sequential-adaptor{-sqlite,-supabase}/  # Storage backends
    ├── sdk-http-wrapper/              # HTTP client
    └── sequential-wrapped-services/       # Pre-wrapped APIs
```

## xstate Patterns

### Pattern 1: Implicit (FetchFlow) - Default for 80% of Use Cases

**How it works**: VM intercepts `fetch()` → auto-pause → save state → resume on response.

**Use when**: Writing normal async code with HTTP calls.

```javascript
// tasks/my-task/code.js
export async function myTask(input) {
  // VM pauses here automatically
  const emails = await fetch(`https://api.com/users/${input.userId}/emails`);
  const data = await emails.json();

  // Another auto-pause point
  const threads = await fetch('...').then(r => r.json());

  return {success: true, count: data.length};
}
```

**Zero configuration** - just write normal code, state management is automatic.

### Pattern 2: Explicit (FlowState) - For Complex Workflows

**How it works**: Define state graph → executor follows transitions → one chunk per state.

**Use when**: Need conditional branches, error handling paths, or explicit control flow.

```javascript
// tasks/workflow/graph.json
{
  "id": "workflow",
  "initial": "fetchData",
  "states": {
    "fetchData": {"onDone": "process", "onError": "handleError"},
    "process": {"onDone": "complete"},
    "handleError": {"type": "final"},
    "complete": {"type": "final"}
  }
}

// tasks/workflow/code.js
export async function fetchData(input) {
  const data = await __callHostTool__('database', 'getUsers', {});
  return {status: 'success', data};
}

export async function process(result) {
  // Process data from previous state
  return {status: 'success', processed: result.data.length};
}

export async function handleError(error) {
  return {error: error.message};
}
```

**Explicit control** - you define states and transitions.

## Storage Backends

Pluggable storage via adapter pattern: `sequential-runner` → `StorageAdapter` → Backend

### Default: Folder Storage (Zero Setup)

```
tasks/task-name/
├── code.js, config.json, meta.json
└── runs/run-uuid.json              # Execution state + results
```

**Why**: Zero config, Git-friendly, fast local dev, portable.

### Production Options

```bash
# SQLite (single node)
export DATABASE_URL="sqlite:./workflow.db"

# PostgreSQL/Supabase (distributed)
export DATABASE_URL="postgres://host:port/db"
export SUPABASE_KEY="your-key"
```

### Custom Adapters

```javascript
import { registerAdapter, createAdapter } from 'sequential-adaptor';

registerAdapter('mongodb', (config) => new MongoAdapter(config));
const adapter = await createAdapter('mongodb', {uri: '...'});
```

Built-in: `folder` (default), `sqlite`, `supabase`

## Execution Flow

**Implicit**: Load task → Run in VM → `fetch()` triggers pause → Save state → Resume after HTTP
**Explicit**: Load graph → Execute current state → Save result → Check transition → Resume next state

Both patterns loop until task completes or fails.

## Creating Tasks

```bash
# Implicit xstate (default)
npx sequential-ecosystem create-task my-task

# Explicit xstate (with state graph)
npx sequential-ecosystem create-task my-task --with-graph

# With custom inputs
npx sequential-ecosystem create-task my-task --inputs userId,email
```

**Generates**: `tasks/my-task/` with `code.js`, `config.json`, `meta.json`, and optionally `graph.json`

**code.js** - Export async functions (one for implicit, one per state for explicit)
**config.json** - Task metadata and input schema
**graph.json** - State machine definition (explicit only)

## CLI Commands

```bash
# Task creation
create-task <name> [--with-graph] [--inputs userId,email]

# Task execution
run <task-name> --input '{"userId":"123"}' [--save] [--dry-run] [--verbose]

# Task management
list                              # List all tasks
describe <task-name>              # Show task details
history <task-name>               # View execution history
show <task-name> <run-id>         # View specific run
delete <task-name>                # Delete task

# Storage sync
sync-tasks [--adaptor sqlite] [--task my-task]

# Configuration
config set adaptor sqlite         # Set storage backend
config set defaults.userId john   # Set default inputs
config show                       # View current config
```

## Environment Variables

```bash
# Storage (optional - defaults to folder)
DATABASE_URL="sqlite:./workflow.db"          # SQLite
DATABASE_URL="postgres://host:port/db"       # PostgreSQL
SUPABASE_URL="https://project.supabase.co"   # Supabase
SUPABASE_KEY="your-api-key"

# Development
DEBUG=1                                       # Verbose logging
NODE_ENV=development

# Task execution
TASK_TIMEOUT=300000                          # 5 min timeout (default)
TASK_MAX_RETRIES=3                           # Retry count
```

## Deployment

| Environment | Storage | Setup |
|------------|---------|-------|
| **Local Dev** | Folder (default) | None - works immediately |
| **Testing** | Folder | None |
| **Prod (single node)** | SQLite or Folder | Set `DATABASE_URL` or use backups |
| **Prod (distributed)** | PostgreSQL/Supabase | Set `DATABASE_URL` + `SUPABASE_*` |

## Package Architecture

**Execution Layer**
- `sequential-fetch` - Implicit xstate VM (auto-pause on `fetch()`)
- `sequential-flow` - Explicit xstate VM (state graph execution)
- `sequential-runner` - Task runner, handles `__callHostTool__()`, NPX entry

**Storage Layer**
- `sequential-adaptor` - Storage interface contract
- `sequential-adaptor-sqlite` - SQLite implementation
- `sequential-adaptor-supabase` - PostgreSQL/Supabase implementation

**Utilities**
- `sdk-http-wrapper` - HTTP client with retry logic
- `sequential-wrapped-services` - Pre-wrapped APIs (Google, OpenAI, Supabase)

## Design Decisions

**Why two xstate patterns?**
- Implicit (80% of tasks): Write normal code, auto state management
- Explicit (20% of tasks): Complex workflows need explicit control
- Progressive: Start simple, graduate to explicit when needed

**Why folder-based default?**
- Zero setup, Git-friendly, fast, easy debugging, no dependencies

**Why storage adaptor pattern?**
- Deployment flexibility, testing simplicity, scalability, vendor independence

## Common Patterns

**Retry Logic (Implicit)**
```javascript
export async function retryableTask(input) {
  for (let i = 0; i < 3; i++) {
    try {
      return await fetch(url).then(r => r.json()); // Auto-pause/resume
    } catch (e) {
      if (i === 2) throw e;
      await new Promise(r => setTimeout(r, 1000 * i));
    }
  }
}
```

**Conditional Branching (Explicit)**
```javascript
// graph.json: checkStatus → {onSuccess: processA, onFail: processB}
export async function checkStatus(input) {
  const ok = await __callHostTool__('api', 'status', {});
  return {success: ok};
}
```

**Batch Processing (Explicit)**
```javascript
// graph.json: fetchBatch1 → processBatch1 → fetchBatch2 → processBatch2
export async function fetchBatch1() {
  return await __callHostTool__('db', 'getUsers', {limit: 100});
}
```

## Quick Start

```bash
bun install                                      # Install dependencies
npx sequential-ecosystem create-task my-task    # Create task
# Edit tasks/my-task/code.js
npx sequential-ecosystem run my-task --input '{}' # Run task
# View results in tasks/my-task/runs/
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Task won't run | `run my-task --dry-run --verbose` to check syntax |
| State not saving | Check `config show` and `ls -la tasks/` permissions |
| HTTP not pausing | Use `fetch()` (implicit) or `__callHostTool__()` (explicit) |

## Key Takeaways

- **Two patterns**: Implicit (80% - auto state) vs Explicit (20% - control flow)
- **Zero setup**: Folder storage works immediately, upgrade to DB when needed
- **Pluggable**: Swap storage backends without code changes
- **Production-ready**: No mocks, deployment-agnostic

## Admin GUI - Flow Builder

Visual editor for explicit xstate workflows (`packages/admin-gui/packages/web/src/`).

**Features**: Drag-drop state reordering, real-time validation, SVG visualization, glassmorphism UI

**Usage**: Add/edit states → Configure transitions (onDone/onError) → Mark final states → Save

**Components**: `FlowBuilder.jsx` (editor), `StateMachineVisualizer.jsx` (SVG diagram)
