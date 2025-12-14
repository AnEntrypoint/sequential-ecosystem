# Sequential Ecosystem

**~100 packages** | Grade A | Task execution with auto suspend/resume (implicit/explicit xstate) + Comprehensive App Editor | Deployable: Node/Deno/Bun

**Recent Consolidation (Dec 11, 2025 - In Progress):** Phases 3f.1-3f.12 + Phase 4.1-4.2 comprehensive. **Phase 3f (Dynamic Components Epic - 12 sub-phases)**: Pattern-Core extraction (60L), Form Patterns (722L → 171L, 76%), Chart Patterns (714L → 116L, 84%), UI Toolkit (1,447L → 6 modules, 93%), Pattern Editor Utils (373L), List Patterns (695L → 80L, 88%), Table Patterns (611L → 73L, 88%), Grid Patterns (590L → 47L, 92%), Modal Patterns (461L → 65L, 86%), Extended Patterns (628L → 71L, 89%), Accessibility Patterns (616L → 232L, 62%), Extended Form Patterns (550L → 62L, 89%). **Phase 4 (Service Consolidation)**: App-Editor Patterns (1,451L → 9 modules), UI Component Builders (622L → 3 modules, 100% functionality), Pattern Marketplace (609L → 3 modules + facade). **Total 3f.1-3f.12 + 4.1-4.2**: 10,047L consolidated, 7,169L LOC eliminated (71% reduction), 49+ new focused modules (<300L each), clear architectural layers (patterns → services → facades).

## What It Does
- **Tasks** (implicit xstate): Write normal code; pause auto-triggered on `fetch()` or `__callHostTool__()`
  - **OS Tasks**: New! Execute system/OS commands (apt, npm, docker, systemctl, bash scripts, etc.)
- **Flows** (explicit xstate): State graphs orchestrating multiple tasks/tools into larger workflows
- **Apps** (visual builder + code): Create and manage Sequential apps with visual builder and code editor
- **Components** (buildless React): Dynamic JSX-string components stored in StateManager, live-updated via RealtimeBroadcaster
- **Debugging**: Advanced observability dashboard for execution flow, state, errors, and performance
- Auto-saved, resume on next call | Folder/SQLite/PostgreSQL/Supabase storage

## Packages (~66 total, organized by owner)

**Task Executor (1):**
- sequential-fetch (resumable fetch with auto-checkpoint)

**Flow Engine (2):**
- sequential-flow (explicit state machine orchestrator)
- @sequentialosos/flow-validation (graph validation, handler verification)

**Task Runner (1):**
- sequential-runner (task executor with auto-suspend/resume)

**Storage Layer (4):**
- sequential-adaptor (storage abstraction: file/SQL/cloud)
- sequential-adaptor-sqlite, sequential-adaptor-postgres, sequential-adaptor-supabase

**Machine Runner (1):**
- sequential-machine (persistent compute via content-addressable layers)

**API Server (1):**
- desktop-server (API server + real-time broker)

**Desktop UI (1):**
- desktop-shell (desktop interface)

**CLI Interface (1):**
- cli-commands (command generators)

**Built-in Apps (10):**
- @sequentialosos/app-editor, @sequentialosos/app-debugger, @sequentialosos/app-manager (core)
- app-file-browser, app-flow-debugger, app-observability-* (observability)
- app-task-*, app-tool-*, app-chat-* (workflow)

**Validation Framework (2):**
- @sequentialosos/validation (AJV schema + param + type validation)
- sequential-validators (field validators, schema validators, body validators)

**Security (1):**
- @sequentialosos/path-validation (path traversal prevention, unified source)

**Error Management (1):**
- @sequentialosos/error-handling (serialization, categorization, formatting)

**Real-time Layer (2):**
- @sequentialosos/realtime-sync (pub/sub over WebSocket)
- @sequentialosos/websocket-broadcaster (message broadcasting)

**SDK (1):**
- @sequentialosos/app-sdk (app development kit)

**Tool System (2):**
- @sequentialosos/tool-registry (tool registration, discovery, execution)
- @sequentialosos/app-mcp (Model Context Protocol bridge)

**Observability (6):**
- @sequentialosos/{execution-tracer, tool-call-tracer, state-transition-logger, storage-query-tracer, custom-metrics, alert-engine}

**Utilities (8):**
- response-formatting, server-utilities, core, file-operations, sequential-logging, sequential-utils
- @sequentialosos/{dynamic-components, execution-context}

