# Files Requiring Naming Convention Updates

**Quick reference**: All files that need changes organized by violation type.

---

## CRITICAL: File Names (PascalCase → kebab-case)

**Total**: 8 files - MUST be renamed

### desktop-api-client Package
```
packages/desktop-api-client/src/
├── SequentialOSClient.js → sequential-os-client.js
└── VFSClient.js → vfs-client.js

Also update:
└── index.js (re-exports)
```

**Actions**:
- Rename files with `git mv`
- Update import paths in `index.js`
- Search codebase for references: `grep -r "SequentialOSClient\|VFSClient"`

---

### desktop-ui-components Package
```
packages/desktop-ui-components/src/components/
├── Button.js → button.js
├── FormGroup.js → form-group.js
├── ListItem.js → list-item.js
├── Sidebar.js → sidebar.js
├── Tabs.js → tabs.js
└── Toolbar.js → toolbar.js

Also update:
└── ../index.js (re-exports)
```

**Actions**:
- Rename 6 files with `git mv`
- Update import paths in `index.js`
- Search codebase: `grep -r "Button.js\|FormGroup.js\|ListItem.js\|Sidebar.js\|Tabs.js\|Toolbar.js"`

---

## HIGH: Module-Level Constants (camelCase → SCREAMING_SNAKE_CASE)

**Total**: 27 occurrences - 2 files

### File 1: rate-limit.js
**Path**: `packages/desktop-server/src/middleware/rate-limit.js`

**Variables to rename**:
1. `rateLimitMap` → `RATE_LIMIT_MAP` (14 occurrences)
2. `wsConnectionMap` → `WS_CONNECTION_MAP` (15 occurrences)

**Occurrences Summary**:
- Line 4: Declaration `const rateLimitMap`
- Line 5: Declaration `const wsConnectionMap`
- Lines 10, 13, 15, 24-28, 36: All `rateLimitMap` references
- Lines 44-79: All `wsConnectionMap` references

**Tools**: Find/Replace (Ctrl+H in VS Code)
- Pattern: `\brationLimitMap\b` → `RATE_LIMIT_MAP`
- Pattern: `\bwsConnectionMap\b` → `WS_CONNECTION_MAP`

---

### File 2: storage-observer.js
**Path**: `packages/desktop-server/src/routes/storage-observer.js`

**Variable to rename**:
1. `storageState` → `STORAGE_STATE` (28 occurrences)

**Occurrences Summary**:
- Line 4: Declaration `const storageState`
- Line 17-23: References in return statement
- Lines 30, 40, 48, 56, 64, 72: References in getters
- Lines 87, 97, 101, 105, 106: References in clear operations
- Lines 113-117: References in export function
- Lines 128, 132, 136, 140, 144, 148: References in helper functions

**Tools**: Find/Replace (Ctrl+H in VS Code)
- Pattern: `\bstorageState\b` → `STORAGE_STATE`

---

## HIGH: Default Exports (remove)

**Total**: 14 files - Remove `export default` declarations

### Group 1: Adapter Classes

1. **File**: `packages/sequential-adaptor-sqlite/src/sqlite.js`
   - Line: 373
   - Current: `export default SQLiteAdapter;`
   - Action: Remove line, ensure `export class SQLiteAdapter` exists
   - Update imports: Convert to named imports
   - Search: `grep -r "from.*sqlite.js"`

2. **File**: `packages/sequential-adaptor-supabase/src/adapters/supabase.js`
   - Current: `export default SupabaseAdapter;`
   - Action: Same as above
   - Search: `grep -r "from.*supabase.js"`

3. **File**: `packages/sequential-adaptor/src/adapters/folder-adapter.js`
   - Current: `export default FolderAdapter;`
   - Action: Same as above
   - Search: `grep -r "FolderAdapter"`

4. **File**: `packages/sequential-adaptor/src/interfaces/storage-adapter.js`
   - Current: `export default StorageAdapter;`
   - Action: Same as above

5. **File**: `packages/sequential-adaptor/src/core/task-executor.js`
   - Current: `export default TaskExecutor;`
   - Action: Same as above

6. **File**: `packages/sequential-adaptor/src/core/stack-processor.js`
   - Current: `export default StackProcessor;`
   - Action: Same as above

