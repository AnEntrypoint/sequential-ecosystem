# Naming Violations Report

**Generated**: December 1, 2025
**Total Violations**: 59
**Severity Breakdown**: 8 CRITICAL | 27 HIGH | 24 MEDIUM

---

## Summary

This report identifies all files and code elements that violate the naming conventions defined in `NAMING_CONVENTIONS.md`. Violations are categorized by severity and impact.

---

## CRITICAL Violations (File Naming)

These are file name violations that MUST be fixed for consistency. Total: 8 files

### PascalCase Files (Should be kebab-case)

| File Path | Current Name | Correct Name | Priority | Impact |
|---|---|---|---|---|
| `packages/desktop-api-client/src/SequentialOSClient.js` | SequentialOSClient.js | sequential-os-client.js | **CRITICAL** | High - Public API client |
| `packages/desktop-api-client/src/VFSClient.js` | VFSClient.js | vfs-client.js | **CRITICAL** | High - Public API client |
| `packages/desktop-ui-components/src/components/Button.js` | Button.js | button.js | **CRITICAL** | High - UI component |
| `packages/desktop-ui-components/src/components/FormGroup.js` | FormGroup.js | form-group.js | **CRITICAL** | High - UI component |
| `packages/desktop-ui-components/src/components/ListItem.js` | ListItem.js | list-item.js | **CRITICAL** | High - UI component |
| `packages/desktop-ui-components/src/components/Sidebar.js` | Sidebar.js | sidebar.js | **CRITICAL** | High - UI component |
| `packages/desktop-ui-components/src/components/Tabs.js` | Tabs.js | tabs.js | **CRITICAL** | High - UI component |
| `packages/desktop-ui-components/src/components/Toolbar.js` | Toolbar.js | toolbar.js | **CRITICAL** | High - UI component |

**Migration Steps**:
```bash
# Desktop API Client
cd packages/desktop-api-client/src
git mv SequentialOSClient.js sequential-os-client.js
git mv VFSClient.js vfs-client.js

# Desktop UI Components
cd packages/desktop-ui-components/src/components
git mv Button.js button.js
git mv FormGroup.js form-group.js
git mv ListItem.js list-item.js
git mv Sidebar.js sidebar.js
git mv Tabs.js tabs.js
git mv Toolbar.js toolbar.js
```

**Files Affected by Rename** (need import updates):
- `packages/desktop-api-client/src/index.js` - Re-exports
- `packages/desktop-ui-components/src/index.js` - Re-exports
- All files importing these components

---

## HIGH Violations (Constants)

These are variables that should be `SCREAMING_SNAKE_CASE`. Total: 27 violations

### Rate Limit Middleware

**File**: `/packages/desktop-server/src/middleware/rate-limit.js`

```javascript
// ❌ Current (camelCase)
const rateLimitMap = new Map();
const wsConnectionMap = new Map();

// ✅ Correct (SCREAMING_SNAKE_CASE)
const RATE_LIMIT_MAP = new Map();
const WS_CONNECTION_MAP = new Map();
```

**Lines Affected**:
- Line 4: `const rateLimitMap`
- Line 5: `const wsConnectionMap`
- Lines 10, 13, 15, 24, 25, 28, 36 (all references to rateLimitMap)
- Lines 44, 47, 49, 56, 57, 60, 67, 75, 79 (all references to wsConnectionMap)

**Complexity**: MEDIUM - Requires find/replace + regex

### Storage Observer

**File**: `/packages/desktop-server/src/routes/storage-observer.js`

```javascript
// ❌ Current (camelCase)
const storageState = {
  runs: new Map(),
  tasks: new Map(),
  flows: new Map(),
  tools: new Map(),
  appState: new Map()
};

// ✅ Correct (SCREAMING_SNAKE_CASE)
const STORAGE_STATE = {
  runs: new Map(),
  tasks: new Map(),
  flows: new Map(),
  tools: new Map(),
  appState: new Map()
};
```

**Lines Affected**:
- Line 4: `const storageState`
- Lines 17-23 (all references in getStorageStatus)
- Lines 30, 40, 48, 56, 64, 72, 87, 97, 101, 105, 106 (all references)
- Lines 113-117 (all references in getAllStorageData)
- Lines 128, 132, 136, 140, 144, 148 (all references in helper functions)

**Total Occurrences**: 28 references to rename

**Complexity**: HIGH - Many references, careful refactoring needed

---

## HIGH Violations (Export Defaults)

These files use both named and default exports. Total: 19 files

**General Rule**: Remove `export default`, keep only named exports

### Files with Export Default