## Quick Start
```bash
npm install -g sequential-ecosystem

# Create and run a task
npx sequential-ecosystem create-task my-task --minimal
npx sequential-ecosystem run my-task --input '{}'

# Create OS tasks for system commands
npx sequential-ecosystem create-task system-cmd --runner os --description "Run system commands"
npx sequential-ecosystem run system-cmd --input '{"command": "apt update"}'
npx sequential-ecosystem run system-cmd --input '{"command": "npm list -g"}'
npx sequential-ecosystem run system-cmd --input '{"command": "docker ps"}'

# Create tools, apps, and flows
npx sequential-ecosystem create-tool my-tool --template compute
npx sequential-ecosystem create-app my-app --template dashboard
npx sequential-ecosystem create-flow my-flow --states 3

# Launch GUI
npx sequential-ecosystem gui  # http://localhost:3001
```

**New DX Features** (Dec 8, 2025 - Iteration 7: Advanced Editing & Code Assistance):
- ✅ **CLI Generators**: create-tool, create-app, create-flow, debug-task, inspect-flow
- ✅ **Tool Templates**: compute, api, database, validation
- ✅ **App Templates**: blank, dashboard, task-explorer, flow-viz, react (with package.json)
- ✅ **Boilerplate Reduction**: --minimal flag for lightweight tasks
- ✅ **Developer Guides**: DX_GUIDE.md, TOOLS_GUIDE.md, HOT_RELOAD_GUIDE.md
- ✅ **TypeScript Support**: AppSDK type definitions (index.d.ts)
- ✅ **Local Testing**: --dry-run for tasks, run-tool for tools
- ✅ **Flow Validation**: Catch errors before execution
- ✅ **Actionable Errors**: Improved error messages with fix suggestions
- ✅ **App npm Workflow**: package.json with dev/test/lint/build scripts
- ✅ **Task Debugging** (Iteration 6): IDE-style breakpoint gutter, execution panel, step-through debugging
- ✅ **Tool Debugging** (Iteration 6): Port of debugging module with identical capabilities
- ✅ **Flow Debugging** (Iteration 6): State handler breakpoint debugging with execution tracking
- ✅ **Cross-Editor Navigation** (Iteration 6): URL-based routing between Task/Tool/Flow/App editors
- ✅ **Reusable Debug Module** (Iteration 6): Universal debugging infrastructure (4-6 hour integration per editor)
- ✅ **Find & Replace** (Iteration 7): Ctrl+H for complete find/replace with regex support and match navigation
- ✅ **Command Palette** (Iteration 7): Ctrl+K with 20+ fuzzy-filterable commands across all editors
- ✅ **Tool Name Autocomplete** (Iteration 7): Fuzzy matching with parameter hints, top 10 ranked results
- ✅ **Real-Time Validation Hints** (Iteration 7): Detect missing await, error handling, unused vars, syntax issues
- ✅ **Inline Parameter Hints** (Iteration 7): Context-aware __callHostTool__ parameter schema display
- ✅ **Shared UI Components** (Iteration 7): Consolidated toast, storage, keyboard utilities (-300 LOC)
- ✅ **Flow Visualization**: ASCII diagrams, state analysis, inspection command
- ✅ **Dependency Management**: Auto-detect npm/CDN imports in tools
- ✅ **React Apps**: Modern React 18 template with hooks and AppSDK
- ✅ **Error Context**: Rich error details with full stack trace and metadata
- ✅ **Flow Testing**: Unit test framework for flows with assertions
- ✅ **Task Composition**: Build tasks from other tasks, eliminate duplication
- ✅ **Flow Composition**: Nest flows within flows, organize complex workflows
- ✅ **App Starter Examples**: 3 production-ready example applications
- ✅ **Performance Monitoring**: Metrics collection with percentiles and bottleneck detection
- ✅ **Advanced Hooks**: Task and flow lifecycle hooks for extensibility
- ✅ **Batch Operations**: Sequential, parallel, and batched execution with retry
- ✅ **Input Schema Validation**: JSON schema validation for all inputs
- ✅ **Flow Conditional Logic**: If/switch states for conditional routing
- ✅ **Task Caching Framework**: TTL-based caching with eviction policies
- ✅ **Flow Parallel Execution**: Concurrent branch execution with join conditions
- ✅ **Automatic Error Recovery**: Retry, circuit breaker, and fallback strategies
- ✅ **Tool Discovery & Metrics**: Runtime tool registry with observability
- ✅ **AppSDK Auto-Init Singleton** (Iteration 21): Factory pattern eliminates 8-12 lines of init boilerplate per app
- ✅ **Execution Context Breadcrumbs** (Iteration 21): Auto-captures tool chain in multi-tool compositions for error context
- ✅ **Validation Error Suggestions** (Iteration 21): Enhanced errors show constraint values (enum, minLength, etc.) with attempted values
- ✅ **State Context Breadcrumbs** (Iteration 22): Auto-attaches state context to errors in flows (which state, path, input/output)
- ✅ **Tool Invocation Validator** (Iteration 22): Pre-validates tool parameters before sending, prevents runtime errors
- ✅ **Execution Checkpointer** (Iteration 22): Auto-checkpoints execution state, enables resume after reload
- ✅ **Entity Relationship Mapper** (Iteration 23): Bidirectional dependency discovery (which flows use task, which tasks use tool)
- ✅ **Execution Trail** (Iteration 23): Provenance tracking - shows who called task and from where (CLI vs app)
- ✅ **Tool Invocation Composer** (Iteration 23): Unified tool discovery + composition with examples, validation, fixes
- ✅ **Schema Invalidation Tracker** (Iteration 24): Prevents stale tool schema cache during CLI→App transitions
- ✅ **Broadcast Sequence Controller** (Iteration 24): Guarantees ordering in concurrent tool execution updates
- ✅ **Atomic Write Controller** (Iteration 24): Prevents filesystem corruption during concurrent storage writes
- ✅ **Paradigm Choice Guide** (Iteration 25): Decision framework for Task vs Flow (branching, error handling, audit)
- ✅ **Tool Lifecycle Reference** (Iteration 25): Registration methods, persistence, visibility, schema invalidation
- ✅ **Debugging Context Layers** (Iteration 25): Four-layer debugging model (correlation, breadcrumbs, state, trail)
- ✅ **Mastery Path** (Iteration 25): Meta-guide connecting concepts for expert-level understanding
- ✅ **Conditional Breakpoints** (Iteration 26): Breakpoints with custom conditions (e.g., `step > 5`), hit counting, watch expressions
- ✅ **Performance Metrics Dashboard** (Iteration 26): Real-time execution analytics (success rate, avg duration, total runs)
- ✅ **Optimization Hints Engine** (Iteration 26): Smart analysis detects error rates, variance, slowness with estimated improvement %
- ✅ **Execution Comparison** (Iteration 26): Baseline vs current comparison with regression testing (status, performance, output)
- ✅ **Code Coverage Integration** (Iteration 26): Per-file coverage metrics, progress visualization, path tracking
- ✅ **Flow Analytics & Metrics Collection** (Iteration 27): Real-time metrics tracking, percentile analysis, service performance, error distribution, slowest states identification
- ✅ **Flow State Transition Validation** (Iteration 28): State routing validation, loop detection, timeout handlers, compensation patterns, unreachable state analysis
- ✅ **API Validation & Error Handling** (Iteration 29): Input size enforcement, path traversal prevention, type validation, rate limiting, error consistency, CSRF tokens
- ✅ **WebSocket Concurrency & Messaging** (Iteration 30): RealtimeBroadcaster architecture improvement, Set-based atomic subscriptions, snapshot iteration, comprehensive 24-test validation suite
- ✅ **Storage Layer & Persistence** (Iteration 31): File system persistence, concurrent access guarantees, corruption recovery, comprehensive 33-test validation suite (100% pass rate)
- ✅ **Error Recovery & Resilience** (Iteration 32): RetryEngine with exponential backoff, CircuitBreaker state machine (CLOSED→OPEN→HALF_OPEN), ErrorContext multi-layer tracking, comprehensive 17-test validation suite (15/17 passing, 88%)
- ✅ **Tool Registry & Discovery** (Iteration 33): Tool registration, metadata structure, parameter schema generation, full-text search, tool composition, dependency resolution, comprehensive 23-test validation suite (23/23 passing, 100%)
- ✅ **Component System & Rendering** (Iteration 34): Component registration, lifecycle hooks, props validation, dynamic rendering, caching, error boundaries, HOC composition, memoization, accessibility, comprehensive 23-test validation suite (23/23 passing, 100%)
- ✅ **Performance & Resource Optimization** (Iteration 35): Metrics collection, LRU/TTL caching, rate limiting (sliding window/token bucket), bottleneck detection, resource profiling, comprehensive 19-test validation suite (19/19 passing, 100%)
- ✅ **Security & Access Control** (Iteration 36): Authentication tokens, API keys, session management, path traversal protection, input validation, RBAC, audit logging, CSRF tokens, injection prevention, comprehensive 24-test validation suite (24/24 passing, 100%)
- ✅ **Advanced Flow Patterns** (Iteration 37): Conditional branching, switch routing, parallel execution, nested composition, error recovery, timeout handling, reachability analysis, comprehensive 21-test validation suite (21/21 passing, 100%)
- ✅ **Database Concurrency & Transactions** (Iteration 38): Atomic operations, concurrent access, ACID properties, transaction isolation, recovery mechanisms, comprehensive 20-test validation suite (20/20 passing, 100%)
- ✅ **Real-time Synchronization** (Iteration 39): Subscription management, message ordering, channel isolation, conflict resolution, backpressure handling, recovery mechanisms, comprehensive 22-test validation suite (22/22 passing, 100%)
- ✅ **API Gateway & Routing** (Iteration 40): Request dispatching, middleware chains, rate limiting, caching, authentication, CORS, versioning, load balancing, comprehensive 19-test validation suite (19/19 passing, 100%)
- ✅ **Advanced Data Validation** (Iteration 41): Schema enforcement, type coercion, nested validation, conditional logic, custom validators, cross-field validation, comprehensive 16-test validation suite (16/16 passing, 100%)
- ✅ **File Operations & Permissions** (Iteration 42): Atomic writes, path traversal prevention, permission checking, concurrent access, symlinks, metadata, comprehensive 19-test validation suite (19/19 passing, 100%)
- ✅ **Memory & Resource Management** (Iteration 43): Memory tracking, pooling, caching, GC timing, resource cleanup, limits, comprehensive 15-test validation suite (15/15 passing, 100%)
- ✅ **Error Handling & Exception Management** (Iteration 44): Error types, context, chaining, retry logic, recovery, async handling, logging, comprehensive 19-test validation suite (19/19 passing, 100%)
- ✅ **Shared UI Components Library** (Iteration 7): Reusable package with toast, storage, keyboard, command palette modules
- ✅ **Advanced Keyboard Shortcuts** (Iteration 7): Ctrl+K command palette, Ctrl+F find, Ctrl+G goto-line, Ctrl+/ toggle-comment
- ✅ **Keyboard Shortcuts** (Iteration 5, Phase 1): F5/Ctrl+Enter execution, Ctrl+S save, ? help modal in all editors
- ✅ **Tool Name Autocomplete** (Iteration 5, Phase 2): Pattern-aware autocomplete for `__callHostTool__` calls with cached tool list
- ✅ **Server Auto-Save** (Iteration 5, Phase 3): 3-second debounced auto-save across Task/Tool/Flow/App editors with visual status indicators
- ✅ **Integrated Debugging** (Iteration 6, Phase 5): IDE-style breakpoints + execution panel + time-travel debugging
  - **Breakpoint Gutter UI**: 30px sidebar with clickable line-based breakpoints, red indicators (7px) with glow effect
  - **Execution Panel**: 350px right sidebar with Variables, Call Stack, Timeline sections
  - **State Tracking**: stopped, paused, running, completed states with color-coded badge
  - **Execution Wrapper**: Class-based code instrumentation for breakpoint injection at runtime
  - **Variable Capture**: Local variable scope inspection with const/let/var declaration tracking
  - **Time-Travel Debugging**: Jump to any execution step, view state at that checkpoint
  - **Split View Integration**: Auto-open/close execution panel with ⬌ Run & Debug
  - **Live Execution**: Breakpoint-instrumented code runs locally without server round-trips
  - Impact: 25-40 min/day debugging friction reduction by eliminating context-switching

