# Sequential Ecosystem - Comprehensive Architectural Analysis
**Date**: December 1, 2025
**Status**: Week 2 TRANSIT Phase Complete (P2.1-P2.5)
**Scope**: 47 packages, 24,872 lines of code, 388 index.js exports

---

## Executive Summary

The sequential-ecosystem is a well-modularized, enterprise-grade system with **excellent progress on Phase 9 infrastructure extraction**. However, several **architectural debt patterns** have emerged that should be addressed before proceeding with P3.2 (Sequential-OS integration):

### Key Findings
- **7 Critical architectural issues** identified (TRANSIT/RISK severity)
- **4 Quick wins** (1-2 hour fixes, high impact)
- **3 Medium effort improvements** (4-8 hours, addresses duplication)
- **1 Major refactoring** (8-12 hours, enables P3.2 cleanly)

**Recommendation**: Address Quick Wins + Major Refactoring (#7) BEFORE P3.2 to prevent architectural complications.

---

## Issue #1: Storage Observer Anti-Pattern (SAFE → TRANSIT)

**Severity**: MEDIUM
**Impact**: Memory leak risk, no persistence, data loss on restart
**Effort**: 2 hours
**Location**: `/packages/desktop-server/src/routes/storage-observer.js` (149 lines)

### Problem
```javascript
const STORAGE_STATE = {
  runs: new Map(),
  tasks: new Map(),
  flows: new Map(),
  tools: new Map(),
  appState: new Map()
};
```

This in-memory Map **grows unbounded** and is **never persisted**. If the server restarts, all stored state is lost. This violates the system's own data persistence model.

### Current Issues
1. **No persistence**: Data not written to disk/database
2. **Memory leak**: Maps grow indefinitely over server lifetime
3. **Duplicate state**: Desktop-server maintains separate storage parallel to file system
4. **Inconsistent with runs.js**: Runs are loaded from `tasks/*/runs/*.json`, but this observer doesn't read from there

### Recommended Solution (TRANSIT)

**Option A (Quick Fix)**: Make Storage Observer read-only from existing sources
```javascript
// Instead of maintaining separate state, query real sources on demand
export function registerStorageObserverRoutes(app, container) {
  const repository = container.resolve('TaskRepository');

  app.get('/api/storage/status', asyncHandler(async (req, res) => {
    const allTasks = repository.getAll();
    const allRuns = await repository.getAllRuns(); // Load from tasks/*/runs/*.json
    const status = {
      storage: {
        runs: allRuns.length,
        tasks: allTasks.length,
        // ... etc
      }
    };
    res.json(status);
  }));
}
```

**Option B (Proper)**: Integrate with persistent storage adapter
- Use TaskRepository as single source of truth
- Cache results with TTL (already done in runs.js with `getCacheEntry`)
- Remove STORAGE_STATE Map entirely

### Why This Matters
- **P3.2 blocker**: If Sequential-OS integration needs state observation, this becomes architectural debt
- **Reliability**: Server restarts lose monitoring data
- **Complexity**: Two sources of truth (Maps + filesystem) are hard to keep in sync

### Timeline
- Quick fix: 1-2 hours
- Test: 30 minutes
- Proper fix: 3-4 hours

---

## Issue #2: Sequential-OS Route Logic Duplicates Sequential-Machine (TRANSIT)

**Severity**: MEDIUM-HIGH
**Impact**: Duplicate logic for layer management, hard to maintain two versions
**Effort**: 4-6 hours
**Location**: `/packages/desktop-server/src/routes/sequential-os.js` (106 lines) vs `/packages/sequential-machine/lib/*` (8 files, ~1100 lines)

### Problem
The desktop-server routes implement their own version of StateKit functionality:

```javascript
// In desktop-server/src/routes/sequential-os.js
app.post('/api/sequential-os/run', asyncHandler(async (req, res) => {
  const result = await kit.run(instruction);
  res.json(result);
}));

app.get('/api/sequential-os/history', asyncHandler(async (req, res) => {
  const history = await kit.history();
  res.json(history);
}));

app.post('/api/sequential-os/checkout', asyncHandler(async (req, res) => {
  const { ref } = req.body;
  await kit.checkout(ref);
  res.json({ success: true, ref });
}));
```

Meanwhile, sequential-machine implements the actual layer/snapshot logic in `lib/`:
- `lib/index.js` - StateKit orchestration (spawn, run, checkout, tag)
- `lib/snapshot.js` - Layer snapshotting and tarring
- `lib/store.js` - Layer storage and retrieval
- `lib/adapter.js` - Filesystem adapter

### Issues
1. **Duplication**: Both files implement similar "run command → create layer → save state" logic
2. **Inconsistent**: Sequential-machine uses CommonJS, desktop-server uses ES modules
3. **Hard to test**: StateKit interface scattered across two packages
4. **Maintenance burden**: Bug fixes must be made in both places

### Current State
- **sequential-machine**: Pure implementation (no Express routes)
- **desktop-server**: HTTP wrapper around a kit instance

### Recommended Solution (TRANSIT)

**Extract StateKit HTTP Adapter** as new package: `@sequential/sequential-os-http`

```
packages/sequential-os-http/src/
├── index.js              # Exports { registerSequentialOsRoutes }
├── routes.js             # HTTP endpoint definitions
├── adapter.js            # StateKit HTTP wrapper
└── state-kit-client.js   # Client abstraction
```

**New architecture**:
```
sequential-machine (pure lib)
    ↑
    | depends on
    |
sequential-os-http (HTTP routes wrapper)
    ↑
    | imported by
    |
desktop-server (routes registration)
```

**Implementation steps**:
1. Extract `registerSequentialOsRoutes()` into new package
2. Create state-kit-client.js that abstracts kit instance creation/management
3. Update desktop-server to import from new package
4. Run P3.2 Sequential-OS integration cleanly without route duplication

### Why This Matters
- **P3.2 dependency**: Sequential-OS integration needs clean API boundaries
- **Reusability**: Other packages (CLI, alternative servers) can reuse HTTP adapter
- **Testing**: Can test HTTP layer separately from StateKit logic

### Timeline
- Extraction: 2-3 hours
- Testing: 1-2 hours
- Integration: 1 hour

---

## Issue #3: File Operations Split Across Multiple Modules (SAFE → TRANSIT)

**Severity**: MEDIUM
**Impact**: Code duplication, inconsistent error handling, hard to modify patterns
**Effort**: 3-4 hours
**Location**: Multiple route files in `/packages/desktop-server/src/routes/`

### Problem
File operations are fragmented across 4 files with overlapping concerns:

```
file-read-operations.js (81 lines)
  ├── GET /api/files/current-path
  ├── GET /api/files/list
  ├── GET /api/files/read
  └── POST /api/files/save

file-write-operations.js (79 lines)
  ├── POST /api/files/write
  ├── POST /api/files/mkdir
  └── DELETE /api/files

file-transform-operations.js (64 lines)
  ├── POST /api/files/copy
  ├── POST /api/files/move
  └── POST /api/files/zip

file-operations-utils.js (29 lines)
  ├── validateAndResolvePath()
  ├── startTiming()
  ├── getDuration()
  └── handleFileError()
```

**Duplication pattern** (appears 6+ times):
```javascript
const startTime = startTiming();
try {
  const realPath = validateAndResolvePath(filePath);
  // ... operation
  const duration = getDuration(startTime);
  logFileSuccess('operation', filePath, duration, metadata);
  res.json({ ... });
} catch (error) {
  const duration = getDuration(startTime);
  logFileOperation('operation', filePath, error, { duration });
  return handleFileError('operation', filePath, error, res);
}
```

### Issues
1. **Temporal coupling**: startTime → operation → duration all manual
2. **Error handling boilerplate**: Try-catch-timing-logging in every endpoint
3. **Hard to modify**: Adding validation/auth requires touching 6+ places
4. **Cache inconsistency**: Each route needs to understand `getCacheEntry` vs `setCacheEntry`

### Recommended Solution (SAFE)

**Create File Operations Service** wrapping low-level operations:

```javascript
// @sequential/file-operations-service (NEW)
export class FileOperationsService {
  async readFile(filePath, options = {}) {
    return this._wrapOperation('read', async () => {
      const realPath = validateAndResolvePath(filePath);
      const stat = await fs.stat(realPath);
      if (stat.size > CONFIG.files.maxSizeBytes) {
        throw createValidationError(`File too large`, 'file');
      }
      return await fs.readFile(realPath, 'utf8');
    }, { operation: 'read', path: filePath });
  }

  async writeFile(filePath, content, options = {}) {
    return this._wrapOperation('write', async () => {
      const realPath = validateAndResolvePath(filePath);
      await writeFileAtomicString(realPath, content);
      return { path: realPath, size: content.length };
    }, { operation: 'write', path: filePath });
  }

  async _wrapOperation(operationName, fn, metadata) {
    const startTime = Date.now();
    try {
      const result = await fn();
      logFileSuccess(operationName, metadata.path, Date.now() - startTime, result);
      return result;
    } catch (error) {
      logFileOperation(operationName, metadata.path, error, { duration: Date.now() - startTime });
      throw error;
    }
  }
}
```

**New routes**:
```javascript
export function registerFileOperationsRoutes(app, service) {
  app.get('/api/files/read', asyncHandler(async (req, res) => {
    const result = await service.readFile(req.query.path);
    res.json(result);
  }));

  app.post('/api/files/write', asyncHandler(async (req, res) => {
    const result = await service.writeFile(req.body.path, req.body.content);
    res.json(result);
  }));
}
```

**Consolidation**:
- Move all 3 route files → single `file-operations.js` (30 lines)
- Delete redundant `file-read-operations.js`, `file-write-operations.js`, `file-transform-operations.js`
- Keep `file-operations-utils.js` for low-level helpers

### Impact
- **Reduced complexity**: 223 lines → ~80 lines
- **Reusable**: Service can be used by other packages
- **Testable**: Mock FileOperationsService instead of testing Express routes
- **Maintainable**: Timing, logging, error handling in one place

### Timeline
- Service creation: 1.5 hours
- Route consolidation: 1 hour
- Testing: 1.5 hours

---

## Issue #4: Metrics Calculation Scattered & Uncached (SAFE)

**Severity**: LOW-MEDIUM
**Impact**: Performance issue, hard to extend metrics
**Effort**: 2 hours
**Location**: `/packages/desktop-server/src/routes/runs.js` (77 lines)

### Problem
```javascript
export function registerRunsRoutes(app, getActiveTasks) {
  app.get('/api/metrics', asyncHandler(async (req, res) => {
    const allRuns = await getAllRuns(false);  // Read ALL runs from disk every time!
    const durations = allRuns.map(r => r.duration || 0);
    const avgDuration = durations.reduce((a, b) => a + b, 0) / durations.length;
    // ... 30 lines of inline calculation
  }));
}
```

**Issues**:
1. **O(N) every request**: Scans all runs on every `/api/metrics` call
2. **Inline logic**: Metrics calculation mixed with routing
3. **Cache used inconsistently**: `getFromCache`/`setCache` but functions not exported (error)
4. **Hard to extend**: Adding new metrics requires modifying this endpoint

### Recommended Solution (SAFE)

**Extract Metrics Service**:

```javascript
// @sequential/metrics-service (NEW)
export class MetricsService {
  constructor(repository) {
    this.repository = repository;
    this.cache = new Map();
    this.cacheTTL = 60000; // 1 minute
  }

  async calculateMetrics() {
    const cacheKey = 'metrics';
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.cacheTTL) {
      return cached.data;
    }

    const allRuns = await this.repository.getAllRuns();
    const metrics = {
      totalRuns: allRuns.length,
      successful: allRuns.filter(r => r.status === 'success').length,
      failed: allRuns.filter(r => r.status === 'error').length,
      duration: this._calculateDurationMetrics(allRuns)
    };

    this.cache.set(cacheKey, { data: metrics, timestamp: Date.now() });
    return metrics;
  }

  _calculateDurationMetrics(runs) {
    const durations = runs.map(r => r.duration || 0).filter(d => d > 0).sort((a, b) => a - b);
    return {
      average: Math.round(durations.reduce((a, b) => a + b, 0) / durations.length || 0),
      median: durations[Math.floor(durations.length / 2)] || 0,
      min: durations[0] || 0,
      max: durations[durations.length - 1] || 0
    };
  }

  invalidateCache() {
    this.cache.clear();
  }
}
```

**Route becomes**:
```javascript
app.get('/api/metrics', asyncHandler(async (req, res) => {
  const metrics = await metricsService.calculateMetrics();
  res.json(metrics);
}));
```

### Impact
- **Cleaner code**: 77 lines → 40 lines
- **Better performance**: Cached results
- **Testable**: Mock repository, assert calculations
- **Extensible**: Add new metrics without touching routes

### Timeline
- Service creation: 1 hour
- Integration: 30 minutes
- Testing: 30 minutes

---

## Issue #5: Error Response Helper Inconsistency (SAFE)

**Severity**: LOW
**Impact**: API consistency, makes debugging harder
**Effort**: 1 hour
**Location**: Multiple files using `createErrorResponse()` inconsistently

### Problem
Different files call errors differently:

```javascript
// sequential-os.js (undefined function)
return res.status(400).json(createErrorResponse('INVALID_INPUT', 'instruction is required'));

// error-handling.js exports createError() not createErrorResponse()
export { createError, createValidationError, ... }

// routes/tasks.js uses correct pattern
throw createValidationError('Invalid task name', 'taskName');
return res.status(error.httpCode).json({ error: { code: error.code, message: error.message } });
```

### Issues
1. **Undefined function**: `createErrorResponse()` doesn't exist (creates runtime error)
2. **Inconsistent response format**: Some use `{error: {code, message}}`, others use `{code, message}`
3. **Mixed imports**: Some files import from error-handling, others don't

### Recommended Solution

**Standardize error response format** across all routes:

```javascript
// In @sequential/error-handling/src/response-helpers.js (NEW)
export function createErrorResponse(code, message, statusCode = 400) {
  return {
    error: {
      code,
      message,
      timestamp: new Date().toISOString()
    }
  };
}

// Usage (consistent everywhere)
res.status(400).json(createErrorResponse('INVALID_INPUT', 'instruction is required'));
```

**Audit all route files** and replace:
- `createErrorResponse()` → centralized function
- `{code, message}` → `{error: {code, message}}`

### Timeline
- Implement: 30 minutes
- Audit & fix: 30 minutes

---

## Issue #6: Package JSON Missing Dependencies (TRANSIT)

**Severity**: MEDIUM
**Impact**: Runtime errors on import, inconsistent peer dependencies
**Effort**: 1-2 hours
**Location**: Multiple packages missing declared dependencies

### Problem
Per CLAUDE.md (line 1070):
> Dependency Audit Results (Dec 1, 2025): 40 unused dependencies identified, 2 version mismatches

**Example**: sequential-adaptor-sqlite imports `tasker-logging` but it's not in package.json:
```javascript
// sqlite.js
import logger from '@sequential/logging';  // Not declared!

// package.json is missing dependency
```

This will fail on import if the package isn't installed elsewhere.

### Recommended Solution

Run existing dependency cleanup:
```bash
node /path/to/dependency-cleanup.js
```

Per CLAUDE.md (lines 1114-1127), there's an automated cleanup process. Execute it.

### Timeline
- Run audit: 15 minutes
- Review changes: 30 minutes
- Update package-lock: 15 minutes

---

## Issue #7: Multiple In-Memory Singletons Without Lifecycle Management (RISK) ⚠️

**Severity**: HIGH
**Impact**: Memory leaks, hard to test, state bleeding across requests
**Effort**: 8-12 hours (MAJOR REFACTORING)
**Locations**:
- `storage-observer.js`: STORAGE_STATE Map
- `sequential-os.js`: kit instance (passed as parameter, but not managed)
- `tasks.js`: Active task tracking (in container)

### Problem

The system maintains multiple **unbounded in-memory state containers** with no cleanup:

```javascript
// storage-observer.js
const STORAGE_STATE = {
  runs: new Map(),      // ← Grows indefinitely
  tasks: new Map(),     // ← Grows indefinitely
  flows: new Map(),     // ← Grows indefinitely
  tools: new Map(),     // ← Grows indefinitely
  appState: new Map()   // ← Grows indefinitely
};
```

### Issues
1. **No lifecycle**: Maps created at module load, never cleared
2. **No TTL**: Entries stay forever (unless explicitly deleted)
3. **No limits**: Can consume all available memory
4. **Testing nightmare**: Module-level state pollutes between tests
5. **Distributed state**: Real data in files + duplicated in Maps

### Deeper Problem: Architectural Mismatch

The system has **two sources of truth**:

**Truth #1 - Filesystem**:
```
tasks/task-name/runs/run-id.json
tasks/task-name/code.js
tasks/task-name/config.json
```

**Truth #2 - In-Memory Maps**:
```javascript
STORAGE_STATE.runs.set(runId, { ... })
STORAGE_STATE.tasks.set(taskName, { ... })
```

These two aren't kept in sync. The observer polls Maps, but actual task execution writes to files.

### Recommended Solution (RISK → TRANSIT)

**Create Persistent State Manager** with cleanup:

```javascript
// @sequential/persistent-state (NEW)
export class StateManager {
  constructor(storageAdapter, config = {}) {
    this.adapter = storageAdapter;
    this.memoryCache = new Map();
    this.maxCacheSize = config.maxCacheSize || 1000;
    this.cacheTTL = config.cacheTTL || 300000; // 5 minutes
    this.cleanupInterval = config.cleanupInterval || 60000; // 1 minute

    // Periodic cleanup
    this.cleanupTimer = setInterval(() => this._cleanupExpiredEntries(), this.cleanupInterval);
  }

  async get(type, id) {
    const cacheKey = `${type}:${id}`;
    const cached = this.memoryCache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < this.cacheTTL) {
      return cached.data;
    }

    // Fall back to persistent storage
    const data = await this.adapter.get(type, id);
    if (data) {
      this.memoryCache.set(cacheKey, { data, timestamp: Date.now() });
    }
    return data;
  }

  async set(type, id, data) {
    const cacheKey = `${type}:${id}`;

    // Persist immediately
    await this.adapter.set(type, id, data);

    // Update cache
    this.memoryCache.set(cacheKey, { data, timestamp: Date.now() });

    // Enforce cache size limit
    if (this.memoryCache.size > this.maxCacheSize) {
      this._evictOldestEntry();
    }
  }

  _cleanupExpiredEntries() {
    const now = Date.now();
    for (const [key, entry] of this.memoryCache.entries()) {
      if (now - entry.timestamp > this.cacheTTL) {
        this.memoryCache.delete(key);
      }
    }
  }

  _evictOldestEntry() {
    let oldestKey = null;
    let oldestTime = Infinity;

    for (const [key, entry] of this.memoryCache.entries()) {
      if (entry.timestamp < oldestTime) {
        oldestTime = entry.timestamp;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.memoryCache.delete(oldestKey);
    }
  }

  async shutdown() {
    clearInterval(this.cleanupTimer);
    this.memoryCache.clear();
  }
}
```

**Integration into desktop-server**:
```javascript
// server.js
const stateManager = new StateManager(new FileSystemAdapter('./data'), {
  maxCacheSize: 1000,
  cacheTTL: 300000,
  cleanupInterval: 60000
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  await stateManager.shutdown();
  process.exit(0);
});
```

**Update routes** to use StateManager instead of direct Maps:
```javascript
app.get('/api/storage/runs', asyncHandler(async (req, res) => {
  const runs = await stateManager.get('runs', '*'); // '*' = all
  res.json({ runs });
}));
```

### Why This Matters (P3.2 Blocker)
- **Sequential-OS integration** will add more state (layer history, tags, checkouts)
- **Without cleanup**, state will grow without bound
- **Without TTL**, old data stays forever
- **Without persistence**, server restart = data loss

### Timeline
- Design StateManager: 1-2 hours
- Implement: 2-3 hours
- Migrate existing uses: 2-3 hours
- Test & integration: 2 hours
- **Total: 8-12 hours**

---

## Quick Wins (Address First)

### Win #1: Fix createErrorResponse() (15 minutes)
**File**: `/packages/sequential-machine/src/routes/sequential-os.js:15`
**Fix**: Import from @sequential/error-handling and use correct response format
```javascript
// WRONG
return res.status(400).json(createErrorResponse('INVALID_INPUT', 'instruction is required'));

// CORRECT
import { createValidationError } from '@sequential/error-handling';
throw createValidationError('instruction is required', 'instruction');
// Let asyncHandler catch and format
```

### Win #2: Make storage-observer read-only (1 hour)
**File**: `/packages/desktop-server/src/routes/storage-observer.js`
**Change**: Query from TaskRepository instead of maintaining separate Maps
**Benefit**: Eliminates memory leak, ensures consistency with filesystem truth

### Win #3: Verify dependency cleanup ran (30 minutes)
**File**: Run dependency audit
```bash
node packages/tools/dependency-cleanup.js --dry-run
```
**Verify**: 40 unused deps removed, 2 version mismatches fixed

### Win #4: Consolidate file operations routes (2 hours)
**Files**:
- `/packages/desktop-server/src/routes/file-read-operations.js` (81 lines)
- `/packages/desktop-server/src/routes/file-write-operations.js` (79 lines)
- `/packages/desktop-server/src/routes/file-transform-operations.js` (64 lines)

**Change**: Merge into single 30-line route file using FileOperationsService

---

## Dependency Graph Analysis

### Circular Dependencies
✅ **NONE DETECTED** - Good architecture!

### Cross-Package Dependencies (Healthy)
```
desktop-server
  └─ depends on @sequential/error-handling ✓
  └─ depends on @sequential/param-validation ✓
  └─ depends on @sequential/file-operations ✓
  └─ depends on @sequential/core ✓

sequential-runner
  └─ depends on @sequential/core-config ✓
  └─ depends on @sequential/sequential-adaptor ✓

sequential-machine
  └─ depends on @sequential/sequential-flow (peer)
  └─ depends on @sequential/sequential-utils
```

### Problematic Dependencies
```
sequential-adaptor-sqlite
  └─ imports @sequential/logging (NOT DECLARED) ✗

sequential-machine (CommonJS)
  └─ mixed with desktop-server (ES modules) ✗
    Causes export/require confusion
```

---

## Code Quality Metrics

| Metric | Current | Target | Status |
|--------|---------|--------|--------|
| Packages | 47 | 45-50 | ✓ Good |
| Total Lines (src/) | 24,872 | <30,000 | ✓ Good |
| Largest file | storage-observer.js (149) | <150 | ⚠️ At limit |
| Circular deps | 0 | 0 | ✓ Excellent |
| Unused dependencies | 40 | 0 | ⚠️ In progress |
| Export coverage | 229 functions | >200 | ✓ Good |
| Test coverage | 13% (6/45) | 70% | ⚠️ Low |

---

## Recommended Execution Order

### Phase 1: Quick Wins (2-3 hours)
1. **Fix createErrorResponse()** → 15 min
2. **Storage-observer read-only** → 1 hour
3. **Dependency cleanup audit** → 30 min
4. **Consolidate file operations** → 1.5 hours

**Total**: 3 hours, High impact

### Phase 2: Medium Effort (6-8 hours)
1. **Extract StateKit HTTP adapter** → 4-6 hours
2. **Extract FileOperations service** → 2-3 hours
3. **Standardize error responses** → 1 hour

**Total**: 8 hours, Enables P3.2

### Phase 3: Major Refactoring (8-12 hours)
1. **Implement StateManager** → 8-12 hours
2. **Integrate into desktop-server** → 2-3 hours
3. **Update tests** → 2 hours

**Total**: 12-17 hours, Future-proofs system

---

## P3.2 Sequential-OS Integration Blockers

Before proceeding with P3.2, resolve:

1. ✅ **Sequential-OS route logic** - Issue #2 (TRANSIT)
   - Extract StateKit HTTP adapter
   - Clean separation of concerns

2. ⚠️ **State management** - Issue #7 (RISK)
   - Implement StateManager with cleanup
   - Prevent memory leaks in long-running server

3. ✅ **Error handling** - Issue #5 (SAFE)
   - Fix createErrorResponse() undefined
   - Standardize response format

**Recommendation**: Complete Phase 1 (3 hours) + Phase 2 Part 1 (4-6 hours) = 7-9 hours prep work before P3.2.

---

## Architecture Strengths

The following architectural decisions are **excellent** and should be preserved:

1. **Infrastructure packages extracted** (Phase 9.2 complete)
   - @sequential/error-handling ✓
   - @sequential/param-validation ✓
   - @sequential/file-operations ✓
   - All properly scoped and reusable

2. **Dependency injection container** integrated
   - TaskRepository, TaskService, other services resolve cleanly
   - Easy to test with mock container

3. **Async/await discipline**
   - No callback hell
   - Proper error propagation

4. **Express middleware pattern**
   - asyncHandler wraps all routes
   - Consistent error handling

5. **Module organization**
   - Clear separation: routes, middleware, services, adapters
   - Each file <150 lines (mostly)

---

## Architecture Weaknesses to Address

1. **In-memory state without cleanup** (Issue #7)
2. **Duplicate state sources** (filesystem + Maps)
3. **Sequential-OS route duplication** (Issue #2)
4. **File operations scattered** (Issue #3)

---

## Next Steps

1. **Review this analysis** with team
2. **Prioritize issues** based on P3.2 timeline
3. **Execute Quick Wins** (3 hours) immediately
4. **Plan Phase 2** before starting P3.2
5. **Consider Phase 3** for stable long-term maintenance

---

**Analysis Complete**: Architecture is strong with clear improvement path. Ready for P3.2 after Quick Wins + Issue #2 + Issue #7 resolution.
