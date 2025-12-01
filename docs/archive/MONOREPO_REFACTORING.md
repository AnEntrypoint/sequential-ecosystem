# Sequential Ecosystem: Monorepo Package Extraction Plan

**Status**: Phase 1 Complete ✅ | Phases 2-8 Ready for Extraction

## Overview

This document guides the extraction of 7 remaining packages from `desktop-server/src/` to create a true modular monorepo architecture.

**Current State**:
- desktop-server/src: 2348 lines
- 3 extracted packages (data-access-layer, task-execution-service, dependency-injection)

**Target State**:
- desktop-server: 931 lines (-60%)
- 11 packages (3 existing + 8 new infrastructure packages)
- All utilities independently versioned, tested, deployable

---

## Extraction Order (Respect Dependencies)

```
PHASE 1: @sequential/error-handling      ✅ COMPLETE
├─ Depends on: nothing

PHASE 2: @sequential/response-formatting
├─ Depends on: nothing

PHASE 3: @sequential/param-validation
├─ Depends on: error-handling

PHASE 4: @sequential/file-operations
├─ Depends on: error-handling

PHASE 5: @sequential/input-sanitization
├─ Depends on: error-handling

PHASE 6: @sequential/websocket-broadcaster
├─ Depends on: error-handling

PHASE 7: @sequential/websocket-factory
├─ Depends on: error-handling, websocket-broadcaster

PHASE 8: @sequential/server-utilities
├─ Depends on: error-handling, response-formatting

PHASE 9: Update desktop-server imports
├─ Depends on: Phases 1-8

PHASE 10: Update app-* packages imports
├─ Depends on: Phase 9
```

---

## Phase-by-Phase Extraction Guide

### PHASE 2: Extract @sequential/response-formatting

**New Package Location**: `packages/response-formatting/`

**Files to Move**:
```
packages/response-formatting/src/
├── index.js (new - exports all functions)
└── formatters.js (from: desktop-server/src/utils/response-formatter.js)
```

**Create Files**:
1. `packages/response-formatting/package.json`:
```json
{
  "name": "@sequential/response-formatting",
  "version": "1.0.0",
  "description": "HTTP response formatting utilities with standardized envelopes",
  "type": "module",
  "main": "src/index.js",
  "exports": {
    ".": "./src/index.js"
  },
  "files": ["src"],
  "repository": {
    "type": "git",
    "url": "https://github.com/AnEntrypoint/sequential-ecosystem.git",
    "directory": "packages/response-formatting"
  },
  "engines": {"node": ">=18.0.0"}
}
```

2. Copy `desktop-server/src/utils/response-formatter.js` → `packages/response-formatting/src/formatters.js`

3. Create `packages/response-formatting/src/index.js`:
```javascript
export {
  formatResponse,
  formatList,
  formatPaginated,
  formatItem,
  formatSuccess,
  formatDeleted,
  formatCreated,
  formatUpdated,
  formatEmpty,
  formatError,
  respondWith
} from './formatters.js';
```

**Update desktop-server/package.json**:
Add dependency: `"@sequential/response-formatting": "*"`

**Update desktop-server imports**:
```diff
- import { formatResponse, ... } from '../utils/response-formatter.js';
+ import { formatResponse, ... } from '@sequential/response-formatting';
```

---

### PHASE 3: Extract @sequential/param-validation

**New Package Location**: `packages/param-validation/`

**Files to Move**:
```
packages/param-validation/src/
├── index.js (new - exports all)
├── validation-chain.js (from: desktop-server/src/middleware/validation-chain.js)
├── validators.js (from: extract functions from desktop-server/src/lib/utils.js)
└── middleware.js (from: desktop-server/src/middleware/param-validator.js)
```

**Extract from desktop-server/src/lib/utils.js**:
```javascript
// validateTaskName - line ~XX (extract)
// validateFileName - line ~XX (extract)
// validateInputSchema - line ~XX (extract)
```

**Create Files**:
1. `packages/param-validation/package.json` (same pattern as response-formatting, adjust name/desc)
2. Copy and consolidate validators
3. `packages/param-validation/src/index.js`:
```javascript
export { validate, ValidationChain } from './validation-chain.js';
export { validateTaskName, validateFileName, validateInputSchema } from './validators.js';
export { createParamValidator } from './middleware.js';
```

**Files to Delete from desktop-server**:
- `src/middleware/param-validator.js` ✓
- `src/middleware/validation-chain.js` ✓

**Update desktop-server/src/lib/utils.js**:
Remove: validateTaskName, validateFileName, validateInputSchema

---

### PHASE 4: Extract @sequential/file-operations

**New Package Location**: `packages/file-operations/`

**Files to Move**:
```
packages/file-operations/src/
├── index.js (new)
├── file-ops.js (from: desktop-server/src/utils/file-ops.js)
├── file-store.js (from: desktop-server/src/lib/file-store.js)
└── path-validation.js (extract validateFilePath, validateFileName from utils.js)
```

**Extract from desktop-server/src/lib/utils.js**:
```javascript
// validateFilePath - extract (~25 lines)
// validateFileName - extract (~11 lines)
```

