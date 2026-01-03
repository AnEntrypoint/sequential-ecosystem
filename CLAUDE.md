# Technical Caveats

**MCP Server (Jan 3, 2026)**: Production-ready, fully functional
- Protocol: MCP 2024-11-05, JSON-RPC 2.0 over stdio
- Transport: Direct stdin/stdout handling (no readline wrapper) with request queue for rapid requests
- Startup: Instant (<10ms) with lazy registry loading on first use
- 11 MCP tools: execute_task, execute_flow, execute_tool, list_tasks, list_flows, list_tools, get_execution_history, get_server_status, start_server, stop_server, restart_server
- 9 Resources: 2 tasks + 2 flows + 5 tools discoverable via resources/list
- Registry loading: Lazy on-demand via ensureRegistriesLoaded() to minimize startup latency
- Shutdown: Graceful SIGTERM/SIGINT handlers with queue flushing, exit code 0/1
- Error handling: JSON-RPC error responses with proper codes (-32700 parse, -32601 method not found, -32603 internal)
- Server management: start_server automatically restarts if server already running; restart_server kept for backward compatibility but deprecated
- Response format: start_server includes action field ('start' or 'restart') and wasAlreadyRunning boolean for client clarity

**Architecture (Dec 31, 2025)**: Complete refactoring with:
- Restored core packages: sequential-fetch, sequential-flow, sequential-runner, sequential-adaptor from GitHub
- Library replacements: validation→zod, async-patterns→p-*, id-generator→nanoid, event-emitter→eventemitter3 (saved 700 LOC)
- Unified execution model: UnifiedExecutionService consolidates TaskService/FlowService (saved 239 LOC)
- File-first storage: Removed memory layer (app-storage-sync), direct file operations via storage-unified
- Universal hot reload: Chokidar-based file watcher + registries with automatic reload on changes
- Tool interface: Unified __callHostTool__() available to xstate runner and task code
- 29 focused packages, buildless (100% ES modules), no CommonJS

**File-First Storage**:
- Tasks/Flows/Tools directories are ground truth
- registries: taskRegistry, flowRegistry, toolRegistry load from filesystem
- Dynamic import with cache busting for module reloading
- Storage via storage-unified (atomic writes, path validation)

**Hot Reload System**:
- HotReloadManager orchestrates FileWatcher + all registries
- File changes trigger automatic registry reloads
- Debouncing (300ms) prevents thundering herd
- Enabled by default, disable with HOT_RELOAD=false

**Unified Execution**:
- UnifiedExecutionService handles tasks, flows, tools uniformly
- execute(name, input, {id, timeout, broadcast}) method signature
- Mock execution for unregistered entities
- Execution history tracking with getHistory() and clearHistory()
- createTaskService(), createFlowService(), createToolService() factories

**Tool Invocation**:
- __callHostTool__(category, toolName, input) interface
- Tools register in toolRegistry from JSON definitions
- Same interface for task code, xstate runners, and CLI
- Tool dispatcher validates and executes via toolService

**Validation**: Zod schemas via validation-schemas package, replaces 413 LOC custom validation

**Memory Management**: Server requires `--max-old-space-size=4096` for extended runs.

**Path Validation**: Use `fs.realpathSync()` to prevent symlink/traversal attacks.

**Concurrent File Operations**: Parent directories created atomically via `fs.ensureDir()`.

**Error Responses**: Stack traces never included (security). Only error messages sent to clients.

**Task Names**: Must be kebab-case without spaces. Display names cannot be used for API calls.

**Hot Reload**: ES modules cannot use function declarations at module level. Use const assignments.

**Process Management**: Never use `&` or `run_in_background`. Breaks tool access. Keep servers in foreground.

**Package Resolution**: All `@sequentialos/package` imports refer to local `packages/@sequentialos/package`. Node 18+ required. Cannot use CommonJS `require()` at module level.

**API Response Format**: All endpoints return wrapped: `{success: boolean, data: {...}}`. Clients must unwrap data property.

**Dynamic React Renderer**: Supports config-driven UI via ComponentRegistry singleton pattern with error boundaries.
