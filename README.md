# Sequential Ecosystem

Infinite-length task execution with automatic suspend/resume on HTTP calls.

## Patterns

1. **Implicit xstate (FetchFlow)**: Auto-pause on every `fetch()` - zero config
2. **Explicit xstate (FlowState)**: State graphs for complex workflows
3. **Container (StateKit)**: Content-addressable layers for shell commands

## Quick Start

```bash
npx sequential-ecosystem init
npx sequential-ecosystem create-task my-task
npx sequential-ecosystem run my-task --input '{}'
```

## Structure

```
sequential-ecosystem/
├── cli.js                             # NPX entry point
├── tools/
│   ├── commands/                      # Pluggable CLI commands
│   └── *.js                           # CLI utilities
├── tasks/                             # Default folder storage
└── packages/
    ├── sequential-fetch/              # Implicit xstate VM
    ├── sequential-flow/               # Explicit xstate VM
    ├── sequential-adaptor/            # Plugin registry + adapters
    ├── sequential-adaptor-sqlite/     # SQLite storage
    ├── sequential-adaptor-supabase/   # Supabase storage
    ├── sequential-runner/             # Task execution engine
    └── sequential-wrapped-services/   # Pre-wrapped APIs
```

## Plugin Registry

```javascript
import { register, create, list, createAdapter, createRunner } from 'sequential-adaptor';

register('adapter', 'mydb', (config) => new MyDBAdapter(config));
register('runner', 'custom', (config) => new CustomRunner(config));
register('service', 'alias', () => 'endpoint-name');

const adapter = await createAdapter('folder', { basePath: './tasks' });
const runner = await createRunner('fetch', {});
```

Registry types: `adapter`, `runner`, `service`, `command`, `loader`

## Writing Tasks

### Implicit (80% of tasks)

```javascript
export async function myTask(input) {
  const data = await fetch(`https://api.com/users/${input.userId}`);
  return data.json();
}
```

### Explicit (complex workflows)

```javascript
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
  return await __callHostTool__('database', 'getUsers', {});
}
```

## CLI Commands

```bash
create-task <name> [--with-graph] [--inputs x,y]
run <task> --input '{}' [--save] [--dry-run] [--verbose]
list [-v]
describe <task>
history <task> [--limit n]
show <task> <runId>
delete <task> [--force]
sync-tasks [--adaptor sqlite]
config show|get|set
init
gui [--port 3001] [--desktop]
```

## Storage Backends

```bash
# Folder (default, zero setup)
npx sequential-ecosystem run my-task

# SQLite
export DATABASE_URL="sqlite:./workflow.db"

# Supabase
export SUPABASE_URL="https://project.supabase.co"
export SUPABASE_SERVICE_KEY="your-key"
```

## Packages

| Package | Description |
|---------|-------------|
| `sequential-adaptor` | Plugin registry, storage interface, service client |
| `sequential-fetch` | Implicit xstate VM (auto-pause on fetch) |
| `sequential-flow` | Explicit xstate VM (state graphs) |
| `sequential-runner` | Task execution engine |
| `sequential-adaptor-sqlite` | SQLite storage backend |
| `sequential-adaptor-supabase` | Supabase storage backend |
| `sequential-wrapped-services` | Pre-wrapped APIs |

## License

MIT
