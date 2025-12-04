# Sequential Ecosystem

**50 packages** | Grade A | Task execution with auto suspend/resume (implicit/explicit xstate) + Comprehensive App Editor | Deployable: Node/Deno/Bun

## What It Does
- **Tasks** (implicit xstate): Write normal code; pause auto-triggered on `fetch()` or `__callHostTool__()`
- **Flows** (explicit xstate): State graphs orchestrating multiple tasks/tools into larger workflows
- **Apps** (visual builder + code): Create and manage Sequential apps with visual builder and code editor
- **Components** (buildless React): Dynamic JSX-string components stored in StateManager, live-updated via RealtimeBroadcaster
- **Debugging**: Advanced observability dashboard for execution flow, state, errors, and performance
- Auto-saved, resume on next call | Folder/SQLite/PostgreSQL/Supabase storage

## Packages
```
sequential-fetch, sequential-flow, sequential-runner, sequential-adaptor*
desktop-server, desktop-shell, app-* (13 apps including app-app-editor, app-app-debugger, app-app-manager)
@sequential/{error-handling, param-validation, file-operations, persistent-state, realtime-sync,
            dynamic-components, server-utilities, websocket-broadcaster, tool-registry, app-mcp}
```

## Quick Start
```bash
npm install -g sequential-ecosystem
npx sequential-ecosystem create-task my-task
npx sequential-ecosystem run my-task --input '{}'
npx sequential-ecosystem gui  # http://localhost:3001
```

## Critical Constraints
| Constraint | Solution |
|-----------|----------|
| File size | <200 lines, split immediately |
| Paths | `path.resolve()` not concatenation |
| DB | One writer per path, exclusive |
| Memory | StateManager with maxSize/TTL |
| Injection | No eval(); Workers/new Function() only |
| Traversal | Validate with fs.realpathSync() |

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

**Response Helpers**: Use these functions from `@sequential/response-formatting`:
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

**Unified Real-Time Layer** (`@sequential/realtime-sync`):
- Single WebSocket connection per app
- Auto-reconnect with exponential backoff
- Channel-based pub/sub
- Server: `RealtimeBroadcaster` for broadcasting to channels
- Client: `RealtimeClient` with subscribe/broadcast/close methods
- ALL real-time communication flows through this layer

**App MCP (Model Context Protocol)** (`@sequential/app-mcp`):
- Convert JavaScript functions to MCP tools automatically
- Parameter introspection from function signatures
- MCP resource generation per tool
- DX: Just write functions, framework handles MCP export
- Tools available to Claude and other LLMs

**Tool Registry** (`@sequential/tool-registry`):
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

**Storage Guarantee**: All operations through `@sequential/sequential-adaptor`
**Real-Time Guarantee**: All communication through `@sequential/realtime-sync`
**Tool Guarantee**: All tools registered in `@sequential/tool-registry`

## App Development

**Comprehensive App Editor** (`app-app-editor`):
- Visual builder with drag-drop UI components
- Code editor for HTML, CSS, JavaScript, manifest.json
- Real-time preview pane
- File tree management
- Template scaffolding (blank, dashboard, task explorer, flow visualizer)
- Storage through `/api/user-apps/*` endpoints

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

