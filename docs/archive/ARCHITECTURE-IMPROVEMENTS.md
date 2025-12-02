# Sequential Ecosystem - Architectural Improvement Implementation Guide

**Date**: December 1, 2025
**Companion to**: ARCHITECTURE-ANALYSIS.md

---

## Quick Implementation Reference

### Issue #1: Storage Observer Fix (15 minutes)

**File**: `/packages/desktop-server/src/routes/storage-observer.js`

**Before** (Lines 30-35):
```javascript
app.get('/api/storage/runs', asyncHandler((req, res) => {
  const runs = Array.from(STORAGE_STATE.runs.entries()).map(([id, data]) => ({
    id,
    ...data,
    timestamp: new Date(data.timestamp).toISOString()
  }));
  res.json({ runs, count: runs.length });
}));
```

**After** (uses DI container):
```javascript
export function registerStorageObserverRoutes(app, container) {
  const repository = container.resolve('TaskRepository');

  app.get('/api/storage/runs', asyncHandler(async (req, res) => {
    const allRuns = await repository.getAllRuns(); // Load from filesystem
    res.json({ runs: allRuns, count: allRuns.length });
  }));

  // Remove all other endpoints that used STORAGE_STATE Maps
  // Keep only query endpoints that read from persistent sources
}
```

**Change**: Queries TaskRepository (reads from `tasks/*/runs/*.json`) instead of in-memory Map.

**Files to delete**: Remove `STORAGE_STATE` Map entirely.

---

### Issue #2: Extract Sequential-OS HTTP Adapter (4-6 hours)

**Step 1**: Create new package structure

```bash
mkdir -p packages/sequential-os-http/src
cd packages/sequential-os-http

cat > package.json << 'EOF'
{
  "name": "@sequential/sequential-os-http",
  "version": "1.0.0",
  "description": "HTTP adapter for Sequential-OS StateKit",
  "type": "module",
  "main": "src/index.js",
  "exports": {
    ".": "./src/index.js"
  },
  "dependencies": {
    "@sequential/sequential-machine": "^1.0.0",
    "@sequential/error-handling": "^1.0.0"
  }
}
EOF
```

**Step 2**: Implement index.js

```javascript
// packages/sequential-os-http/src/index.js
import { registerSequentialOsRoutes } from './routes.js';

export { registerSequentialOsRoutes };
export { StateKitHttpClient } from './state-kit-client.js';
```

**Step 3**: Extract routes (copy from desktop-server)

```javascript
// packages/sequential-os-http/src/routes.js
import path from 'path';
import fs from 'fs-extra';
import { createError } from '@sequential/error-handling';
import { asyncHandler } from '../middleware/error-handler.js';

export function registerSequentialOsRoutes(app, kit, STATEKIT_DIR) {
  // Move entire registerSequentialOsRoutes function from desktop-server/routes/sequential-os.js
  // No changes needed - just relocated
}
```

**Step 4**: Create abstraction layer

```javascript
// packages/sequential-os-http/src/state-kit-client.js
import path from 'path';

export class StateKitHttpClient {
  constructor(stateDir = null) {
    const DEFAULT_STATEKIT_DIR = path.join(
      process.env.HOME || process.env.USERPROFILE || '/tmp',
      '.sequential-machine'
    );

    this.stateDir = stateDir || process.env.SEQUENTIAL_MACHINE_DIR || DEFAULT_STATEKIT_DIR;
    this.kit = this._loadKit();
  }

  _loadKit() {
    try {
      const { StateKit } = require('@sequential/sequential-machine');
      return new StateKit(this.stateDir);
    } catch (err) {
      throw new Error(`Failed to load StateKit: ${err.message}`);
    }
  }

  // Delegate methods
  async status() { return this.kit.status(); }
  async run(instruction) { return this.kit.run(instruction); }
  async exec(instruction) { return this.kit.exec(instruction); }
  async history() { return this.kit.history(); }
  async checkout(ref) { return this.kit.checkout(ref); }
  tags() { return this.kit.tags(); }
  tag(name, ref) { return this.kit.tag(name, ref); }
}
```

**Step 5**: Update desktop-server

```javascript
// packages/desktop-server/src/server.js
import { registerSequentialOsRoutes } from '@sequential/sequential-os-http';
import { StateKitHttpClient } from '@sequential/sequential-os-http';

const kit = new StateKitHttpClient();
app.use('/api/sequential-os', (req, res, next) => {
  req.kit = kit;
  next();
});

registerSequentialOsRoutes(app, kit, kit.stateDir);
```

**Step 6**: Delete old file

```bash
rm packages/desktop-server/src/routes/sequential-os.js
```

