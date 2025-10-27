# Sequential Ecosystem Architecture

## Overview

The sequential ecosystem is a modular task execution platform supporting both Supabase edge functions and native Deno/Bun execution. This document describes the architecture, setup, and development workflow.

## Architecture

### Core Packages

1. **sequential-fetch** - HTTP client for sequential operations
2. **sequential-flow** - Flow state management library
3. **sdk-http-wrapper** - Lightweight SDK wrapper for client-server calls
4. **tasker-sequential** - Task execution engine (deployment-agnostic)

### Storage Adaptor Layer

5. **tasker-adaptor** - Base interfaces and core execution logic
6. **tasker-adaptor-supabase** - Supabase PostgreSQL backend (production)
7. **tasker-adaptor-sqlite** - SQLite file-based backend (development)

### Service Layer

8. **tasker-wrapped-services** - Runtime-agnostic HTTP services (deno-executor, task-executor, wrapped APIs)

### Three-Layer Architecture

**Layer 1: Core Task Execution** (tasker-sequential)
- Deployment-agnostic task execution
- No storage dependencies
- Pure JavaScript/TypeScript

**Layer 2: Storage Adapters** (tasker-adaptor + implementations)
- tasker-adaptor: Interface definitions
- tasker-adaptor-supabase: PostgreSQL backend
- tasker-adaptor-sqlite: File-based backend
- Pluggable - add new backends without changing core

**Layer 3: HTTP Services** (tasker-wrapped-services)
- Runtime-agnostic service implementations
- Runs on Deno, Node.js, or Bun
- Dynamic service discovery and startup
- Can be wrapped as Supabase edge functions
- Or run as standalone HTTP services

**Result:**
- Core logic has zero deployment dependencies
- Storage backend is pluggable
- Services run on any runtime
- Complete decoupling of concerns
- Services can be deployed separately

## Storage Adaptor Layer

The tasker-adaptor packages provide pluggable storage with a unified interface:

### Base Package (tasker-adaptor)

Contains the abstract interfaces and core execution logic:
- `StorageAdapter` - Abstract base class all backends implement
- `TaskExecutor` - Executes task code with suspend/resume
- `StackProcessor` - Processes pending service calls
- `ServiceClient` - Calls wrapped services

### Backend Implementations

Choose one based on your needs:

**Development (SQLite):**
```javascript
import { SQLiteAdapter } from 'tasker-adaptor-sqlite';
import { TaskExecutor } from 'tasker-adaptor';

const adapter = new SQLiteAdapter('./tasks.db');
await adapter.init();

const executor = new TaskExecutor(adapter);
const result = await executor.execute(taskRun, taskCode);
```

**Production (Supabase):**
```javascript
import { SupabaseAdapter } from 'tasker-adaptor-supabase';
import { TaskExecutor } from 'tasker-adaptor';

const adapter = new SupabaseAdapter(url, serviceKey, anonKey);
await adapter.init();

const executor = new TaskExecutor(adapter);
const result = await executor.execute(taskRun, taskCode);
```

### Storage Interface

All backends implement:
- `createTaskRun()` / `getTaskRun()` / `updateTaskRun()` / `queryTaskRuns()`
- `createStackRun()` / `getStackRun()` / `updateStackRun()` / `queryStackRuns()` / `getPendingStackRuns()`
- `storeTaskFunction()` / `getTaskFunction()`
- `setKeystore()` / `getKeystore()` / `deleteKeystore()`

### Service Client

The `ServiceClient` calls wrapped services (gapi, keystore, database, etc):

```javascript
import { ServiceClient } from 'tasker-adaptor';

const client = new ServiceClient({
  type: 'http',
  baseUrl: 'http://localhost:54321',
  authToken: 'service-key'
});

// Call any wrapped service
const domains = await client.call('gapi', 'admin.domains.list', {});
```

## Development Workflow

### Hot Reload with Node.js

```bash
# Start SQLite development server with hot reload
npm run dev

# Or use Supabase backend
npm run dev:supabase

# Or specify port
npm run dev:port 3001
```

