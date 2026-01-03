# Sequential Ecosystem

Infinite-length task execution with automatic suspend/resume and flow/machine runners.

## MCP Tool Usage Only

**IMPORTANT**: This application is managed **exclusively via MCP tools**. CLI commands are forbidden. Use only the MCP execution tools below.

## Available MCP Tools (Primary Interface)

The execution-mcp-server provides 7 consolidated tools. Use these to manage all application lifecycle and operations:

```
start_server()
  - Start desktop-server (auto-restarts if already running)
  - Returns: {success, action: 'start'|'restart', wasAlreadyRunning}

stop_server()
  - Stop desktop-server gracefully via SIGTERM
  - Returns: {success, uptime}

get_server_status()
  - Check desktop-server status and metrics
  - Returns: {isRunning, status, port, pid, uptime, heapUsedMB, rssMB}

get_server_logs(level?, limit?)
  - Fetch captured server logs (auto-clears after retrieval)
  - Level: 'all' | 'stdout' | 'stderr', Limit: number
  - Returns: {logs: [{timestamp, level, message}], count, stats}

list(type: 'task'|'flow'|'tool')
  - List all available tasks, flows, or tools
  - Returns: {type, items: [...], count}

execute(type: 'task'|'flow'|'tool', name, input?, options?)
  - Execute a task, flow, or tool uniformly
  - Options: {id, timeout, broadcast}
  - Returns: {success, type, name, result, executionId, duration}

get_execution_history(entityType: 'task'|'flow', limit?)
  - Retrieve execution history with timing and results
  - Returns: {entityType, history: [...], count, totalCount}
```

## Architecture

**35 Focused Packages** (zero @sequentialos namespace, all in `packages/`)
- Core execution: sequential-runner, sequential-flow, sequential-fetch, sequential-adaptor
- Registries: task-registry, flow-registry, tool-registry
- Storage: storage-unified, atomic-file-operations, file-watcher
- Configuration: core-config, sequential-logging, constants
- Validation: validation-schemas (zod-based)
- Routing: crud-router, dynamic-route-factory, routing
- Error handling: error-handling, response-formatting, core
- UI: dynamic-react-renderer, gui-flow-builder
- Server: execution-mcp-server, desktop-server

**File-First Storage**
- `tasks/` - User-defined task implementations
- `flows/` - User-defined flow configurations
- `tools/` - Tool definitions (JSON)

**Pure ES Modules, Zero Build Step**
- All packages use `"type": "module"`
- No CommonJS, no build step required
- 100% ES module tree-shaking compatible

## Technical Specifications

See `CLAUDE.md` for complete technical caveats and implementation details.

Key facts:
- Desktop server port: 3000 (default)
- Hot reload: Enabled by default (disable via `HOT_RELOAD=false`)
- Memory requirement: `--max-old-space-size=4096` for extended runs
- All packages in `packages/` are linked via npm workspaces
- Pure ES modules (no build step, no CommonJS)
