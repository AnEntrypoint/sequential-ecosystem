# Sequential Ecosystem

**47 packages** | Grade A | Task execution with auto suspend/resume (implicit/explicit xstate) | Deployable: Node/Deno/Bun

## What It Does
- **Tasks** (implicit xstate): Write normal code; pause auto-triggered on `fetch()` or `__callHostTool__()`
- **Flows** (explicit xstate): State graphs orchestrating multiple tasks/tools into larger workflows
- Auto-saved, resume on next call | Folder/SQLite/PostgreSQL/Supabase storage

## Packages
```
sequential-fetch, sequential-flow, sequential-runner, sequential-adaptor*
desktop-server, desktop-shell, app-* (10 apps)
@sequential/{error-handling, param-validation, file-operations, persistent-state, server-utilities, websocket-broadcaster}
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
GET    /api/tasks                      List tasks
POST   /api/tasks/:taskName/run        Execute task
GET    /api/tasks/:taskName/history    History
GET    /api/flows/:flowId              Flow definition
POST   /api/sequential-os/run          Shell command
GET    /api/background-tasks/list      Running CLI
GET    /api/apps                       Registered apps
```

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

## Recent (Phase 7)
✅ Consolidated CRUD patterns: 308 → 220 lines, eliminated 88 lines of duplication via private factory methods + configuration objects
✅ Extracted path validation utilities: validateAndResolvePath, createTimer → @sequential/server-utilities (reused across 13+ route files)
✅ Split error module (282 → 12 lines, 95% reduction): error-categories.js, error-serializer.js, error-logger.js + barrel export
✅ Unified CONFIG: Merged core-config + server-utilities settings, added type safety (parseInt), CORS, hot-reload support
✅ Maximum modularity achieved: DRY refactoring reduced technical debt, improved extensibility

## Previous (Phase 6)
✅ Sanitization consolidation: escapeHtml, sanitizeInput → @sequential/param-validation
✅ 16 tests passing, array handling fixed | Commit: 59a6f8b