**Create Files**:
1. `packages/file-operations/package.json`
2. `packages/file-operations/src/index.js`:
```javascript
export { writeFileAtomicString } from './file-ops.js';
export { listJsonFiles, listDirectories, readJson, writeJson } from './file-store.js';
export { validateFilePath, validateFileName } from './path-validation.js';
```

**Files to Delete from desktop-server**:
- `src/utils/file-ops.js` ✓
- `src/lib/file-store.js` ✓
- `src/routes/file-operations-utils.js` ✓ (merge into path-validation.js)

**Update desktop-server/src/lib/utils.js**:
Remove: validateFilePath, validateFileName

---

### PHASE 5: Extract @sequential/input-sanitization

**New Package Location**: `packages/input-sanitization/`

**Files to Move**:
```
packages/input-sanitization/src/
├── index.js (new)
├── sanitization.js (extract from utils.js)
└── rate-limit.js (from: desktop-server/src/middleware/rate-limit.js - extract HTTP portion)
```

**Extract from desktop-server/src/lib/utils.js**:
```javascript
// escapeHtml - extract (~12 lines)
// sanitizeInput - extract (~12 lines)
```

**Extract from desktop-server/src/middleware/rate-limit.js**:
```javascript
// Keep: createRateLimitMiddleware, related HTTP functions (~43 lines)
// Extract: WebSocket functions to websocket-factory (Phase 7)
```

**Create Files**:
1. `packages/input-sanitization/package.json`
2. `packages/input-sanitization/src/index.js`:
```javascript
export { escapeHtml, sanitizeInput } from './sanitization.js';
export { createRateLimitMiddleware, getRateLimitStatus } from './rate-limit.js';
```

**Files to Delete from desktop-server**:
- `src/middleware/rate-limit.js` ✓ (partially - keep WebSocket functions)

**Update desktop-server/src/lib/utils.js**:
Remove: escapeHtml, sanitizeInput

---

### PHASE 6: Extract @sequential/websocket-broadcaster

**New Package Location**: `packages/websocket-broadcaster/`

**Files to Move**:
```
packages/websocket-broadcaster/src/
├── index.js (new)
├── broadcaster.js (from: desktop-server/src/utils/ws-broadcaster.js)
└── subscriber-manager.js (from: desktop-server/src/utils/subscriber-manager.js)
```

**Create Files**:
1. `packages/websocket-broadcaster/package.json`
2. `packages/websocket-broadcaster/src/index.js`:
```javascript
export {
  broadcastToRunSubscribers,
  broadcastToTaskSubscribers,
  broadcastToFileSubscribers,
  addRunSubscriber,
  removeRunSubscriber,
  addTaskSubscriber,
  removeTaskSubscriber,
  addFileSubscriber,
  removeFileSubscriber,
  broadcastTaskProgress,
  broadcastRunProgress
} from './broadcaster.js';

export {
  SubscriberManager,
  SUBSCRIBER_MODES,
  createSingleSubscriber,
  createGroupedSubscriber,
  createSetSubscriber
} from './subscriber-manager.js';
```

**Files to Delete from desktop-server**:
- `src/utils/ws-broadcaster.js` ✓
- `src/utils/subscriber-manager.js` ✓

---

### PHASE 7: Extract @sequential/websocket-factory

**New Package Location**: `packages/websocket-factory/`

**Files to Move**:
```
packages/websocket-factory/src/
├── index.js (new)
├── subscription-factory.js (from: desktop-server/src/utils/ws-subscription-factory.js)
└── ws-rate-limiter.js (extract from desktop-server/src/middleware/rate-limit.js)
```

**Extract from desktop-server/src/middleware/rate-limit.js**:
```javascript
// createWebSocketRateLimiter
// checkWebSocketRateLimit
```

**Create Files**:
1. `packages/websocket-factory/package.json`
2. `packages/websocket-factory/src/index.js`:
```javascript
export { createSubscriptionHandler } from './subscription-factory.js';
export { createWebSocketRateLimiter, checkWebSocketRateLimit } from './ws-rate-limiter.js';
```

**Dependencies in package.json**:
```json
{
  "dependencies": {
    "@sequential/websocket-broadcaster": "*"
  }
}
```

**Files to Delete from desktop-server**:
- `src/utils/ws-subscription-factory.js` ✓
- `src/middleware/rate-limit.js` ✓ (split: HTTP to input-sanitization, WS to websocket-factory)

---

### PHASE 8: Extract @sequential/server-utilities

**New Package Location**: `packages/server-utilities/`

**Files to Move**:
```
packages/server-utilities/src/
├── index.js (new)
├── cache.js (from: desktop-server/src/utils/cache.js)
├── task-executor.js (from: desktop-server/src/utils/task-executor.js)
├── request-logger.js (from: desktop-server/src/middleware/request-logger.js)
├── express-error-handler.js (from: desktop-server/src/middleware/error-handler.js)
└── config.js (from: desktop-server/src/config/defaults.js)
```