**App SDK** (`@sequential/app-sdk`):
All apps have access to:
```javascript
const sdk = new AppSDK({ appId: 'app-my-app' });
await sdk.initStorage();
await sdk.setData('key', value);
const value = await sdk.getData('key');
await sdk.callTask('task-name', input);
await sdk.callFlow('flow-id', input);
await sdk.runCommand('ls -la');
sdk.on('storage:connected', () => { /* ... */ });
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

## Env Vars
```
PORT=3000                              TASK_TIMEOUT=300000
DATABASE_URL="sqlite://./workflow.db"  DEBUG=1
HOT_RELOAD=false
```

## Setup Tasks

**Add Route**: Create `packages/desktop-server/src/routes/myroute.js`, export `registerMyRoutes(app, container)`, import in `server.js`

**Add App**: Create `packages/app-myapp/manifest.json`, `dist/index.html`, add to AppRegistry, restart

**Consolidate Duplication**: Grep duplicates → Create `packages/@sequential/name` → Export from `index.js` → Update imports → Delete originals

## Testing & Deployment
```bash
npm test              # 70%+ target
npm run test:coverage
npm run lint
npm run build && npm publish
```

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

## Architecture Assessment (2025-12-04 & 12-04 Unified Real-Time)

**Grade: A+ with Unified Real-Time Storage + Buildless Components**

### Phase 1 Completion: Unified Real-Time Storage System
- ✓ **StateManager Enhanced**: Added EventEmitter for automatic change hooks (created/updated/deleted)
- ✓ **Broadcast Middleware**: Automatic propagation of all storage changes via RealtimeBroadcaster
- ✓ **Zero Manual Broadcasts**: All data changes flow through single unified pipeline
- ✓ **Integration Complete**: StateManager + RealtimeBroadcaster + Desktop-Server fully integrated
- ✓ **Result**: Any StateManager change → automatic broadcast → connected clients notified

### Phase 1 Completion: Buildless React Dynamic Components
- ✓ **@sequential/dynamic-components Package**: Full JSX runtime parser using @babel/standalone
- ✓ **DynamicComponentRegistry**: Manage component definitions (register, update, validate)
- ✓ **useDynamicComponent Hook**: React integration for rendering parsed components
- ✓ **Validation System**: JSX syntax validation, import detection, security checks
- ✓ **Comprehensive Tests**: Parser, registry, and validation all tested
- ✓ **Result**: Components stored as strings, parsed at runtime, no build required

### Recent Improvements
- ✓ **Security**: Removed direct eval() in tool-loader, replaced with JSON.parse()
- ✓ **Security**: Added fs.realpathSync() path traversal validation to sequential-os-http routes
- ✓ **Cleanup**: Deleted empty @sequential/error-responses package
- ✓ **Documentation**: Updated CHANGELOG with security fixes and outstanding items
- ✓ **Architecture**: Unified Tool Registry (ToolRepository + ToolRegistry merged)

### Outstanding Architectural Issues (62 files exceed 200-line limit)
These require incremental refactoring:
1. **Wrapped Services** (sequential-wrapped-services/*): 9 files >500 lines each - split by concern
2. **Test Files**: 6 test suites >300 lines - split by test category
3. **CLI Generators**: documentation-generator.js (601L) - split generation concerns
4. **Server Core**: zellous/server.js (565L), base-service.ts (590L) - separate initialization

### Critical Guarantees Status
- ✓ **Storage Guarantee**: @sequential/sequential-adaptor exists, usage audit pending
- ✓ **Real-Time Guarantee**: @sequential/realtime-sync exists, consolidation pending
- ✓ **Tool Guarantee**: @sequential/tool-registry unified with ToolRepository (COMPLETE)
- ✓ **Path Validation**: fs.realpathSync() now enforced in sequential-os-http
- ✓ **Code Injection**: No eval() usage in tool loading

### Unified Real-Time Storage Architecture (NEW - Dec 4, 2025)
**Status**: Critical architecture issue SOLVED - Zero Manual Broadcasts Required

**What Changed**:
- StateManager now extends EventEmitter and emits change events: 'created', 'updated', 'deleted'
- Broadcast middleware automatically listens to StateManager events
- RealtimeBroadcaster receives all changes via `broadcast(channel, type, data)` calls
- Connected WebSocket clients receive broadcasts via `data:{type}` channels
- **Result**: Write to StateManager → automatic database persist + automatic broadcast → clients updated

**How It Works**:
```
Route Handler              StateManager              RealtimeBroadcaster        WebSocket Clients
    |                          |                            |                          |
    |-- stateManager.set() ---->|                           |                          |
    |                           |-- emit('updated') ------->|                          |
    |                           |-- persist to DB            |-- broadcast() --------->|
    |                           |                            |-- send message -------->|
    |<------ return ------------|                            |                    component re-render