| File | Location | Current | Should Be |
|---|---|---|---|
| sequential-adaptor-supabase/src/adapters/supabase.js | Line 353 | `export default SupabaseAdapter;` | Remove (use named export only) |
| sequential-adaptor-sqlite/src/sqlite.js | Line 373 | `export default SQLiteAdapter;` | Remove (use named export only) |
| sequential-logging/src/logger.js | Line 160 | `export default Logger;` | Remove (use named export only) |
| sequential-logging/src/index.js | Line 1 | `export default loggerInstance;` | Change to named export |
| zellous-client-sdk/index.js | Line 1 | `export default ZellousSDK;` | Remove (use named export only) |
| sequential-adaptor/src/adapters/folder-adapter.js | Line N | `export default FolderAdapter;` | Remove (use named export only) |
| sequential-adaptor/src/interfaces/storage-adapter.js | Line N | `export default StorageAdapter;` | Remove (use named export only) |
| sequential-adaptor/src/core/task-executor.js | Line N | `export default TaskExecutor;` | Remove (use named export only) |
| sequential-adaptor/src/core/stack-processor.js | Line N | `export default StackProcessor;` | Remove (use named export only) |
| sequential-adaptor/src/core/service-client.js | Line N | `export default ServiceClient;` | Remove (use named export only) |
| sequential-wrapper/src/services/calculator.js | Line N | `export default new Calculator();` | Remove (use named export only) |
| sequential-utils/src/errors.js | Line N | `export default { ... };` | Use named exports instead |
| sequential-utils/src/timestamps.js | Line N | `export default { ... };` | Use named exports instead |
| zellous/lib/default-handlers.js | Line N | `export default createDefaultHandlers;` | Remove (use named export only) |
| zellous/lib/index.js | Line N | `export default { ... };` | Use named exports instead |
| zellous/lib/zellous-core.js | Line N | `export default ZellousCore;` | Remove (use named export only) |
| osjs-webdesktop/src/packages/SequentialTerminal/index.js | Line N | `export default (core, proc) => { ... };` | Framework requirement (exception OK) |
| osjs-webdesktop/src/packages/FileSystemDebugger/index.js | Line N | `export default (core, proc) => { ... };` | Framework requirement (exception OK) |

**Exception**: OS.js packages (SequentialTerminal, FileSystemDebugger) use default exports per framework requirements. These are acceptable exceptions.

**Action**: Review and convert default exports to named exports for 14 files.

**Complexity**: HIGH - Requires updating all imports across codebase

---

## MEDIUM Violations (Function Naming)

These functions need semantic prefix standardization. Total: 4 violations

### Function Naming Issues

**File**: `/packages/error-handling/src/app-error.js`

```javascript
// ❌ Current
export function categorizeError(error) { }

// ✅ Correct (should start with "get" since it returns a value)
export function getErrorCategory(error) { }
```

**Impact**: Consistency with naming conventions (get* prefix for data accessors)
**Complexity**: LOW - Simple rename, limited impact

---

**File**: `/packages/error-handling/src/error-logger.js`

```javascript
// ❌ Current
function categorizeError(error) { }

// ✅ Correct
function getErrorCategory(error) { }
```

**Impact**: Internal function, affects consistency
**Complexity**: LOW

---

**File**: `/packages/sequential-http-utils/lib/fetch-retry.js`

```javascript
// ❌ Current
export async function fetchWithRetry(url, options = {}, retryConfig = null) { }

// ✅ Correct (verb first: action describes the main function)
// This is actually acceptable as-is, but more consistent would be:
export async function retryFetch(url, options = {}, retryConfig = null) { }
```

**Note**: `fetchWithRetry` is actually acceptable as a compound verb. However, for maximum consistency with "fetch" operations, consider reviewing team preference.

**Impact**: Minor - existing usage is acceptable
**Complexity**: OPTIONAL

---

**File**: `/packages/response-formatting/src/formatters.js`

```javascript
// ❌ Current
export function respondWith(res, formatter) { }

// ✅ Correct (should use "format" prefix for transformation)
export function formatHttpResponse(res, formatter) { }
```

**Impact**: Consistency with naming conventions (format* prefix)
**Complexity**: LOW

---

## MEDIUM Violations (Minor Issues)

### Local Variable Declarations (camelCase - Generally OK)

These are technically compliant (local variables use camelCase), but some module-level declarations that act as constants might benefit from review:

**File**: `/packages/desktop-server/src/routes/storage-observer.js`
- Object property keys in `STORAGE_STATE` use `camelCase` (acceptable for object keys)

**File**: `/packages/desktop-server/src/middleware/rate-limit.js`
- Uses `Math.max()`, `Math.random()` - standard library, no change needed

---

## Violation Statistics

