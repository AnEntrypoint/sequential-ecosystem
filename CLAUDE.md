# Technical Caveats

**Final Production Hardening (Jan 2, 2026)**:
- MCP server: Anthropic SDK stdio transport with graceful shutdown handlers (SIGINT, SIGTERM, uncaughtException, unhandledRejection)
- Registry loading: All registries load in parallel via Promise.all to prevent race conditions
- Error handling: All errors are thrown at boundaries (anthropic-server.js CallToolRequestSchema), caught by MCP framework
- Memory: Stable at 65-69 MB with automatic GC at >80% heap usage
- 11 MCP tools: execute_task, execute_flow, execute_tool, list_tasks, list_flows, list_tools, get_execution_history, get_server_status, start_server, stop_server, restart_server
- 9 Resources: 2 tasks + 2 production flows + 5 tools
- Cleaned: Removed all test/demo files, test flows, implementation documentation, demo tools
- Desktop server: Loads 2 tasks + 2 flows + 5 tools on startup via taskRegistry.loadAll() + flowRegistry.loadAll() + toolRegistry.loadAll()
- Port: Always use PORT=8003 NODE_OPTIONS='--max-old-space-size=4096' for desktop-server startup

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
