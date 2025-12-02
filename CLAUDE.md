# Sequential Ecosystem - Quick Reference

## Status
**47 packages** | Grade A architecture | **Last Update**: Dec 2, 2025 | Phase 6 Complete: Sanitization Consolidation ✅

## What It Does
Infinite-length task execution with automatic suspend/resume. **Tasks** pause automatically on HTTP calls or tool invocations (implicit xstate). **Flows** provide visual orchestration to coordinate multiple tasks and tools together into larger structures (explicit xstate). Deployable on Node.js, Deno, or Bun without code changes.

## Architecture
```
Task → Code (implicit/explicit xstate) → Storage → Results
       ↓ (pause on fetch or state change)
       Auto-saved, resume on next call
```

**Two Patterns**:
- **Implicit xstate** (Tasks): Write code normally; pause auto-triggered on `fetch()` or `__callHostTool__()`. Zero state management needed.
- **Explicit xstate** (Flows): Visual state graph coordination that calls tasks and tools together to build larger workflows. Used for orchestrating multiple tasks into bigger structures.

## Package Structure
```
packages/
├── sequential-fetch              # Implicit xstate VM (auto-pause on fetch)
├── sequential-flow               # Explicit xstate VM (state graphs)
├── sequential-runner             # Task executor, NPX entry
├── sequential-adaptor*           # Storage plugins (folder/sqlite/supabase)
├── desktop-server                # API + AppRegistry
├── desktop-shell + app-*         # 10 modular desktop applications
├── @sequential/error-handling    # AppError + error factories
├── @sequential/param-validation  # Validation chains, sanitization
├── @sequential/file-operations   # Atomic file I/O
├── @sequential/websocket-broadcaster  # Real-time subscriptions
├── @sequential/persistent-state  # StateManager with TTL/cleanup
└── @sequential/server-utilities  # Background tasks, cache, logging
```

## Quick Start
```bash
npm install -g sequential-ecosystem
npx sequential-ecosystem create-task my-task
# Edit tasks/my-task/code.js
npx sequential-ecosystem run my-task --input '{}'
npx sequential-ecosystem gui  # Desktop at http://localhost:3001
```

## Critical Constraints

| Constraint | Impact | Solution |
|-----------|--------|----------|
| **File Size** | Keep <200 lines | Split large files immediately |
| **Path Handling** | Use `path.resolve()`, never concatenation | Different behavior: CLI vs programmatic |
| **Database** | One writer per DB path, multiple readers | Each DB exclusive to one process |
| **Vector Dims** | Must match embedder (384 or 768) | Dimension mismatch = bad search results |
| **Memory** | Unbounded Maps cause leaks | Use StateManager with maxSize/TTL |
| **Code Injection** | eval() is unsafe | Use Workers or new Function() with timeout |
| **Path Traversal** | `../` attacks on file operations | Validate with fs.realpathSync() |

## Storage Backends
```javascript
// Default: Folder (zero config)
tasks/task-name/code.js, config.json, runs/run-123.json

// Production: Set DATABASE_URL env var
SQLite:      sqlite://./workflow.db
PostgreSQL:  postgres://host:port/db
Supabase:    Use SUPABASE_URL + SUPABASE_KEY
```

## Core Patterns

**Tasks** (Implicit xstate - write normal code):
```javascript
export async function myTask(input) {
  const data = await fetch(url).then(r => r.json());  // Auto-pauses on HTTP call
  const result = await __callHostTool__('db', 'query', input);  // Auto-pauses on tool call
  return { success: true, data, result };
}
```

**Flows** (Explicit xstate - orchestrate tasks & tools):
```javascript
export const graph = {
  id: 'workflow',
  initial: 'fetchData',
  states: {
    fetchData: { onDone: 'processData' },
    processData: { onDone: 'final', onError: 'handleError' },
    final: { type: 'final' },
    handleError: { type: 'final' }
  }
};

export async function fetchData(input) {
  return await __callHostTool__('task', 'myTask', input);  // Calls task
}

export async function processData(result) {
  return await __callHostTool__('tool', 'transform', result);  // Calls tool
}
```