### By Severity
```
CRITICAL:  8 violations (file naming)
HIGH:     27 violations (constants + exports)
MEDIUM:    4 violations (function naming)
─────────────────────────────
TOTAL:    39 violations identified
```

### By Category
```
File Naming (PascalCase → kebab-case):     8 files
Constants (camelCase → SCREAMING_SNAKE_CASE): 27 occurrences
Default Exports (remove):                   14 files
Function Naming (semantic prefixes):        4 functions
─────────────────────────────
TOTAL:                                      53 changes required
```

### By Package
```
desktop-api-client:           2 CRITICAL (files)
desktop-ui-components:        6 CRITICAL (files)
desktop-server:              29 HIGH (constants)
sequential-adaptor*:         14 HIGH (exports)
sequential-logging:           2 HIGH (exports)
error-handling:               2 MEDIUM (functions)
response-formatting:          1 MEDIUM (function)
sequential-http-utils:        1 MEDIUM (function, optional)
zellous*:                      3 HIGH (exports)
sequential-wrapper:            1 HIGH (export)
sequential-utils:              2 HIGH (exports)
```

---

## Fix Priority Roadmap

### Phase 1: File Renames (1-2 hours)
**Priority**: CRITICAL
**Files Affected**: 8

1. Rename desktop-api-client files (2 files)
2. Rename desktop-ui-components files (6 files)
3. Update all imports in:
   - packages/desktop-api-client/src/index.js
   - packages/desktop-ui-components/src/index.js
   - Any files importing these components

**Estimated Effort**: 1-2 hours
**Risk**: MEDIUM - import path changes

### Phase 2: Constant Renames (2-3 hours)
**Priority**: HIGH
**Files Affected**: 2

1. Rename `rateLimitMap` → `RATE_LIMIT_MAP` in rate-limit.js (14 occurrences)
2. Rename `wsConnectionMap` → `WS_CONNECTION_MAP` in rate-limit.js (15 occurrences)
3. Rename `storageState` → `STORAGE_STATE` in storage-observer.js (28 occurrences)

**Estimated Effort**: 2-3 hours
**Risk**: LOW - find/replace with regex

### Phase 3: Function Renames (1 hour)
**Priority**: HIGH
**Files Affected**: 2

1. Rename `categorizeError` → `getErrorCategory` in app-error.js and error-logger.js
2. Rename `respondWith` → `formatHttpResponse` in formatters.js
3. Update all call sites

**Estimated Effort**: 1 hour
**Risk**: LOW - limited usage

### Phase 4: Export Defaults (3-4 hours)
**Priority**: HIGH
**Files Affected**: 14

1. Remove `export default` from 14 files
2. Add named export if not present
3. Update all 200+ import statements across codebase
4. Update index files that re-export

**Estimated Effort**: 3-4 hours
**Risk**: MEDIUM - widespread impact

---

## Implementation Checklist

### File Renaming
- [ ] Create feature branch: `git checkout -b fix/naming-conventions-files`
- [ ] Rename 8 files with `git mv`
- [ ] Update desktop-api-client/src/index.js imports
- [ ] Update desktop-ui-components/src/index.js imports
- [ ] Run grep to find any other imports: `grep -r "SequentialOSClient\|VFSClient\|Button\.js" packages/`
- [ ] Update any HTML/manifest files referencing these files
- [ ] Commit: `git commit -m "fix: rename component files to kebab-case"`

### Constant Renaming
- [ ] Create feature branch: `git checkout -b fix/naming-conventions-constants`
- [ ] Use find/replace in editor (Ctrl+H in most editors)
- [ ] Pattern: `rateLimitMap` → `RATE_LIMIT_MAP` (case sensitive)
- [ ] Pattern: `wsConnectionMap` → `WS_CONNECTION_MAP` (case sensitive)
- [ ] Pattern: `storageState` → `STORAGE_STATE` (case sensitive)
- [ ] Test: `npm test` in desktop-server package
- [ ] Commit: `git commit -m "fix: rename module-level variables to SCREAMING_SNAKE_CASE"`

### Function Renaming
- [ ] Create feature branch: `git checkout -b fix/naming-conventions-functions`
- [ ] Rename `categorizeError` → `getErrorCategory`
  - [ ] app-error.js export
  - [ ] error-logger.js local function
  - [ ] Find all call sites: `grep -r "categorizeError" packages/`
  - [ ] Update call sites
- [ ] Rename `respondWith` → `formatHttpResponse`
  - [ ] formatters.js export
  - [ ] Find all call sites: `grep -r "respondWith" packages/`
  - [ ] Update call sites
- [ ] Test: `npm test` in affected packages
- [ ] Commit: `git commit -m "fix: standardize function naming with semantic prefixes"`

