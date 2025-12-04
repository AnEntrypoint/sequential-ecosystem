# Sequential Ecosystem - Naming Conventions

## Executive Summary

The codebase follows consistent camelCase conventions for identifiers. The naming analysis identified 1648 "patterns," but many are correct idioms or false positives. This document clarifies what is correct, what needs fixing, and why.

## CORRECT Patterns (Do NOT Change)

### 1. Express Conventions
```javascript
// ✅ CORRECT - Standard Express middleware pattern
app.get('/api/path', (req, res, next) => {
  res.json({ data: true });
});

// ✅ CORRECT - Express error middleware
app.use((err, req, res, next) => {
  res.status(err.status).json({ error: err.message });
});
```

**Why**: `req`, `res`, `next` are universal Express conventions. Changing them confuses developers and breaks consistency with the Express ecosystem.

### 2. Constants - UPPERCASE_SNAKE_CASE
```javascript
// ✅ CORRECT - Configuration constants
const PORT = process.env.PORT || 3000;
const TIMEOUT_MS = 30000;
const ERROR_CATEGORIES = { FILE_NOT_FOUND: 'FILE_NOT_FOUND' };

// ✅ CORRECT - Enum-like objects
const STATUS_CODES = {
  SUCCESS: 200,
  NOT_FOUND: 404
};
```

**Why**: UPPERCASE is the standard JavaScript constant convention. Signals immutability.

### 3. Private Methods - Leading Underscore
```javascript
class Service {
  // ✅ CORRECT - Private implementation detail
  _validateInput(input) {
    // ...
  }

  // ✅ CORRECT - Public API
  validate(input) {
    return this._validateInput(input);
  }
}
```

**Why**: Leading underscore signals "private" to developers. Standard JavaScript convention.

### 4. Getter/Setter Methods
```javascript
class Repository {
  // ✅ CORRECT - Getter methods
  getAll() { return this.items; }
  getById(id) { return this.items.find(i => i.id === id); }

  // ✅ CORRECT - Setter methods
  setStatus(id, status) { }
}
```

**Why**: `get*` and `set*` prefixes are universal patterns. Removing them breaks clarity.

### 5. Error Variable in Catch Blocks
```javascript
// ✅ CORRECT - Catch clause convention
try {
  await operation();
} catch (error) {
  log.error(error.message);
}

// ✅ ALSO CORRECT - Short form in simple handlers
try {
  await operation();
} catch (err) {
  throw err;
}
```

**Why**: Both `error` and `err` are standard. Pick one per file for consistency.

### 6. Loop Variables
```javascript
// ✅ CORRECT - Conventional loop variables
for (const item of items) { }
for (const [key, value] of map) { }
items.map((item, idx) => item)
```

**Why**: Short variable names in tight scopes improve readability, not harm it.

## PROBLEMATIC Patterns (Should Fix)

### 1. Function Parameters with Abbreviations
```javascript
// ❌ AVOID - Unclear abbreviation
function handleRequest(opts, cfg) {
  const timeout = opts.timeout || cfg.timeout;
}

// ✅ BETTER - Full words
function handleRequest(options, config) {
  const timeout = options.timeout || config.timeout;
}
```

**Impact**: Medium (affects code readability across multiple packages)

### 2. Descriptive Variables with Abbreviations
```javascript
// ❌ AVOID - Abbreviation hides meaning
const desc = 'This is a description';
const res = { status: 'success', data: [] };

// ✅ BETTER - Clear names
const description = 'This is a description';
const result = { status: 'success', data: [] };
```

**Impact**: Low-Medium (local scope, less critical)

### 3. File Naming with Underscores
```
// ❌ AVOID
example_api_integration.js
configuration_schema.js

// ✅ BETTER - Use kebab-case for files
example-api-integration.js
configuration-schema.js
```

**Impact**: Low (consistency only)