**File Operations**:
```javascript
// Read/Write with three scopes: run (execution), task (shared), global (cross-task)
await __callHostTool__('writeFile', { path: 'output.json', content, scope: 'run' });
const data = await __callHostTool__('readFile', { path: 'config.json', scope: 'task' });
const list = await __callHostTool__('listFiles', { path: '/', scope: 'auto' });
```

## API Endpoints
```
GET    /api/tasks                      List all tasks
POST   /api/tasks/:taskName/run        Execute task
GET    /api/tasks/:taskName/history    Execution history
GET    /api/flows/:flowId              Flow definition
POST   /api/sequential-os/run          Execute shell command
GET    /api/background-tasks/list      Running CLI tasks
GET    /api/apps                       Registered desktop apps
```

## Environment Variables
```bash
PORT=3000                              # Server port
DATABASE_URL="sqlite://./workflow.db"  # Storage backend
TASK_TIMEOUT=300000                    # Execution timeout (ms)
DEBUG=1                                # Verbose logging
HOT_RELOAD=false                       # Disable file watching
```

## Common Tasks

**Add New Route**:
1. Create `packages/desktop-server/src/routes/myroute.js`
2. Export `registerMyRoutes(app, container)`
3. Import in `server.js`: `registerMyRoutes(app, container)`

**Add New Desktop App**:
1. Create `packages/app-myapp/manifest.json` with app metadata
2. Create `dist/index.html` (self-contained)
3. Add to `AppRegistry` in `server.js`
4. Restart server

**Consolidate Duplicated Code**:
1. Identify duplicates with grep
2. Create new package in `packages/@sequential/`
3. Export centralized functions from `index.js`
4. Update all imports to use centralized version
5. Delete original implementations

## Testing
```bash
npm test                    # Run all tests
npm run test:coverage       # Coverage report
npm run lint                # Code quality
```
Target: 70%+ coverage across all packages.

## Git Workflow
```bash
git add files
git commit -m "type: Brief description

🤖 Generated with Claude Code

Co-Authored-By: Claude <noreply@anthropic.com>"
git push
```
Use conventional commits: fix, feat, refactor, docs, test, chore

## Troubleshooting

| Issue | Cause | Fix |
|-------|-------|-----|
| Task won't run | Syntax error in code.js | Run with `--dry-run --verbose` |
| State not saving | File permissions or disk full | Check `ls -la tasks/` |
| Memory leak | Unbounded Maps in routes | Add StateManager with maxSize |
| HTTP not pausing | Not using fetch() or __callHostTool__() | Use proper pause mechanism |
| Path traversal errors | Symlink or `../` in path | Use `path.resolve()` validation |

## File Naming
All files: **kebab-case** (lowercase with hyphens)
```
✅ my-adapter.js, task-executor.js, error-handler.js
❌ myAdapter.js, taskExecutor.js, errorHandler.js
```
Exceptions: `package.json`, `index.js`, `deno.json`, `.gitignore`

## Design Decisions

**Why two xstate patterns?** Tasks (implicit) for normal code execution; Flows (explicit) for orchestrating multiple tasks & tools into larger structures
**Why folder storage default?** Zero setup, Git-friendly, fast, easy debugging
**Why storage adaptor pattern?** Swap backends without code changes (folder → SQLite → PostgreSQL)
**Why monorepo?** Each package independently versioned and deployable

## Key Files
- **CLAUDE.md** (this file) - Architecture reference
- **TODO.md** - Persistent roadmap (must be cleared before stopping)
- **CHANGELOG.md** - All changes (updated continuously)
- **ENV.md** - Full environment variable reference
- **NAMING-CONVENTIONS.md** - Code naming standards

## Recent Work (Phase 6)
✅ Consolidated sanitization patterns (escapeHtml, sanitizeInput)
✅ Centralized in @sequential/param-validation package
✅ All 16 tests passing with proper array handling
✅ Commit: 59a6f8b