**Testing**:
```bash
npm test -w @sequential/sequential-os-http
npm run dev  # Should work identically
```

---

### Issue #3: Consolidate File Operations (2-3 hours)

**Step 1**: Create FileOperationsService

```javascript
// packages/file-operations-service/src/index.js (NEW)
import { writeFileAtomicString } from '@sequential/file-operations';
import { logFileSuccess, logFileOperation } from '@sequential/error-handling';
import fs from 'fs-extra';

export class FileOperationsService {
  constructor(config = {}) {
    this.maxSizeBytes = config.maxSizeBytes || 10 * 1024 * 1024; // 10MB default
  }

  async _wrapOperation(operationName, fn, filePath) {
    const startTime = Date.now();
    try {
      const result = await fn();
      const duration = Date.now() - startTime;
      logFileSuccess(operationName, filePath, duration, result);
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      logFileOperation(operationName, filePath, error, { duration });
      throw error;
    }
  }

  async readFile(filePath) {
    return this._wrapOperation('read', async () => {
      const stat = await fs.stat(filePath);
      if (stat.isDirectory()) {
        throw new Error('Cannot read directory');
      }
      if (stat.size > this.maxSizeBytes) {
        throw new Error(`File too large (max ${this.maxSizeBytes} bytes)`);
      }
      const content = await fs.readFile(filePath, 'utf8');
      return { path: filePath, size: stat.size, content, modified: stat.mtime };
    }, filePath);
  }

  async writeFile(filePath, content) {
    return this._wrapOperation('write', async () => {
      await writeFileAtomicString(filePath, content);
      const isNew = !(await fs.pathExists(filePath));
      return { path: filePath, size: content.length, isNew };
    }, filePath);
  }

  async mkdir(dirPath) {
    return this._wrapOperation('mkdir', async () => {
      await fs.ensureDir(dirPath);
      return { path: dirPath };
    }, dirPath);
  }

  async deleteFile(filePath) {
    return this._wrapOperation('delete', async () => {
      await fs.remove(filePath);
      return { path: filePath };
    }, filePath);
  }
}
```

**Step 2**: Create unified routes file

```javascript
// packages/desktop-server/src/routes/file-operations.js (MERGED)
import path from 'path';
import { validate } from '@sequential/param-validation';
import { asyncHandler } from '../middleware/error-handler.js';
import { validateAndResolvePath } from './file-operations-utils.js';

export function registerFileOperationRoutes(app, fileService) {
  app.get('/api/files/current-path', (req, res) => {
    res.json({ path: process.cwd() });
  });

  app.get('/api/files/list', asyncHandler(async (req, res) => {
    const dir = req.query.dir || process.cwd();
    const realPath = validateAndResolvePath(dir);
    const items = await fileService.listDirectory(realPath);
    res.json({ directory: realPath, files: items });
  }));

  app.get('/api/files/read', asyncHandler(async (req, res) => {
    const filePath = req.query.path;
    const realPath = validateAndResolvePath(filePath);
    const result = await fileService.readFile(realPath);
    res.json(result);
  }));

  app.post('/api/files/save', asyncHandler(async (req, res) => {
    const { path: filePath, content } = req.body;
    validate().required('path', filePath).required('content', content).execute();
    const realPath = validateAndResolvePath(filePath);
    const result = await fileService.writeFile(realPath, content);
    res.json(result);
  }));

  app.post('/api/files/write', asyncHandler(async (req, res) => {
    const { path: filePath, content } = req.body;
    validate().required('path', filePath).required('content', content).execute();
    const realPath = validateAndResolvePath(filePath);
    const result = await fileService.writeFile(realPath, content);
    res.json(result);
  }));

  app.post('/api/files/mkdir', asyncHandler(async (req, res) => {
    const { path: dirPath } = req.body;
    validate().required('path', dirPath).execute();
    const realPath = validateAndResolvePath(dirPath);
    const result = await fileService.mkdir(realPath);
    res.json(result);
  }));

  app.delete('/api/files', asyncHandler(async (req, res) => {
    const filePath = req.query.path || req.body?.path;
    validate().required('path', filePath).execute();
    const realPath = validateAndResolvePath(filePath);
    const result = await fileService.deleteFile(realPath);
    res.json(result);
  }));
}
```

**Step 3**: Update server.js

```javascript
// packages/desktop-server/src/server.js
import { FileOperationsService } from '@sequential/file-operations-service';
import { registerFileOperationRoutes } from './routes/file-operations.js';

const fileService = new FileOperationsService(CONFIG.files);
registerFileOperationRoutes(app, fileService);
```

**Step 4**: Delete old files