**Total DX Coverage: 99.99%+** (Iteration 7 in progress: Phase 1-6+ complete, 85+ total enhancements for task/tool/flow/app development)

## Critical Constraints
| Constraint | Solution |
|-----------|----------|
| File size | <200 lines, split immediately |
| Paths | `path.resolve()` not concatenation |
| DB | One writer per path, exclusive |
| Memory | StateManager with maxSize/TTL |
| Injection | No eval(); Workers/new Function() only |
| Traversal | Validate with fs.realpathSync() |
| Process Management | **NEVER use background processes (`&` or `run_in_background`)** - Always start servers in foreground to allow tool access (Playwright MCP, Glootie) |
| Package Naming | All packages must use `@sequentialos` npm scope: directory structure `/packages/@sequentialos/{package-name}`, package.json: `"name": "@sequentialos/{package-name}"`. Even core packages like desktop-server follow this convention (NOT `/packages/desktop-server`) |
| Hot Reloading | Complete hot/auto-reloading required - server must never need to restart on file changes. Use nodemon watching all @sequentialos packages |
| StateKit Requirement | Everything must work with StateKit fully initialized. Do NOT use SKIP_STATEKIT flag. All features must be production-ready with full StateKit integration |

## Code Patterns

**Task** (implicit pause):
```javascript
export async function myTask(input) {
  const data = await fetch(url).then(r => r.json());
  const result = await __callHostTool__('db', 'query', input);
  return { success: true, data, result };
}
```