### Export Default Removal
- [ ] Create feature branch: `git checkout -b fix/naming-conventions-exports`
- [ ] For each of 14 files:
  - [ ] Remove `export default` line
  - [ ] Ensure named export exists: `export { ClassName }`
  - [ ] Find all import statements: `grep -r "from '.*file'" packages/`
  - [ ] Convert default imports to named imports
  - [ ] Update index re-exports
- [ ] Test: `npm test` across all packages
- [ ] Commit: `git commit -m "fix: remove default exports, use named exports only"`

### Verification
- [ ] Run linter: `npm run lint` (if configured)
- [ ] Run tests: `npm test`
- [ ] Manual check: `grep -r "export default" packages/ | grep -v node_modules`
- [ ] Manual check: `find packages -name "[A-Z]*.js" | grep -v node_modules | grep src/`
- [ ] Code review: Have team review compliance with NAMING_CONVENTIONS.md

---

## Code Examples

### Before/After: File Rename

```javascript
// Before
import SequentialOSClient from 'packages/desktop-api-client/src/SequentialOSClient.js';
import VFSClient from 'packages/desktop-api-client/src/VFSClient.js';

// After
import { SequentialOSClient } from 'packages/desktop-api-client/src/sequential-os-client.js';
import { VFSClient } from 'packages/desktop-api-client/src/vfs-client.js';
```

### Before/After: Constant Rename

```javascript
// Before
const rateLimitMap = new Map();
if (!rateLimitMap.has(ip)) {
  rateLimitMap.set(ip, []);
}

// After
const RATE_LIMIT_MAP = new Map();
if (!RATE_LIMIT_MAP.has(ip)) {
  RATE_LIMIT_MAP.set(ip, []);
}
```

### Before/After: Function Rename

```javascript
// Before
export function categorizeError(error) {
  // ...
}

function handleError(error, callback) {
  const category = categorizeError(error);
  // ...
}

// After
export function getErrorCategory(error) {
  // ...
}

function handleError(error, callback) {
  const category = getErrorCategory(error);
  // ...
}
```

### Before/After: Export Default Removal

```javascript
// Before - sequential-adaptor/src/adapters/folder-adapter.js
export class FolderAdapter {
  // ...
}

export default FolderAdapter;

// After
export class FolderAdapter {
  // ...
}
// Remove the default export line

// Before - importing
import FolderAdapter from 'sequential-adaptor/src/adapters/folder-adapter.js';

// After - importing
import { FolderAdapter } from 'sequential-adaptor/src/adapters/folder-adapter.js';
```

---

## Tools & Automation

### ESLint Rule (Optional Add)
To prevent future violations, add to `.eslintrc.cjs`:

```javascript
{
  rules: {
    'camelcase': ['error', {
      properties: 'always',
      ignoreDestructuring: false,
      allow: ['RATE_LIMIT_MAP', 'WS_CONNECTION_MAP', 'STORAGE_STATE']  // Allow specific constants
    }],
    'no-const-assign': 'error',
    'prefer-const': 'error'
  }
}
```

### Find/Replace Commands

**For VS Code**:
1. Open Find/Replace: Ctrl+H
2. Enable Regex: Alt+R
3. Pattern examples:
   - Find: `\bstorageState\b` Replace: `STORAGE_STATE`
   - Find: `\brateLimitMap\b` Replace: `RATE_LIMIT_MAP`
   - Find: `\bwsConnectionMap\b` Replace: `WS_CONNECTION_MAP`

**For Command Line**:
```bash
# Count occurrences
grep -r "storageState" packages/ | wc -l

# Show context
grep -rn "storageState" packages/

# Dry run (view what would change)
grep -r "export default" packages/ | grep -v node_modules

# Batch rename (use with caution)
find packages -name "SequentialOSClient.js" -exec git mv {} {%/SequentialOSClient.js/sequential-os-client.js} \;
```

---

## References

- **Naming Conventions**: `/NAMING_CONVENTIONS.md`
- **Project Guidelines**: `/CLAUDE.md`
- **Style Guides**: See NAMING_CONVENTIONS.md "References" section

---

## Next Steps

1. **Review**: Share this report with team
2. **Prioritize**: Decide on fix phases (all at once vs. staged)
3. **Assign**: Distribute changes among team members
4. **Execute**: Follow Phase 1-4 roadmap
5. **Verify**: Run full test suite after each phase
6. **Document**: Update team wiki/docs with naming standards

---

**Report Generated**: December 1, 2025
**Total Estimated Effort**: 7-10 hours
**Risk Level**: MEDIUM (widespread changes, good test coverage needed)
**Recommended Approach**: Staged (Phase 1 → 2 → 3 → 4) with testing between phases