7. **File**: `packages/sequential-adaptor/src/core/service-client.js`
   - Current: `export default ServiceClient;`
   - Action: Same as above

### Group 2: Logging Classes

8. **File**: `packages/sequential-logging/src/logger.js`
   - Line: 160
   - Current: `export default Logger;`
   - Action: Remove, keep named export
   - Search: `grep -r "from.*logger.js"`

9. **File**: `packages/sequential-logging/src/index.js`
   - Current: `export default loggerInstance;`
   - Action: Change to `export { loggerInstance };`
   - Update: All imports using `import logger from` to `import { loggerInstance as logger }`

### Group 3: SDK Classes

10. **File**: `packages/zellous-client-sdk/index.js`
    - Current: `export default ZellousSDK;`
    - Action: Remove, ensure named export exists
    - Search: `grep -r "zellous-client-sdk"`

11. **File**: `packages/zellous/lib/zellous-core.js`
    - Current: `export default ZellousCore;`
    - Action: Same as above

12. **File**: `packages/zellous/lib/default-handlers.js`
    - Current: `export default createDefaultHandlers;`
    - Action: Remove

### Group 4: Utility Modules

13. **File**: `packages/sequential-wrapper/src/services/calculator.js`
    - Current: `export default new Calculator();`
    - Action: Change to named export: `export const calculator = new Calculator();`
    - Update: All imports to `import { calculator }`

14. **File**: `packages/sequential-utils/src/errors.js`
    - Current: `export default { SerializedError, ... };`
    - Action: Convert to named exports:
      ```javascript
      export { SerializedError };
      export { serializeError };
      export { normalizeError };
      ```
    - Update: All `import errors from` to `import { SerializedError, ... }`

### Group 5: Index/Re-Export Files

15. **File**: `packages/sequential-utils/src/timestamps.js`
    - Current: `export default { nowISO, ... };`
    - Action: Convert to named exports
    - Update: All imports accordingly

16. **File**: `packages/zellous/lib/index.js`
    - Current: `export default { ... };`
    - Action: Convert to named exports

### Framework Exceptions (OK to keep default exports)

**These are ALLOWED to use default exports due to framework requirements:**
- `packages/osjs-webdesktop/src/packages/SequentialTerminal/index.js`
- `packages/osjs-webdesktop/src/packages/FileSystemDebugger/index.js`

These use OS.js convention requiring default exports. No changes needed.

---

## MEDIUM: Function Naming (add semantic prefixes)

**Total**: 4 functions - Add proper semantic prefixes

### Function Renames

1. **File**: `packages/error-handling/src/app-error.js`
   - Current: `export function categorizeError(error)`
   - Correct: `export function getErrorCategory(error)`
   - Occurrences: Exported function, find call sites: `grep -r "categorizeError" packages/`
   - Also rename in: `error-logger.js` (internal function)

2. **File**: `packages/error-handling/src/error-logger.js`
   - Current: `function categorizeError(error)`
   - Correct: `function getErrorCategory(error)`
   - Same variable, internal usage only

3. **File**: `packages/response-formatting/src/formatters.js`
   - Current: `export function respondWith(res, formatter)`
   - Correct: `export function formatHttpResponse(res, formatter)`
   - Occurrences: Find call sites: `grep -r "respondWith" packages/`

4. **File**: `packages/sequential-http-utils/lib/fetch-retry.js`
   - Current: `export async function fetchWithRetry(...)`
   - Note: This is acceptable as-is (compound verb), but for maximum consistency:
   - Optional: `export async function retryFetch(...)`
   - Status: **OPTIONAL** - existing naming acceptable, but review with team

---

## Summary Table

| Type | Count | Severity | Effort | Risk |
|------|-------|----------|--------|------|
| File renames | 8 | CRITICAL | 1-2h | MEDIUM |
| Constants | 27 | HIGH | 2-3h | LOW |
| Exports | 14 | HIGH | 3-4h | MEDIUM |
| Functions | 4 | MEDIUM | 1h | LOW |
| **TOTAL** | **53** | Mixed | **7-10h** | **MEDIUM** |

---

## Implementation Order (Recommended)