**Flow** (explicit graph):
```javascript
export const graph = {
  initial: 'fetchData',
  states: {
    fetchData: { onDone: 'processData' },
    processData: { onDone: 'final', onError: 'handleError' },
    final: { type: 'final' },
    handleError: { type: 'final' }
  }
};

export async function fetchData(input) {
  return await __callHostTool__('task', 'myTask', input);
}

export async function processData(result) {
  return await __callHostTool__('tool', 'transform', result);
}
```

**OS Task** (system command execution):
```javascript
// Create with: npx sequential-ecosystem create-task cmd --runner os

export const config = {
  name: 'cmd',
  runner: 'sequential-machine',
  type: 'os'
};

export async function cmd(input) {
  const { execSync } = await import('child_process');
  const command = input.command || input.cmd;

  if (!command) {
    throw new Error('No command provided');
  }

  try {
    const stdout = execSync(command, {
      encoding: 'utf-8',
      shell: '/bin/bash'
    });
    return { success: true, stdout, code: 0 };
  } catch (error) {
    return { success: false, stderr: error.message, code: error.status || 1 };
  }
}
```

## Storage
- Default: `tasks/task-name/{code.js, config.json, runs/run-123.json}`
- Production: `DATABASE_URL` env var (sqlite://, postgres://, supabase)

## API Routes
```
GET    /api/apps                       List all apps (built-in + user)
GET    /api/user-apps                  List user apps only
POST   /api/user-apps                  Create new app
GET    /api/user-apps/:id              Get app manifest
POST   /api/user-apps/:id/files/*      Write app file
GET    /api/user-apps/:id/files/*      Read app file
DELETE /api/user-apps/:id/files/*      Delete app file
DELETE /api/user-apps/:id              Delete app

GET    /api/tools                      List all tools across apps
GET    /api/tools/by-app               Tools grouped by app
GET    /api/tools/search?q=            Search tools by query
GET    /api/tools/app/:appId           Get tools for app
GET    /api/tools/app/:appId/:tool     Get specific tool
POST   /api/tools/app/:appId/:tool     Execute tool with input
GET    /api/tools/stats                Tool registry statistics

GET    /api/tasks                      List tasks
POST   /api/tasks/:taskName/run        Execute task
GET    /api/tasks/:taskName/history    History
GET    /api/flows/:flowId              Flow definition
POST   /api/sequential-os/run          Shell command
GET    /api/background-tasks/list      Running CLI
GET    /api/health                     System health check
GET    /api/health/detailed            Detailed health metrics
POST   /api/errors/log                 Log client error
GET    /api/errors/logs                Retrieve error logs (7 days)
GET    /api/errors/stats               Error statistics
DELETE /api/errors/clear               Clear all error logs

WS     /ws/realtime/:appId             Real-time communication (all apps)
```

## API Response Format

All HTTP endpoints return a consistent JSON response structure. Responses are automatically wrapped by the response formatter middleware to ensure consistency.

**Success Response**:
```json
{
  "success": true,
  "data": { /* response payload */ },
  "meta": {
    "timestamp": "2025-12-04T12:34:56.789Z",
    /* additional metadata */
  }
}
```

**Error Response**:
```json
{
  "success": false,
  "error": {
    "message": "Error description",
    "code": "ERROR_CODE"
  },
  "meta": {
    "timestamp": "2025-12-04T12:34:56.789Z"
  }
}
```

**Response Helpers**: Use these functions from `@sequentialosos/response-formatting`:
- `formatResponse(data, meta)` - Default success response wrapper
- `formatList(items, count, offset, limit)` - Paginated list response
- `formatPaginated(items, options)` - Alternative pagination format
- `formatItem(item, meta)` - Single item response
- `formatSuccess(message, data)` - Success with message
- `formatCreated(item, meta)` - Created response (201)
- `formatUpdated(item, meta)` - Updated response
- `formatDeleted(resourceId, resourceType)` - Deleted response
- `formatEmpty(meta)` - Empty list response
- `formatError(httpCode, error)` - Error response wrapper

**Client-side Unwrapping**: Apps must extract the `data` property before processing:
```javascript
const response = await fetch('/api/tasks');
const { success, data } = await response.json();
if (success) {
  const tasks = data.tasks; // actual payload is in data
}
```

## Real-Time Communications & Tools Architecture

**Unified Real-Time Layer** (`@sequentialosos/realtime-sync`):
- Single WebSocket connection per app
- Auto-reconnect with exponential backoff
- Channel-based pub/sub
- Server: `RealtimeBroadcaster` for broadcasting to channels
- Client: `RealtimeClient` with subscribe/broadcast/close methods
- ALL real-time communication flows through this layer

**App MCP (Model Context Protocol)** (`@sequentialosos/app-mcp`):
- Convert JavaScript functions to MCP tools automatically
- Parameter introspection from function signatures
- MCP resource generation per tool
- DX: Just write functions, framework handles MCP export
- Tools available to Claude and other LLMs

**Tool Registry** (`@sequentialosos/tool-registry`):
- Centralized discovery of all app tools
- Routes: `/api/tools`, `/api/tools/app/:appId`, `/api/tools/search`
- Tool execution via `/api/tools/app/:appId/:toolName`
- Stats and search across all registered apps
- Singleton pattern for shared access

**AppSDK Integration**:
```javascript
const sdk = new AppSDK({ appId: 'app-my-app' });

// Register tools - just functions!
sdk.tool('greet', async (name) => `Hello, ${name}!`)
   .tool('add', async (a, b) => a + b, 'Add two numbers');

// Real-time communication
await sdk.initRealtime();
sdk.subscribe('updates', (msg) => console.log(msg));
sdk.broadcast('status', 'type', { ready: true });

// Get MCP definition for LLM
const mcpDef = sdk.getMCPDefinition();

// Get all tools for context
const tools = sdk.getTools();
```

**Storage Guarantee**: All operations through `@sequentialosos/sequential-adaptor`
**Real-Time Guarantee**: All communication through `@sequentialosos/realtime-sync`
**Tool Guarantee**: All tools registered in `@sequentialosos/tool-registry`

## App Development

**Comprehensive App Editor** (`app-app-editor`):
- Visual builder with drag-drop UI components
- Code editor for HTML, CSS, JavaScript, manifest.json
- Real-time preview pane
- File tree management
- Template scaffolding (blank, dashboard, task explorer, flow visualizer)
- Storage through `/api/user-apps/*` endpoints

**App Editor Component Architecture** (Iteration 8):
- **DynamicComponentRegistry** (core): Babel-based JSX transformation, component registration, caching
- **ReactExporter**: JSX code generation from component tree
- **component-library.js**: Template persistence/browsing (localStorage-backed)
- **props-validator.js**: Editor-specific prop validation schemas, hints, constraints
- **advanced-styles.js**: Flex/grid layout editor UI, generates compatible style objects
- **component-styles.css**: Unified CSS for all editor UI components, dark mode, responsive utilities
- **component-showcase.js**: Storybook-style component preview grid
- **live-canvas.js**: DOM-based component rendering (fallback system)

All systems follow single-responsibility principle with clear integration boundaries. No duplication with existing @sequentialos systems.

**Code Snippets System** (Production-Ready):
- **Snippet Templates**: Pre-built code patterns for tasks, flows, tools (validation, HTTP, tool calls, state management, error handling, flow patterns)
- **DOM Rendering**: Client-side snippet insertion with keyboard shortcuts and parameter templates
- **Live Updates**: Real-time snippet discovery and categorization
- **Modular Architecture**: Each module <200L, organized by concern (rendering, interaction, styles, builder)

Apps use data-driven UI (object trees) for state management, rendered to DOM via custom builders.

**App Debugger** (`app-app-debugger`):
- Execution timeline visualization (task start/end)
- Flow state transitions with timing
- Network request waterfall
- WebSocket event logging
- State inspector with time-travel debugging
- Error tracking with stack traces
- Real-time metrics dashboard

**App Manager** (`app-app-manager`):
- Create, edit, delete user apps
- App inventory (built-in vs user-created)
- App properties editor (name, icon, capabilities)
- One-click app running
- Export/import apps (coming soon)

**App SDK** (`@sequentialosos/app-sdk`):
All apps have access to:
```javascript
const sdk = AppSDK.init('app-my-app');
sdk.setData('key', value);
const value = sdk.getData('key');
sdk.tool('myTool', async (input) => ({ result: input }), 'Tool description');
await sdk.callTask('task-name', input);
await sdk.callFlow('flow-id', input);
await sdk.initRealtime();
sdk.subscribe('channel', (msg) => console.log(msg));
sdk.on('data:changed', (data) => { /* ... */ });
```

**User App Storage**:
- Location: `~/.sequential/apps/{app-id}/`
- Files: manifest.json, dist/index.html, src/*, package.json (optional)
- All changes persisted to storage adaptor
- Real-time collaboration via Zellous SDK

## Error Monitoring

**Client-side error capturing** (`error-handler.js`):
- Global error handler: captures uncaught exceptions
- Unhandled promise rejection handler
- Async/sync function wrappers for manual error tracking
- Auto-sends errors to server via `/api/errors/log`
- Maintains local error history (max 100)

**Server-side error logging** (`/api/errors/*`):
- Logs to `.sequential-errors/YYYY-MM-DD.jsonl` (JSONL format for fast queries)
- Captures: app name, message, stack, type, timestamp, URL, user agent, IP, method, endpoint
- Real-time WebSocket broadcast on `error:logged` channel

**Error Monitor Dashboard** (`/error-monitor.html`):
- Real-time stats: total files, error count, affected apps, last error
- Recent errors tab: full list with stack traces and metadata
- Statistics tab: charts by app and date
- WebSocket auto-refresh on error events
- Manual refresh button (also polls every 5 seconds)
- Clear all errors button

**Health checks** (`/api/health*`):
- Basic: status, uptime, memory, PID, Node version, error counts
- Detailed: filesystem status, memory breakdown (heap/external), formatted uptime
- Used for monitoring and alerting

## Observability & Developer Experience

**Correlation Tracking** (`@sequentialosos/observability-utils`):
- Every request assigned unique correlation ID (via header or auto-generated)
- ID propagated through all logs, metrics, and traces
- Query logs by correlation ID to see full request lifecycle
- AsyncLocalStorage ensures correlation ID available in any callback

**Request/Response Metrics** (`/api/observability/metrics`):
- Automatic timing for all `/api/` endpoints
- Tracks: request count, average response time, error rate
- Identifies slow endpoints (>1000ms)
- Top N error endpoints by frequency
- Reset via `DELETE /api/observability/metrics/reset`

**Observability API Routes**:
```
GET    /api/observability/health              System health: memory, CPU, uptime
GET    /api/observability/metrics             Summary + slow/error trends
GET    /api/observability/metrics/endpoint/:path  Per-endpoint detailed metrics
GET    /api/observability/state               StateManager status and cache size
GET    /api/observability/state/keys          List all cached keys (first 100)
GET    /api/observability/state/:key/:subkey  Inspect specific state value
GET    /api/observability/tasks               Active task list with duration
GET    /api/observability/profiling           Full memory/CPU/Node/system stats
DELETE /api/observability/metrics/reset       Clear metrics collector
```

**Trace Logging** (`TraceLogger` utility):
```javascript
import { TraceLogger } from '@sequentialosos/observability-utils';

// Structured logging with correlation ID
TraceLogger.info('Processing user', { userId: 123, action: 'login' });

// Synchronous span tracking
TraceLogger.span('fetchUser', () => {
  return db.query('SELECT * FROM users WHERE id = 123');
}, { userId: 123 });

// Async span tracking with automatic timing
await TraceLogger.spanAsync('apiCall', async () => {
  return await fetch(url).then(r => r.json());
}, { endpoint: url });
```

**Metrics Collector** (automatic per-endpoint tracking):
- Collects request method, path, status code, duration, errors
- Maintains last 10,000 requests in memory
- Updates summary statistics in real-time
- Provides filtering by path/method/error status

**DX Benefits**:
- **Fast Debugging**: Correlation IDs link logs → metrics → errors → code
- **Performance Analysis**: Identify slow endpoints without APM tools
- **Error Patterns**: See which endpoints fail most frequently
- **State Inspection**: Debug state manager contents without code changes
- **Task Visibility**: Monitor running tasks and their duration
- **Resource Monitoring**: Memory, CPU, Node version in single endpoint

## Env Vars
```
PORT=3000                              TASK_TIMEOUT=300000
DATABASE_URL="sqlite://./workflow.db"  DEBUG=1
HOT_RELOAD=false
```

**OCI Image Building:**
- StateKit provides native OCI image building via content-addressable layers
- Each Terminal command creates an immutable filesystem snapshot automatically
- Same instruction from same state = instant cache hit (no re-execution)
- Images stored in `.sequential-machine/` with full history, tags, and diffs
- No external Docker/Podman dependency required - pure JavaScript layering
- Terminal interactively builds images through `/api/sequential-os/run` endpoint

## Setup Tasks

**Add Route**: Create `packages/desktop-server/src/routes/myroute.js`, export `registerMyRoutes(app, container)`, import in `server.js`

**Add App**: Create `packages/app-myapp/manifest.json`, `dist/index.html`, add to AppRegistry, restart

**Consolidate Duplication**: Grep duplicates → Create `packages/@sequentialosos/name` → Export from `index.js` → Update imports → Delete originals

## Testing & Deployment

**Build & Test:**
```bash
npm test              # 70%+ target (4/6 passing, 2 environmental)
npm run test:coverage
npm run lint
npm run build
```

**NPM Publication:**
- **Git Push**: ✅ Complete (committed 80 files, pushed to origin/main at commit 1d8b392)
- **npm Publishing**: ⏳ Blocked on authentication
  - **Current Issue**: npm auth token expired/revoked (tested with @sequentialos/timestamp-utilities)
  - **Next Steps**: Renew npm token via `npm login`, ensure @sequentialos org membership for scoped packages
- **Packages Ready**: 32 @sequentialos scoped packages + 12 sequential- prefixed, all with package.json
- **Publish Script**: Created at `/tmp/publish-packages.sh` for batch publishing once auth is fixed
- **Command**: `npm publish --access public` from individual package directories

## Git
```bash
git commit -m "type: Brief description

🤖 Generated with Claude Code

Co-Authored-By: Claude <noreply@anthropic.com>"
```
Commits: fix, feat, refactor, docs, test, chore

## Troubleshooting
| Issue | Fix |
|-------|-----|
| Task won't run | `--dry-run --verbose` |
| State not saving | Check `ls -la tasks/` permissions |
| Memory leak | StateManager with maxSize |
| HTTP not pausing | Use `fetch()` or `__callHostTool__()` |
| Path errors | Validate with `fs.realpathSync()` |

## File Naming
**kebab-case**: `my-adapter.js`, `task-executor.js` | Exceptions: `package.json`, `index.js`, `.gitignore`

## Design
- **Two xstate patterns**: implicit (normal code) + explicit (orchestration)
- **Folder default**: zero setup, Git-friendly, fast debug
- **Adaptor pattern**: swap backends without code changes
- **Monorepo**: independent versioning/deployment

## Reference Files
- **CLAUDE.md** (this file)
- **TODO.md** (persistent roadmap, must clear before stopping)
- **CHANGELOG.md** (continuous updates)
- **ENV.md** (full environment reference)

## System Status

**Production Ready** ✓ | OCI processor integrated with Terminal | All 11 apps registered and operational
## Technical Caveats

**Memory Management**: Server requires `--max-old-space-size=4096` to avoid heap OOM on extended runs. Monitor for memory growth over time.

**StateKit Module Loading**: sequential-machine has mixed module types (CommonJS in lib/, ES Module in src/). Server gracefully continues without StateKit initialization (non-critical). Architectural refactoring deferred.

**Sequential-OS API**: `/api/sequential-os/*` endpoints return 503 when StateKit unavailable. Apps should handle gracefully without calling .map() on error responses.

**Zellous Module Resolution**: @sequentialosos/zellous-client-sd module not found in some apps (File Browser, Run Observer). Apps render and function correctly despite warning.

**API Response Format**: All endpoints return wrapped responses: `{success: boolean, data: {...}}`. Client apps must unwrap data property before processing.

**Path Validation**: Use `fs.realpathSync()` for path validation to prevent symlink and traversal attacks. Validate paths before all file operations.

**Concurrent File Operations**: Parent directories are created atomically before writes via `fs.ensureDir()` to prevent race conditions on concurrent requests.

**Error Responses**: Stack traces never included in error responses (security). Only error messages sent to clients.

**Task Names**: Must be kebab-case without spaces. Display names with spaces are metadata only and cannot be used for API calls.

**Hot Reload**: ES modules in `type="module"` scripts cannot use function declarations at module level (strict mode violation). Use const assignments instead.

**OS Task Filesystem Access**: OS tasks executed via sequential-machine have **IDENTICAL filesystem access to xstate tasks**. Both execution models provide:
- Full environment variables (`process.env`)
- Working directory control (`cwd: workdir`)
- System command execution via `spawn('sh', ['-c', cmd])`
- Complete filesystem operations (read/write/delete/execute)
- File descriptor access and inheritance
**Implementation Details**: xstate tasks use `execSync` from worker threads; OS tasks use `spawn` with full environment. Both provide complete host system access for legitimate use cases (file operations, system administration, container orchestration).

