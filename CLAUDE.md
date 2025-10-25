# Sequential Ecosystem Architecture

## Overview

The sequential ecosystem is a modular task execution platform supporting both Supabase edge functions and native Deno/Bun execution. This document describes the architecture, setup, and development workflow.

## Architecture

### Core Packages

1. **sequential-fetch** - HTTP client for sequential operations
2. **sequential-flow** - Flow state management library
3. **sdk-http-wrapper** - Lightweight SDK wrapper for client-server calls
4. **tasker-sequential** - Task execution engine (core logic)
5. **tasker-adaptor-supabase** - Storage and service adaptor (new!)

### Key Separation

**Before:**
- tasker-sequential had direct Supabase dependencies
- Edge functions were tightly coupled to Supabase
- Required Supabase infrastructure for development

**After:**
- tasker-sequential contains core task execution logic only
- tasker-adaptor-supabase provides storage abstraction
- Can use SQLite for rapid local development
- Can use Supabase for production deployment
- Generic code works on Deno, Bun, and Node.js

## Storage Adaptor

The `tasker-adaptor-supabase` package provides pluggable storage:

```javascript
import { SupabaseAdapter, SQLiteAdapter, TaskExecutor } from 'tasker-adaptor-supabase';

// Development: SQLite
const adapter = new SQLiteAdapter('./tasks.db');

// Production: Supabase
const adapter = new SupabaseAdapter(url, serviceKey, anonKey);

await adapter.init();

// Core execution logic (adapter-agnostic)
const executor = new TaskExecutor(adapter);
const result = await executor.execute(taskRun, taskCode);
```

### Storage Interface

All storage adapters implement:
- `createTaskRun()` / `getTaskRun()` / `updateTaskRun()` / `queryTaskRuns()`
- `createStackRun()` / `getStackRun()` / `updateStackRun()` / `queryStackRuns()` / `getPendingStackRuns()`
- `storeTaskFunction()` / `getTaskFunction()`
- `setKeystore()` / `getKeystore()` / `deleteKeystore()`

## Service Client

The `ServiceClient` calls wrapped services (gapi, keystore, database, etc):

```javascript
import { ServiceClient } from 'tasker-adaptor-supabase';

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
- `packages/tasker-sequential/supabase/functions/` - Task code
- `packages/tasker-adaptor-supabase/src/` - Adaptor code

Automatically reloads on file changes.

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

### Supabase Backend
```bash
npm run test:supabase
# or in tasker-adaptor-supabase:
npm run test:supabase
```

### SQLite Backend
```bash
npm run test:sqlite
# or in tasker-adaptor-supabase:
npm run test:sqlite
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

### Development
```bash
# SQLite dev (no env vars needed)
DB_PATH=./tasks.db

# Supabase dev
SUPABASE_URL=http://127.0.0.1:54321
SUPABASE_SERVICE_KEY=...
SUPABASE_ANON_KEY=...
```

### Service Client
```bash
SERVICE_CLIENT_TYPE=http
SERVICE_CLIENT_BASE_URL=http://localhost:54321
SERVICE_CLIENT_AUTH_TOKEN=...
```

## File Structure

```
sequential-ecosystem/
├── dev-server.js              # Node.js hot reload server
├── dev-deno.ts                # Deno hot reload server
├── nodemon.json               # Auto-reload configuration
├── package.json               # Root monorepo
├── deno.json                  # Deno configuration
├── packages/
│   ├── sequential-fetch/      # HTTP client
│   ├── sequential-flow/       # Flow state management
│   ├── sdk-http-wrapper/      # SDK wrapper
│   ├── tasker-sequential/     # Task executor (core)
│   └── tasker-adaptor-supabase/   # Storage adaptor (NEW)
│       ├── src/
│       │   ├── adapters/
│       │   │   ├── supabase.js
│       │   │   └── sqlite.js
│       │   ├── core/
│       │   │   ├── storage-adapter.js
│       │   │   ├── service-client.js
│       │   │   ├── task-executor.js
│       │   │   └── stack-processor.js
│       │   └── index.js
│       └── ...
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
import { SQLiteAdapter } from 'tasker-adaptor-supabase';

const adapter = new SQLiteAdapter('./tasks.db');
await adapter.init();
const taskRuns = await adapter.queryTaskRuns({ status: 'pending' });
```

## Next Steps

1. **Integrate with tasker-sequential**
   - Update CLI to use SQLiteAdapter/SupabaseAdapter
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

- SQLite is ideal for development (file-based, no network)
- Supabase is ideal for production (managed, scalable)
- Both backends share identical interface
- Hot reload works seamlessly with both

## Resources

- [tasker-adaptor-supabase README](./packages/tasker-adaptor-supabase/README.md)
- [tasker-sequential docs](./packages/tasker-sequential/CLAUDE.md)
- [sequential-flow docs](./packages/sequential-flow/README.md)