Server watches:
- `packages/tasker-adaptor/src/` - Base adaptor code
- `packages/tasker-adaptor-sqlite/src/` - SQLite backend code
- `packages/tasker-sequential/` - Core task execution logic

Automatically reloads on file changes.

Note: Supabase edge functions are in `packages/tasker-adaptor-supabase/edge-functions/` and require `supabase start` + `supabase functions serve` for local development.

### Hot Reload with Deno

```bash
# Start Deno development server
deno run --allow-all dev-deno.ts --sqlite

# Or with Supabase
deno run --allow-all dev-deno.ts --supabase
```

### Development Server API

#### Health Check
```bash
curl http://localhost:3000/health
```

#### Submit Task
```bash
curl -X POST http://localhost:3000/task/submit \
  -H "Content-Type: application/json" \
  -d '{
    "task_identifier": "my-task",
    "input": { "param": "value" }
  }'
```

#### Get Task Status
```bash
curl http://localhost:3000/task/status/1
```

## Task Execution Flow

1. **Submit**: Task submitted to development server
2. **Initialize**: TaskExecutor creates initial stack run
3. **Execute**: Task code runs with `__callHostTool__()` support
4. **Suspend**: When `__callHostTool__()` called, task suspends
5. **Process**: StackProcessor handles service call
6. **Resume**: Parent task resumes with child results

## Database Schema (SQLite)

```sql
-- Task execution records
CREATE TABLE task_runs (
  id INTEGER PRIMARY KEY,
  task_identifier TEXT,
  status TEXT,
  input TEXT,
  result TEXT,
  error TEXT,
  created_at TEXT,
  updated_at TEXT
);

-- Service calls from suspended tasks
CREATE TABLE stack_runs (
  id INTEGER PRIMARY KEY,
  task_run_id INTEGER,
  parent_stack_run_id INTEGER,
  operation TEXT,
  status TEXT,
  input TEXT,
  result TEXT,
  error TEXT,
  created_at TEXT,
  updated_at TEXT
);

-- Published task code
CREATE TABLE task_functions (
  id INTEGER PRIMARY KEY,
  identifier TEXT UNIQUE,
  code TEXT,
  metadata TEXT,
  created_at TEXT,
  updated_at TEXT
);

-- Credentials and configuration
CREATE TABLE keystore (
  id INTEGER PRIMARY KEY,
  key TEXT UNIQUE,
  value TEXT,
  created_at TEXT,
  updated_at TEXT
);
```

## Testing

### SQLite Backend
```bash
npm run test:sqlite
# or in tasker-adaptor-sqlite:
npm run test
```

### Supabase Backend
```bash
npm run test:supabase
# or in tasker-adaptor-supabase:
npm run test
```

### Full Integration
```bash
# Start dev server
npm run dev

# In another terminal, submit a task
curl -X POST http://localhost:3000/task/submit \
  -H "Content-Type: application/json" \
  -d '{"task_identifier":"test","input":{}}'

# Monitor status
curl http://localhost:3000/task/status/1
```

## Environment Variables

### SQLite Development
```bash
# No env vars needed - file-based
SQLITE_DB_PATH=./tasks.db
```

### Supabase Production
```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-key
SUPABASE_ANON_KEY=your-anon-key
```

### Service Client
```bash
SERVICE_CLIENT_TYPE=http
SERVICE_CLIENT_BASE_URL=http://localhost:54321
SERVICE_CLIENT_AUTH_TOKEN=your-token
```

## File Structure