### Phase 1: File Renames (CRITICAL - Do First)
```bash
# 1. File renames
cd packages/desktop-api-client/src
git mv SequentialOSClient.js sequential-os-client.js
git mv VFSClient.js vfs-client.js

cd ../../../packages/desktop-ui-components/src/components
git mv Button.js button.js
git mv FormGroup.js form-group.js
git mv ListItem.js list-item.js
git mv Sidebar.js sidebar.js
git mv Tabs.js tabs.js
git mv Toolbar.js toolbar.js

# 2. Update imports in index files
# - packages/desktop-api-client/src/index.js
# - packages/desktop-ui-components/src/index.js

# 3. Find and update all other imports
grep -r "SequentialOSClient\|VFSClient\|Button\.js\|FormGroup\.js" packages/
```

### Phase 2: Constants (HIGH - Do Second)
```bash
# Use Find/Replace in editor
# Files:
# - packages/desktop-server/src/middleware/rate-limit.js
# - packages/desktop-server/src/routes/storage-observer.js

# Patterns:
# \bstorageState\b → STORAGE_STATE
# \brateLimitMap\b → RATE_LIMIT_MAP
# \bwsConnectionMap\b → WS_CONNECTION_MAP
```

### Phase 3: Functions (MEDIUM - Do Third)
```bash
# Find/Replace patterns
# \bcategorizeError\b → getErrorCategory
# \brespondWith\b → formatHttpResponse
# Files:
# - packages/error-handling/src/app-error.js
# - packages/error-handling/src/error-logger.js
# - packages/response-formatting/src/formatters.js
```

### Phase 4: Exports (HIGH - Do Last)
```bash
# Edit each file individually
# 14 files to update + all their imports
# High-impact changes, needs careful testing

# Files:
# packages/sequential-adaptor*/src/**/*.js (7 files)
# packages/sequential-logging/src/*.js (2 files)
# packages/sequential-utils/src/*.js (2 files)
# packages/zellous*/lib/*.js (3 files)
# packages/sequential-wrapper/src/services/*.js (1 file)
```

---

## Verification Commands

After each phase, run these commands:

```bash
# Check for remaining violations
grep -r "export default" packages/ --include="*.js" | grep -v node_modules | grep -v "osjs"

# Check for PascalCase files (in src/)
find packages -path "*/src/*" -name "[A-Z]*.js" | grep -v node_modules

# Check for lowercase constants (specific files)
grep -n "const [a-z][a-zA-Z]*Map = " packages/desktop-server/src/middleware/rate-limit.js
grep -n "const [a-z][a-zA-Z]*State = " packages/desktop-server/src/routes/storage-observer.js

# Run tests
npm test --workspaces
```

---

## Git Workflow

```bash
# Create feature branch
git checkout -b fix/naming-conventions

# For each phase:
git add .
git commit -m "fix: [phase description]"

# Before pushing, verify:
npm run lint  # if configured
npm test      # run all tests
git log --oneline -5  # verify commits

# Push
git push origin fix/naming-conventions

# Create PR for review
```

---

## Files by Dependency/Impact

### High Dependency (Many Imports)
- `sequential-adaptor` exports (many consumers)
- `sequential-logging` (used everywhere)
- `desktop-api-client` (public API)

**Recommendation**: Do these in separate commits, with thorough testing

### Low Dependency (Few Imports)
- `error-handling` functions (2-3 call sites)
- `storage-observer` constants (1 file, internal)
- `response-formatting` functions (2-3 call sites)

**Recommendation**: Can batch these changes together

---

## Checklist for Completion

- [ ] Phase 1: All 8 files renamed and imports updated
- [ ] Phase 1 testing: `npm test` in affected packages
- [ ] Phase 2: All 27 constant occurrences renamed
- [ ] Phase 2 testing: `npm test` in affected packages
- [ ] Phase 3: All 4 functions renamed and call sites updated
- [ ] Phase 3 testing: `npm test` in affected packages
- [ ] Phase 4: All 14 exports converted and imports updated
- [ ] Phase 4 testing: `npm test` across all packages
- [ ] Full test suite: `npm test --workspaces`
- [ ] Code review: Team reviews all changes
- [ ] Merge: PR approved and merged to main
- [ ] Cleanup: Delete feature branch

---

**Last Updated**: December 1, 2025
**Total Files to Change**: 28 source files
**Total Changes**: 53+ modifications
**Estimated Total Time**: 7-10 hours
**Recommended Approach**: Staged phases with testing between each