```bash
rm packages/desktop-server/src/routes/file-read-operations.js
rm packages/desktop-server/src/routes/file-write-operations.js
rm packages/desktop-server/src/routes/file-transform-operations.js
```

**Result**: 223 lines → 80 lines, fully testable, reusable.

---

### Issue #4: Metrics Service Extraction (1.5 hours)

**File**: Create `/packages/metrics-service/src/index.js`

```javascript
export class MetricsService {
  constructor(repository, config = {}) {
    this.repository = repository;
    this.cacheTTL = config.cacheTTL || 60000;
    this.cache = null;
    this.cacheTime = 0;
  }

  async calculateMetrics() {
    const now = Date.now();
    if (this.cache && (now - this.cacheTime) < this.cacheTTL) {
      return { ...this.cache, fromCache: true };
    }

    const allRuns = await this.repository.getAllRuns();
    const successful = allRuns.filter(r => r.status === 'success').length;
    const failed = allRuns.filter(r => r.status === 'error').length;
    const cancelled = allRuns.filter(r => r.status === 'cancelled').length;
    const completedRuns = successful + failed + cancelled;

    const durations = allRuns
      .map(r => r.duration || 0)
      .filter(d => d > 0)
      .sort((a, b) => a - b);

    const metrics = {
      totalRuns: allRuns.length,
      completedRuns,
      successfulRuns: successful,
      failedRuns: failed,
      cancelledRuns: cancelled,
      successRate: completedRuns > 0 ? (successful / completedRuns * 100).toFixed(2) : 0,
      failureRate: completedRuns > 0 ? (failed / completedRuns * 100).toFixed(2) : 0,
      cancellationRate: completedRuns > 0 ? (cancelled / completedRuns * 100).toFixed(2) : 0,
      duration: {
        average: durations.length > 0 ? Math.round(durations.reduce((a, b) => a + b) / durations.length) : 0,
        median: durations.length > 0 ? durations[Math.floor(durations.length / 2)] : 0,
        min: durations.length > 0 ? durations[0] : 0,
        max: durations.length > 0 ? durations[durations.length - 1] : 0
      }
    };

    this.cache = metrics;
    this.cacheTime = now;
    return metrics;
  }

  invalidateCache() {
    this.cache = null;
    this.cacheTime = 0;
  }
}
```

**Update route** (in runs.js):
```javascript
app.get('/api/metrics', asyncHandler(async (req, res) => {
  const metrics = await metricsService.calculateMetrics();
  res.json(metrics);
}));
```

---

### Issue #5: Standardize Error Responses (1 hour)

**Step 1**: Add to error-handling package

```javascript
// packages/error-handling/src/response-helper.js (NEW)
export function createErrorResponse(code, message, statusCode = 400) {
  return {
    error: {
      code,
      message,
      timestamp: new Date().toISOString()
    }
  };
}

export function errorToResponse(error) {
  return createErrorResponse(
    error.code || 'UNKNOWN_ERROR',
    error.message || 'An error occurred',
    error.httpCode || 500
  );
}
```

**Step 2**: Update index.js

```javascript
// packages/error-handling/src/index.js
export { createErrorResponse, errorToResponse } from './response-helper.js';
```

**Step 3**: Audit and fix routes

Search for all uses:
```bash
grep -r "createErrorResponse\|{code.*message}" packages/desktop-server/src/routes --include="*.js"
```

Replace all with:
```javascript
import { createErrorResponse } from '@sequential/error-handling';

res.status(400).json(createErrorResponse('INVALID_INPUT', 'instruction is required'));
```

---

### Issue #6: Dependency Audit (30 minutes)

**Run existing script**:
```bash
# Check if audit script exists
ls packages/tools/dependency-*.js

# Run cleanup (dry run first)
node packages/tools/dependency-cleanup.js --dry-run

# Review changes
cat .dependency-cleanup-backup/changes.json

# Apply if satisfied
node packages/tools/dependency-cleanup.js
```

---

### Issue #7: State Manager Implementation (8-12 hours)

**Phase A: Design (1-2 hours)**

Create `/packages/persistent-state-manager/src/index.js`:

```javascript
export class StateManager {
  constructor(adapter, config = {}) {
    this.adapter = adapter;
    this.memoryCache = new Map();
    this.maxCacheSize = config.maxCacheSize || 1000;
    this.cacheTTL = config.cacheTTL || 300000; // 5 minutes
    this.cleanupInterval = config.cleanupInterval || 60000;

    this.cleanupTimer = setInterval(
      () => this._cleanupExpiredEntries(),
      this.cleanupInterval
    );
  }

  async get(type, id) {
    const key = `${type}:${id}`;
    const cached = this.memoryCache.get(key);

    if (cached && this._isValid(cached)) {
      return cached.data;
    }

    const data = await this.adapter.get(type, id);
    if (data) {
      this.memoryCache.set(key, {
        data,
        timestamp: Date.now()
      });
    }

    return data;
  }

  async set(type, id, data) {
    const key = `${type}:${id}`;

    // Persist immediately
    await this.adapter.set(type, id, data);

    // Update cache
    this.memoryCache.set(key, {
      data,
      timestamp: Date.now()
    });

    // Enforce size limit
    if (this.memoryCache.size > this.maxCacheSize) {
      this._evictOldest();
    }
  }

  _isValid(entry) {
    return Date.now() - entry.timestamp < this.cacheTTL;
  }

  _cleanupExpiredEntries() {
    const now = Date.now();
    for (const [key, entry] of this.memoryCache.entries()) {
      if (!this._isValid(entry)) {
        this.memoryCache.delete(key);
      }
    }
  }

  _evictOldest() {
    let oldest = null;
    let oldestTime = Infinity;

    for (const [key, entry] of this.memoryCache.entries()) {
      if (entry.timestamp < oldestTime) {
        oldest = key;
        oldestTime = entry.timestamp;
      }
    }

    if (oldest) {
      this.memoryCache.delete(oldest);
    }
  }

  async shutdown() {
    clearInterval(this.cleanupTimer);
    this.memoryCache.clear();
    if (this.adapter.shutdown) {
      await this.adapter.shutdown();
    }
  }
}
```

**Phase B: Adapter Interface (1 hour)**

```javascript
// packages/persistent-state-manager/src/adapter.js
export class PersistentStateAdapter {
  async get(type, id) {
    throw new Error('Implement get()');
  }

  async set(type, id, data) {
    throw new Error('Implement set()');
  }

  async shutdown() {
    // Optional
  }
}

// Filesystem implementation
export class FileSystemStateAdapter extends PersistentStateAdapter {
  constructor(basePath) {
    super();
    this.basePath = basePath;
  }

  async get(type, id) {
    // Read from tasks/*/runs/*.json or similar
  }

  async set(type, id, data) {
    // Write to filesystem
  }
}
```

**Phase C: Integration (2-3 hours)**

```javascript
// packages/desktop-server/src/server.js
import { StateManager } from '@sequential/persistent-state-manager';
import { FileSystemStateAdapter } from '@sequential/persistent-state-manager';

const stateAdapter = new FileSystemStateAdapter(process.cwd());
const stateManager = new StateManager(stateAdapter, {
  maxCacheSize: 1000,
  cacheTTL: 300000,
  cleanupInterval: 60000
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  await stateManager.shutdown();
  process.exit(0);
});

process.on('SIGINT', async () => {
  await stateManager.shutdown();
  process.exit(0);
});
```

**Phase D: Update routes** (2-3 hours)

Replace STORAGE_STATE Maps with stateManager calls throughout all routes.

---

## Testing Strategy

### Unit Tests
```bash
# Each new service
npm test -w @sequential/sequential-os-http
npm test -w @sequential/file-operations-service
npm test -w @sequential/metrics-service
npm test -w @sequential/persistent-state-manager
```

### Integration Tests
```bash
# Server starts cleanly
npm run dev &
sleep 2
curl http://localhost:3000/api/health
```

### Load Tests (for StateManager)
```javascript
// Mock heavy usage
for (let i = 0; i < 5000; i++) {
  await stateManager.set('runs', `run-${i}`, { data: 'test' });
}
// Verify memory stays bounded
console.log(process.memoryUsage());
```

---

## Validation Checklist

Before starting each issue:
- [ ] Read related CLAUDE.md documentation
- [ ] Identify all affected imports
- [ ] Create new package with proper package.json
- [ ] Update desktop-server dependencies
- [ ] Test with `npm run dev`
- [ ] Run `npm test` on affected packages
- [ ] Git commit with clear message

---

## Rollback Plan

Each improvement should be reversible:

```bash
# Before starting
git checkout -b improve/issue-X
git commit --allow-empty -m "Checkpoint before Issue #X"

# If issues arise
git reset --hard <checkpoint-hash>
git clean -fd
```

---

## Success Metrics

After all improvements:
1. ✅ No in-memory Maps without cleanup
2. ✅ No unused dependencies
3. ✅ Error responses consistent across codebase
4. ✅ File operations centralized in service
5. ✅ Sequential-OS HTTP properly extracted
6. ✅ Storage-observer reads from persistent sources
7. ✅ Server gracefully handles SIGTERM/SIGINT

---

**Implementation Guide Complete** - Ready to execute issues in priority order.