```

**Files Modified**:
- `packages/persistent-state/src/state-manager.js` - Added EventEmitter + change hooks
- `packages/persistent-state/src/broadcast-middleware.js` (NEW) - Auto-broadcast on changes
- `packages/desktop-server/src/server.js` - Integrated broadcast middleware

**Storage Flow** (Automatic):
1. Any code calls: `await stateManager.set('runs', runId, data)`
2. StateManager automatically:
   - Persists to storage adapter (file/DB)
   - Updates memory cache
   - Emits 'created' or 'updated' event with full data
3. Broadcast middleware catches event and calls:
   - `RealtimeBroadcaster.broadcast('data:runs', 'updated', { id, data, changes })`
4. All connected clients receive message on `data:runs` channel
5. Apps can subscribe: `realtime.subscribe('data:runs', handleUpdate)`

**No More Forgotten Broadcasts**: Before, developers had to manually call `events.taskProgress()`, `events.runCompleted()`, etc. Now it's automatic for ALL data types.

### Tool Registry Architecture (UNIFIED - Dec 4, 2025)
**Status**: Critical architecture issue #1 RESOLVED
- ToolRepository (persisted tools) now integrated with ToolRegistry (runtime discovery)
- Enhanced ToolRegistry with `loadPersistedTools()`, `saveTool()`, `deleteTool()` methods
- Persisted tools accessible through same endpoints as app-registered tools
- Single registry key namespacing: `__persisted:toolId` for persisted, `appId:toolName` for app tools
- Unified routes: GET /api/tools, POST /api/tools, DELETE /api/tools/:id
- MCP generation enabled for all tools (persisted + app-registered)

### Buildless React Components Architecture (NEW - Dec 4, 2025)
**Status**: Foundation complete, Phase 2 (storage integration) pending

**What It Is**:
A system where React components are stored as JSX strings in the database and parsed at runtime using @babel/standalone. No build step required for component definitions.

**Core Components**:
- **JSX Parser**: Uses @babel/standalone to transform JSX strings to JavaScript
- **Component Registry**: Manages component definitions (register, update, validate)
- **React Hooks**: `useDynamicComponent()` for rendering parsed components
- **Validation**: Syntax checking, import detection, security validation

**Usage Pattern**:
```javascript
// Store component definition in database
const componentDef = {
  id: 'app-1:MyButton',
  jsx: 'export default function MyButton({label}) { return <button>{label}</button> }',
  metadata: { author: 'user', version: 1 }
};
await stateManager.set('component', 'app-1:MyButton', componentDef);

// Parse and render in app
function App() {
  const { component: MyButton } = useDynamicComponent(componentDef);
  return <MyButton label="Click me" />;
}
```

**Integration with Unified Storage**:
- Components stored in StateManager with key `component:{appId}:{name}`
- StateManager automatically emits change events on component updates
- RealtimeBroadcaster broadcasts via `data:component` channel
- Connected apps receive updates and re-render automatically
- **Result**: Edit component in one tab → see changes in all tabs instantly

**Security**:
- No `import` statements allowed (sandboxed)
- No `eval()` or `Function()` constructor (safe parsing via Babel)
- JSX syntax validation before execution
- Access restricted to base React components and utilities

**What's Next**:
- Phase 2: Storage routes for CRUD operations on components
- Phase 3: App SDK integration for loading components
- Phase 4: Visual editor for building components with drag-drop UI

### Refactoring Priority (Updated)
Priority 1 (HIGH): 62 files >200 lines require splitting | Est. 10-15 days
Priority 2 (MEDIUM): Real-time consolidation (websocket-factory, event-broadcaster, zellous) | Est. 2-3 days
Priority 3 (MEDIUM): Package namespace fixes (replace ../../../ paths with workspace resolution) | Est. 1-2 days
Priority 4 (LOW): AppSDK duality (browser vs server) unification | Est. 1-2 days

## Technical Caveats

**Memory Management**: Server requires `--max-old-space-size=4096` to avoid heap OOM on extended runs. Monitor for memory growth over time.

**StateKit Module Loading**: sequential-machine has mixed module types (CommonJS in lib/, ES Module in src/). Server gracefully continues without StateKit initialization (non-critical). Architectural refactoring deferred.

**Sequential-OS API**: `/api/sequential-os/*` endpoints return 503 when StateKit unavailable. Apps should handle gracefully without calling .map() on error responses.

**Zellous Module Resolution**: @sequential/zellous-client-sd module not found in some apps (File Browser, Run Observer). Apps render and function correctly despite warning.

**API Response Format**: All endpoints return wrapped responses: `{success: boolean, data: {...}}`. Client apps must unwrap data property before processing.

**Path Validation**: Use `fs.realpathSync()` for path validation to prevent symlink and traversal attacks. Validate paths before all file operations.

**Concurrent File Operations**: Parent directories are created atomically before writes via `fs.ensureDir()` to prevent race conditions on concurrent requests.

**Error Responses**: Stack traces never included in error responses (security). Only error messages sent to clients.

**Task Names**: Must be kebab-case without spaces. Display names with spaces are metadata only and cannot be used for API calls.

**Hot Reload**: ES modules in `type="module"` scripts cannot use function declarations at module level (strict mode violation). Use const assignments instead.