```
sequential-ecosystem/
├── dev-server.js              # Node.js hot reload server
├── dev-deno.ts                # Deno hot reload server
├── dev-bun-local.ts           # Bun hot reload server
├── nodemon.json               # Auto-reload configuration
├── package.json               # Root monorepo
├── deno.json                  # Deno configuration
├── CLAUDE.md                  # This file
├── packages/
│   ├── sequential-fetch/      # HTTP client
│   ├── sequential-flow/       # Flow state management
│   ├── sdk-http-wrapper/      # SDK wrapper
│   │
│   ├── tasker-sequential/     # Task executor (core, deployment-agnostic)
│   │   ├── CLAUDE.md
│   │   ├── package.json
│   │   └── taskcode/          # Task implementations
│   │
│   ├── tasker-adaptor/        # Storage adaptor interface
│   │   ├── src/
│   │   │   ├── interfaces/
│   │   │   │   └── storage-adapter.js
│   │   │   └── core/
│   │   │       ├── service-client.js
│   │   │       ├── task-executor.js
│   │   │       └── stack-processor.js
│   │
│   ├── tasker-adaptor-supabase/   # Supabase storage backend
│   │   ├── CLAUDE.md              # Deployment guide
│   │   ├── src/
│   │   │   └── adapters/
│   │   │       └── supabase.js    # PostgreSQL adaptor
│   │   ├── migrations/            # PostgreSQL schema
│   │   └── config.toml            # Supabase project config
│   │
│   ├── tasker-adaptor-sqlite/     # SQLite storage backend
│   │   ├── src/
│   │   │   ├── index.js
│   │   │   └── sqlite.js
│   │   └── CLAUDE.md
│   │
│   └── tasker-wrapped-services/   # Runtime-agnostic HTTP services
│       ├── CLAUDE.md              # Service docs
│       ├── cli.js                 # Service discovery & startup
│       ├── package.json
│       ├── services/
│       │   ├── deno-executor/     # Task runtime
│       │   ├── simple-stack-processor/
│       │   ├── task-executor/
│       │   ├── gapi/              # Google APIs
│       │   ├── keystore/          # Credentials
│       │   ├── supabase/          # Database ops
│       │   ├── openai/            # OpenAI API
│       │   ├── websearch/         # Web search
│       │   └── admin-debug/       # Debugging
│       └── shared/
│           └── core/              # Shared utilities
```

## Migration from Supabase-Only

### Old Pattern (Supabase-dependent)
```javascript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(url, key);
const { data } = await supabase.from('task_runs').select('*');
```

### New Pattern (Adaptor-independent)
```javascript
import { SQLiteAdapter } from 'tasker-adaptor-sqlite';
import { TaskExecutor } from 'tasker-adaptor';

const adapter = new SQLiteAdapter('./tasks.db');
await adapter.init();
const taskRuns = await adapter.queryTaskRuns({ status: 'pending' });
```

## Next Steps

1. **Integrate with tasker-sequential**
   - Update CLI to use adaptor layer
   - Remove direct Supabase imports
   - Use TaskExecutor and StackProcessor

2. **Extract wrapped services**
   - Move wrappedgapi, wrappedsupabase, etc to separate packages
   - Create plugin interface for service implementations

3. **Enhance hot reload**
   - Live code injection into running tasks
   - Real-time debugging output
   - Task dependency graph visualization

4. **Performance optimization**
   - Connection pooling
   - Query caching
   - Batch operations

## Debugging

### Enable verbose logging
```bash
DEBUG=* npm run dev
```

### Watch database changes (SQLite)
```bash
# In separate terminal
while true; do sqlite3 tasks.db "SELECT * FROM task_runs;"; sleep 1; done
```

### Monitor stack runs
```bash
curl http://localhost:3000/health
curl http://localhost:3000/task/status/1 | jq '.stack_runs'
```

## Performance Notes

- **SQLite** is ideal for development (file-based, no network)
- **Supabase** is ideal for production (managed, scalable)
- Both backends share identical interface
- Hot reload works seamlessly with both

## Resources

- [tasker-sequential docs](./packages/tasker-sequential/CLAUDE.md) - Core task execution
- [tasker-adaptor docs](./packages/tasker-adaptor/README.md) - Storage adaptor interface
- [tasker-adaptor-supabase docs](./packages/tasker-adaptor-supabase/CLAUDE.md) - Supabase backend
- [tasker-adaptor-sqlite docs](./packages/tasker-adaptor-sqlite/README.md) - SQLite backend
- [tasker-wrapped-services docs](./packages/tasker-wrapped-services/CLAUDE.md) - HTTP services
- [sequential-flow docs](./packages/sequential-flow/README.md) - Flow state management