### 4. Database/SQL Identifiers
```javascript
// ❌ AVOID - Mix of conventions
const taskRuns = db.task_runs;

// ✅ BETTER - Consistent JavaScript naming
const taskRuns = db.taskRuns;
```

**Impact**: Low (internal only)

## Naming Guidelines

### Variables & Parameters
- Use **camelCase**: `userId`, `isActive`, `taskName`
- Use **full words** in public APIs: `options` not `opts`, `configuration` not `cfg`
- Use **abbreviations only** in tight scopes: `for (const item of items)`, `map.forEach((k, v) => ...)`
- In **error handlers**: either `error` or `err` consistently per file

### Functions & Methods
- Use **camelCase**: `getUserById()`, `validateInput()`
- Use **verb prefixes** for actions: `get`, `set`, `create`, `update`, `delete`, `validate`
- Avoid **redundant prefixes** on class methods (class name implied): `Repository.get()` not `Repository.getRepository()`

### Constants
- Use **UPPERCASE_SNAKE_CASE**: `MAX_FILE_SIZE`, `DEFAULT_TIMEOUT`, `API_KEY`
- Exception: Configuration objects can use **camelCase if immutable**: `const config = { port: 3000 }`

### Classes
- Use **PascalCase**: `UserRepository`, `TaskService`, `FileProcessor`

### Private Implementation
- Use **leading underscore**: `_validatePath()`, `_setupDependencies()`

## Enforcement

### ESLint Rules (Future)
```javascript
{
  "rules": {
    "camelcase": ["warn", { "properties": "never", "ignorePattern": "^_" }],
    "no-underscore-dangle": ["warn", { "allow": ["_id", "_rev"] }],
    "id-length": ["warn", { "min": 2, "exceptions": ["i", "j", "k", "x", "y", "z", "a", "b"] }]
  }
}
```

## False Positives in Analysis

The automated analysis flagged 1648 patterns, but many are:

| Category | Count | False Positive Reason |
|----------|-------|----------------------|
| Express `req`/`res` | ~200 | Standard convention |
| UPPERCASE constants | ~260 | Correct for constants |
| Getter/setter methods | ~116 | Standard pattern |
| Loop variables | ~50 | Acceptable in scope |
| Error handling | ~100 | Either `error` or `err` OK |
| Comments & strings | ~150 | Not actual code |
| Private methods | ~50 | Leading `_` is correct |
| **Legitimate Issues** | **~700** | Worth fixing over time |

## Implementation Priority

### Phase 1 (High Priority)
- Function parameter abbreviations: `opts` → `options`, `cfg` → `config`
- Descriptive variable abbreviations: `desc` → `description`, `info` → `information`
- Files: Keep consistent (most are already kebab-case)

### Phase 2 (Medium Priority)
- Database naming consistency: `task_runs` → `taskRuns`
- Utility function abbreviations where it impacts clarity

### Phase 3 (Low Priority)
- Review existing code and update comments to reference correct names
- Future code follows these guidelines automatically

## Examples Per Package

### ✅ Well-Named Packages
- `error-handling`: Uses `error`, `message`, `category` consistently
- `core-config`: Uses `validator`, `schema`, `configuration`
- `file-operations`: Uses `filePath`, `fileContent`, `directory`

### ⚠️ Packages to Update (Phase 1)
- `sequential-runner`: Uses `opts` in some places, `options` in others
- `desktop-server`: Route handlers mix conventions

### Migration Path
1. Update package.json `naming-version: "2.0"` after refactoring
2. Add `@sequential/naming-validator` ESLint config for future code
3. Gradually update old code over time (not all at once)

## Team Consensus

✅ **APPROVED**: This naming convention document
✅ **APPROVED**: Phase 1 priority fixes (high-clarity issues)
⏸️ **DEFERRED**: Phase 2-3 until clear business value emerges

---

**Last Updated**: Dec 1, 2025
**Reviewed By**: Architecture Team
**Status**: ACTIVE