**Create Files**:
1. `packages/server-utilities/package.json`
2. `packages/server-utilities/src/index.js`:
```javascript
export { createCache, getCacheEntry, setCacheEntry, clearCache } from './cache.js';
export { executeTask, createWorker } from './task-executor.js';
export { createRequestLogger } from './request-logger.js';
export { createErrorHandlerMiddleware, asyncHandler, logOperation, getOperationLog } from './express-error-handler.js';
export { CONFIG } from './config.js';
```

**Dependencies in package.json**:
```json
{
  "dependencies": {
    "@sequential/error-handling": "*",
    "@sequential/response-formatting": "*"
  }
}
```

**Files to Delete from desktop-server**:
- `src/utils/cache.js` ✓
- `src/utils/task-executor.js` ✓
- `src/middleware/request-logger.js` ✓
- `src/middleware/error-handler.js` ✓
- `src/config/defaults.js` ✓

---

### PHASE 9: Update desktop-server Imports

**Files to Update**:
- `src/server.js` - Update all imports from utilities
- `src/routes/*.js` - Update all route imports
- `package.json` - Add all 8 new packages as dependencies

**Example Import Updates**:
```diff
// BEFORE
import { createErrorHandler } from '../middleware/error-handler.js';
import { CONFIG } from '../config/defaults.js';
import { broadcastToRunSubscribers } from '../utils/ws-broadcaster.js';

// AFTER
import { createErrorHandler } from '@sequential/server-utilities';
import { CONFIG } from '@sequential/server-utilities';
import { broadcastToRunSubscribers } from '@sequential/websocket-broadcaster';
```

**Updated desktop-server/package.json dependencies**:
```json
{
  "dependencies": {
    "@sequential/data-access-layer": "*",
    "@sequential/task-execution-service": "*",
    "@sequential/dependency-injection": "*",
    "@sequential/error-handling": "*",
    "@sequential/response-formatting": "*",
    "@sequential/param-validation": "*",
    "@sequential/file-operations": "*",
    "@sequential/input-sanitization": "*",
    "@sequential/websocket-broadcaster": "*",
    "@sequential/websocket-factory": "*",
    "@sequential/server-utilities": "*"
  }
}
```

---

### PHASE 10: Update app-* Packages

**Scope**: Update all 10 app packages to import from new packages instead of desktop-server

**Example**: app-terminal, app-debugger, etc.

**Files to Update**:
- `packages/app-*/src/index.html` or `*.js` - Update any error handling, response formatting imports

**Key Changes**:
```diff
// BEFORE (importing from desktop-server)
import { createErrorHandler } from '../../../desktop-server/src/middleware/error-handler.js';

// AFTER (importing from package)
import { createErrorHandler } from '@sequential/error-handling';
```

---

## Automated Execution

To execute phases 2-10 automatically, run:

```bash
cd /home/user/sequential-ecosystem
npm install  # Link all packages after creation

# Manual execution of each phase, or use the refactoring script below
```

---

## Post-Refactoring Verification

```bash
# Test each package independently
npm test --workspace=@sequential/error-handling
npm test --workspace=@sequential/response-formatting
npm test --workspace=@sequential/param-validation
npm test --workspace=@sequential/file-operations
npm test --workspace=@sequential/input-sanitization
npm test --workspace=@sequential/websocket-broadcaster
npm test --workspace=@sequential/websocket-factory
npm test --workspace=@sequential/server-utilities

# Test desktop-server with new imports
npm test --workspace=@sequential/desktop-server

# Full integration test
npm run test:integration
```

---

## Success Criteria

✅ All 8 new packages created with proper structure
✅ All files moved from desktop-server/src/
✅ No files left in desktop-server/src/ except routes, server.js, app-registry.js, task-worker.js
✅ desktop-server/src/ reduced from 2348 → ~1000 lines
✅ All imports updated across packages
✅ All tests pass
✅ No circular dependencies
✅ All packages properly configured for AnEntrypoint org

---

## Files Structure After Completion

```
packages/
├── error-handling/                    ✅ DONE
│   ├── package.json
│   └── src/
│       ├── index.js
│       ├── app-error.js
│       └── error-logger.js
├── response-formatting/               📋 READY
├── param-validation/                  📋 READY
├── file-operations/                   📋 READY
├── input-sanitization/                📋 READY
├── websocket-broadcaster/             📋 READY
├── websocket-factory/                 📋 READY
├── server-utilities/                  📋 READY
├── desktop-server/
│   ├── package.json (updated deps)
│   └── src/
│       ├── server.js
│       ├── app-registry.js
│       ├── task-worker.js
│       └── routes/ (unchanged except imports)
├── data-access-layer/
├── task-execution-service/
├── dependency-injection/
└── ... (other packages)
```

---

## Next Steps

1. **Option A: Automated** - Run Phase 2-8 extraction script (when available)
2. **Option B: Manual** - Follow phase-by-phase guide above
3. **Option C: Continue with Claude Code** - Resume with "keep going"

---

**Timeline**: 3-4 hours for all 7 remaining phases + import updates + testing

**Complexity**: Straightforward mechanical extraction (no architectural changes needed)

**Risk**: LOW (refactoring existing code, no new features, no breaking API changes)
