# Sequential Ecosystem

Infinite-length task execution with automatic suspend/resume on HTTP calls.

## Patterns

1. **Implicit xstate (Sequential-JS)**: Auto-pause on every `fetch()` - zero config
2. **Explicit xstate (FlowState)**: State graphs for complex workflows
3. **Container (Sequential-OS)**: Content-addressable layers for shell commands and service calls
4. **Sequential Desktop (GUI)**: Full OS environment with debuggers and filesystem access

## Quick Start

```bash
# Full OS GUI (Sequential Desktop)
npx sequential-ecosystem gui
# Access at http://localhost:8003
# Includes: Terminal, Filesystem Debugger, VFS, Zellous

# CLI Task Management
npx sequential-ecosystem init                                   # Initialize with comprehensive examples
npx sequential-ecosystem create-task my-task                    # Create flow task
npx sequential-ecosystem create-task my-task --with-graph      # Create flow task with state graph
npx sequential-ecosystem create-task my-task --runner machine  # Create machine task
npx sequential-ecosystem run my-task --input '{}'

npx sequential-ecosystem run example-simple-flow --input '{"message":"hello"}'
```

## Sequential Desktop (GUI)

Full development environment with content-addressable filesystem:

- **Sequential Terminal** - Complete CLI with layer management
- **Filesystem Debugger** - Visual inspector with history
- **VFS Mountpoints** - `osjs://` (traditional) + `sequential-machine://` (content-addressable)
- **REST API** - `/api/sequential-os/*` for automation
- **Zellous** - WebRTC collaboration (separate service)

See `packages/osjs-webdesktop/GUI_README.md` and `SEQUENTIAL_OS_GUI.md` for details.

## Example Tasks

The `init` command creates comprehensive example tasks demonstrating all features:

- **example-simple-flow**: Basic async operations with `fetch()` auto-pause
- **example-complex-flow**: State machine with retry logic and error handling
- **example-api-integration**: API integration patterns with retry and headers
- **example-batch-processing**: Batch processing with concurrency control

Each example includes:
- Real-world patterns (error handling, retry logic, validation)
- Comprehensive documentation
- Working HTTP calls for testing
- Best practices implementation

See `tasks/EXAMPLES.md` for detailed usage guide.

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
const runner = await createRunner('sequential-js', {});
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
init [--no-examples]                                            # Initialize project with examples (use --no-examples to skip)
create-task <name> [--with-graph] [--runner flow|machine] [--inputs x,y]
run <task> --input '{}' [--save] [--dry-run] [--verbose]
list [-v]
describe <task>
history <task> [--limit n]
show <task> <runId>
delete <task> [--force]
sync-tasks [--adaptor sqlite]
config show|get|set
gui
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
| `sequential-fetch` | Sequential-JS VM (auto-pause on fetch) |
| `sequential-flow` | Sequential-Flow VM (state graphs) |
| `sequential-machine` | Sequential-OS VM (content-addressable layers) |
| `sequential-runner` | Task execution engine |
| `sequential-adaptor-sqlite` | SQLite storage backend |
| `sequential-adaptor-supabase` | Supabase storage backend |
| `sequential-wrapped-services` | Pre-wrapped APIs |

## License

MIT
