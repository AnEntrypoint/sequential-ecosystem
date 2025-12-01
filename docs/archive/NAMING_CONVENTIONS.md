# Naming Conventions

Complete naming standards for the sequential-ecosystem codebase. All contributors must follow these conventions.

## Core Principles

- **Clarity over brevity**: Prefer `currentDirectory` over `curDir`
- **Consistency**: Same concept = same name everywhere
- **Intention revealing**: Names should explain "why", not just "what"
- **No abbreviations**: Exception: i, j (loops), err (errors), fs (filesystem)
- **Language**: English only (variable names, comments, documentation)

---

## File Naming

**Standard**: `kebab-case` for all files

### Files
```javascript
// Good
sequential-os-client.js
vfs-client.js
error-factory.js
task-executor.js
rate-limit.js

// Bad (DO NOT USE)
SequentialOSClient.js        // PascalCase
VFSClient.js                 // PascalCase
ErrorFactory.js              // PascalCase
sequentialOSClient.js        // camelCase
sequential_os_client.js      // snake_case
```

### Benefits
- Consistent with npm package names and Git defaults
- Compatible with all filesystems (case-sensitive and case-insensitive)
- Easier to find files in terminal (tab completion works better)
- Matches ES module import conventions

### Special Cases

**Configuration files**: Also `kebab-case` (unless framework-specific)
```javascript
// Good
config/defaults.js          // Configuration
jest.config.js              // Framework-specific, follows Jest convention
webpack.config.js           // Framework-specific, follows Webpack convention

// Bad
config/Defaults.js
config.json                 // Not descriptive enough
```

**Test files**: Use `.test.js` or `.spec.js` suffix
```javascript
// Good
user-service.test.js
task-executor.spec.js
error-handling.test.js

// Bad
user-service-test.js        // Less conventional
UserServiceTest.js          // PascalCase
userServiceTest.js          // camelCase
```

**Linting Config** (`.eslintrc.cjs`, `.prettierrc.json`)
- Follows tool conventions, not kebab-case
- Exception to the rule for framework compatibility

---

## Directory Naming

**Standard**: `kebab-case` for all directories

### Examples
```
packages/
  data-access-layer/              ✅ kebab-case
  task-execution-service/         ✅ kebab-case
  desktop-server/                 ✅ kebab-case
  desktop-ui-components/          ✅ kebab-case
  sequential-adaptor/             ✅ kebab-case
  sequential-adaptor-sqlite/      ✅ kebab-case
  error-handling/                 ✅ kebab-case
  sequential-logging/             ✅ kebab-case
  websocket-factory/              ✅ kebab-case
  sequential-wrapped-services/    ✅ kebab-case

  DatabaseAdaptor/                ❌ PascalCase
  TaskExecutionService/           ❌ PascalCase
  DesktopServer/                  ❌ PascalCase
```

### Internal Structure
```
packages/my-package/
  src/                            ✅ Standard source directory
  lib/                            ✅ Alternative for libraries
  tests/ or test/                 ✅ Tests directory
  __tests__/                      ✅ Jest convention
  dist/                           ✅ Build output
  scripts/                        ✅ Build/automation scripts
```

---

## Class Naming

**Standard**: `PascalCase` for classes (already compliant)

### Examples
```javascript
// Good - Class definitions
export class TaskRepository { }
export class FileStore { }
export class WebSocketBroadcaster { }
export class SequentialOSClient { }
export class VFSClient { }
export class ErrorFactory { }
export class RateLimitMiddleware { }

// Consistency
export class TaskService { }
export class FlowService { }
export class RunService { }

// Bad
export class taskRepository { }           // camelCase
export class task_repository { }          // snake_case
export class task-repository { }          // kebab-case
```

### Naming Rules for Classes
- **Single responsibility**: Class name = single concept
- **Noun-based**: `TaskRepository` not `RepositoryTask`
- **No "Manager"**: Use specific names (`TaskService` not `TaskManager`)
- **No "Handler" unless event-based**: `ErrorFactory` not `ErrorHandler` (unless handling events)
- **Interface/Abstract naming**: Use `I` prefix or `Abstract` prefix (optional, context-dependent)

```javascript
// Good patterns
class TaskRepository { }        // Persistence of tasks
class TaskService { }           // Business logic
class TaskValidator { }         // Validation logic
class TaskFactory { }           // Creation/construction

// Avoid
class TaskManager { }           // Too vague
class TaskHelper { }            // Too vague
class TaskUtil { }              // Too vague
```

---

## Constants

**Standard**: `SCREAMING_SNAKE_CASE` for all constants

### Examples
```javascript
// Good
const MAX_RETRIES = 3;
const RATE_LIMIT_MAP = new Map();
const WS_CONNECTION_MAP = new Map();
const DEFAULT_TIMEOUT_MS = 5000;
const DATABASE_URL = process.env.DATABASE_URL;
const CONFIG = { timeout: 5000, retries: 3 };
const STORAGE_STATE = { ... };

// Bad
const maxRetries = 3;            // camelCase
const max_retries = 3;           // snake_case
const MaxRetries = 3;            // PascalCase
```

### When to Use SCREAMING_SNAKE_CASE
1. **Compile-time constants**: `const MAX_USERS = 100;`
2. **Global configuration**: `const DATABASE_URL = ...;`
3. **Enums/lookup maps**: `const STATUS_CODES = { ... };`
4. **Regular expressions**: `const EMAIL_REGEX = /^[^@]+@[^@]+$/;`
5. **Magic numbers**: `const CHUNK_SIZE = 1024 * 1024;`

### When NOT to Use SCREAMING_SNAKE_CASE
1. **Class/function fields**: `this.maxRetries = 3;` (camelCase)
2. **Variables in functions**: `const maxRetries = 3;` (camelCase)
3. **Import bindings**: `import { createClient } from 'sdk';` (keep original naming)

### Rules
- Module-level constants: `SCREAMING_SNAKE_CASE`
- Instance/local variables: `camelCase`
- Object keys (unless exported): `camelCase`
- Exported enums: `SCREAMING_SNAKE_CASE`

---

## Function Naming

**Standard**: `camelCase` with semantic prefixes

### Semantic Prefixes
Functions should start with verbs that describe their action:

#### 1. `create*` - Factory Functions
Creates and returns new instances.

```javascript
// Good
createRateLimitMiddleware()
createTaskRepository()
createWebSocketBroadcaster()
createErrorResponse()
createFileStore()

// Bad
makeRateLimitMiddleware()           // Use "create" not "make"
buildRateLimitMiddleware()          // Use "create" not "build"
RateLimitMiddleware()               // Missing action verb (this is a class)
```

#### 2. `is*` / `has*` - Boolean Predicates
Returns true/false.

```javascript
// Good
isValidEmail()
isTaskRunning()
hasPermission()
hasCacheEntry()
isConnected()
isDirectory()

// Bad
validateEmail()                     // Use "is" for boolean return
checkIsValidEmail()                 // Redundant "check"
getIsRunning()                      // Use "is" not "get"
```

#### 3. `validate*` - Validation Functions
Validates input and throws or returns error.

```javascript
// Good
validateParam()
validateRequired()
validateType()
validateEmail()
validateInput()

// Bad
checkParam()                        // Use "validate" for input checking
isValidParam()                      // Use "validate" when mutation/error
validate()                          // Missing subject
```

#### 4. `format*` - Formatting/Serialization
Transforms data into a specific format.

```javascript
// Good
formatHttpResponse()
formatErrorMessage()
formatTimestamp()
formatJson()
formatCamelCase()

// Bad
toHttpResponse()                    // Use "format" prefix
createHttpResponse()                // Use "format" not "create"
httpResponse()                      // Missing action
```

#### 5. `get*` - Data Accessors
Retrieves/computes and returns value.

```javascript
// Good
getStatus()
getUserById()
getErrorCategory()
getStorageState()
getTaskHistory()

// Bad
fetchStatus()                       // Use "get" for simple access
queryUserById()                     // Use "get" when deterministic
status()                            // Missing action verb
```

#### 6. `handle*` - Event/Error Handlers
Responds to events or errors.

```javascript
// Good
handleRequest()
handleError()
handleWebSocketMessage()
handleTaskCompletion()
handleValidationError()

// Bad
onRequest()                         // Use "handle" for explicit handlers
processRequest()                    // Use "handle" for event response
request()                           // Missing action
```

### Additional Patterns

#### `fetch*` for HTTP/async operations
```javascript
// Good
fetchUserData()
fetchWithRetry()
fetchTaskStatus()

// Pattern: fetch* = async, may have retries
```

#### `calculate*` for computations
```javascript
// Good
calculateDelay()
calculateDuration()
calculateMetrics()

// Pattern: compute -> result (not data access)
```

#### `update*` for mutations
```javascript
// Good
updateTaskStatus()
updateStorageState()
updateCacheEntry()

// Pattern: modifies existing state
```

#### `clear*` for cleanup
```javascript
// Good
clearCache()
clearConnections()
clearErrorState()

// Pattern: removes/resets something
```

#### `process*` for data transformation
```javascript
// Good
processTaskCode()
processMetadata()
processResponse()

// Pattern: transform/pipe data through stages
```

---

## Variables and Parameters

**Standard**: `camelCase`, no abbreviations, self-documenting

### Good Examples
```javascript
// Good
const currentUserId = user.id;
const isAuthenticated = !!token;
const taskTimeout = 5000;
const requestHeaders = { ... };
const errorMessage = error.message;
const retryAttempt = 0;
const maxRetries = 3;

// Bad (abbreviations)
const uid = user.id;                // Abbreviation
const auth = !!token;               // Too short
const tmo = 5000;                   // Abbreviation
const hdrs = { ... };               // Abbreviation
const msg = error.message;          // Abbreviation
const att = 0;                      // Abbreviation

// Bad (unclear)
const x = user.id;                  // No meaning
const data = { ... };               // Too generic
const result = response.json();     // What kind of result?
```

### Parameter Naming
Same as variables - `camelCase`, descriptive:

```javascript
// Good
function createTask(taskName, taskConfig, timeoutMs) { }
function validateInput(input, schema, options) { }
function handleError(error, retryCount, context) { }

// Bad
function createTask(name, cfg, ms) { }              // Abbreviations
function validateInput(x, y, z) { }                 // No meaning
function handleError(e, c, ctx) { }                 // Unclear (e, c, ctx)
```

### Loop Variables Exception
Single-letter variables only for loops:

```javascript
// Good - loop indices
for (let i = 0; i < array.length; i++) { }
for (const [k, v] of map.entries()) { }

// Bad - not in loops
const e = error;                    // Use "error" not "e"
const u = user;                     // Use "user" not "u"
```

---

## Export Conventions

**Standard**: Named exports only (no default exports)

### Why Named Exports
1. **Explicit imports**: Clear what you're importing
2. **Refactoring safety**: Search/replace works reliably
3. **Tree-shaking**: Better for bundlers
4. **IDE support**: Better autocomplete
5. **Circular dependencies**: Easier to avoid

### Correct Pattern
```javascript
// Good - use named exports
export class TaskRepository { }
export class FlowService { }
export function createErrorResponse() { }
export const CONFIG = { };

// Import
import { TaskRepository, FlowService, createErrorResponse, CONFIG } from './module.js';

// Bad - default export
export default TaskRepository;      // ❌ Avoid
export default { TaskRepository };  // ❌ Avoid
export { default } from './module'; // ❌ Avoid

// Only use index re-exports
// In: src/index.js (OK)
export { TaskRepository } from './task-repository.js';
export { FlowService } from './flow-service.js';
```

### Index Files
Use index files ONLY for re-exporting:

```javascript
// Good - src/index.js
export { TaskRepository } from './repositories/task-repository.js';
export { FlowRepository } from './repositories/flow-repository.js';
export { TaskService } from './services/task-service.js';
export { createDependencyContainer } from './di/container.js';

// Import
import { TaskRepository, TaskService } from '@sequential/data-access-layer';
```

### No Mixed Exports
```javascript
// Bad - mixing named and default
export const TaskRepository = class { };
export default TaskRepository;      // Confusing

// Bad - renaming on export
export { TaskRepository as default };
```

---

## Module System

**Standard**: ES6 (import/export)

### Import/Export Syntax
```javascript
// Good - ES6 named imports
import { TaskRepository } from './task-repository.js';
import { createErrorResponse } from './error-factory.js';
import { Logger } from '@sequential/logging';

// Good - namespace imports (when many exports)
import * as validators from './validators.js';

// Good - default imports for packages (rare)
import express from 'express';

// Bad - CommonJS
const { TaskRepository } = require('./task-repository.js');
module.exports = TaskRepository;

// Bad - mixing
import { TaskRepository } from './task-repository.js';
module.exports = { TaskRepository };
```

### Absolute Paths with Aliases (Optional)
If using `jsconfig.json` or `tsconfig.json`:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@test/*": ["test/*"],
      "@sequential/*": ["packages/*/src"]
    }
  }
}
```

```javascript
// Good
import { TaskRepository } from '@sequential/data-access-layer/src';
import { errorHandler } from '@/middleware/error-handler.js';

// Bad (relative)
import { TaskRepository } from '../../packages/data-access-layer/src';
```

---

## Comments vs. Naming

**Rule**: Use clear names instead of comments

### Wrong Approach
```javascript
// ❌ Bad - comment explains unclear code
const r = user.id;              // Return result
const att = 3;                  // Attempt count

// ❌ Bad - comment duplicates code
const isValid = email.includes('@');  // Check if email is valid
```

### Correct Approach
```javascript
// ✅ Good - clear names need no comment
const currentUserId = user.id;
const maxRetryAttempts = 3;

// ✅ Good - only comment when "why" is non-obvious
const maxConnectionPoolSize = 10;  // PostgreSQL connection limit per process
const SUSPENSE_TIMEOUT_MS = 30000; // Wait 30s before marking task as unresponsive
```

---

## Special Cases

### Acronyms
Treat as single word, capitalize first letter only:

```javascript
// Good
class SequentialOSClient { }       // OS = acronym, capitalize as "Os"
class VfsManager { }               // VFS = acronym, capitalize as "Vfs"
class HttpErrorFactory { }         // HTTP = acronym, capitalize as "Http"
class JsonParser { }               // JSON = acronym, capitalize as "Json"
class UrlValidator { }             // URL = acronym, capitalize as "Url"

// Bad
class SequentialOSclient { }       // Mixed case
class VFSManager { }               // All caps
class HTTPErrorFactory { }         // All caps
class JSONParser { }               // All caps
class URLValidator { }             // All caps
```

### Single Letter Variables
Only in narrow scopes:

```javascript
// Good - loop variables
for (let i = 0; i < 10; i++) { }
for (const [k, v] of entries) { }
for (const [key, value] of map.entries()) { }

// Bad - function parameters
function process(x, y, z) { }      // Meaningless
function handleError(e) { }         // Use full name
const e = error;                    // Use full name
```

### Private Fields
Use `#` prefix (ES2022):

```javascript
class TaskRepository {
  #database;                        // Private field
  #cache = new Map();               // Private with initializer

  constructor(db) {
    this.#database = db;            // Private
  }

  getTask(id) {
    return this.#database.get(id);  // Private access
  }
}
```

### Constants in Objects
Use `SCREAMING_SNAKE_CASE` for exported config:

```javascript
// Good - exported configuration
export const CONFIG = {
  MAX_RETRIES: 3,
  TIMEOUT_MS: 5000,
  RATE_LIMIT: { requests: 100, windowMs: 60000 }
};

// Good - object literal with camelCase keys
const options = {
  timeout: 5000,
  retries: 3,
  headers: { ... }
};
```

---

## Naming Checklist

Before submitting code, verify:

- [ ] **Files**: All files are `kebab-case` (e.g., `task-repository.js`)
- [ ] **Directories**: All directories are `kebab-case` (e.g., `src/repositories/`)
- [ ] **Classes**: All classes are `PascalCase` (e.g., `TaskRepository`)
- [ ] **Constants**: All module-level constants are `SCREAMING_SNAKE_CASE` (e.g., `MAX_RETRIES`)
- [ ] **Functions**: All functions use semantic prefixes and `camelCase` (e.g., `createErrorResponse()`)
- [ ] **Variables**: All variables are `camelCase`, no abbreviations (e.g., `currentUserId`)
- [ ] **Parameters**: All parameters are `camelCase`, descriptive (e.g., `taskName`, not `name`)
- [ ] **Exports**: Using named exports only, no default exports
- [ ] **Modules**: Using ES6 import/export (no CommonJS in new code)
- [ ] **Comments**: Only when "why" is non-obvious, not duplicating code
- [ ] **No ambiguity**: Every name should be unambiguous in its context

---

## Linting & Automation

### ESLint Configuration
Add to `.eslintrc.cjs`:

```javascript
module.exports = {
  rules: {
    'id-length': ['warn', { min: 2, exceptions: ['i', 'j', 'k', 'x', 'y', 'z'] }],
    'camelcase': ['error', { properties: 'always', ignoreDestructuring: false }],
    'no-const-assign': 'error',
    'no-unused-vars': 'warn',
    'prefer-const': 'error',
    'no-var': 'error',
  }
};
```

### Pre-commit Hook
Add to `.husky/pre-commit`:

```bash
#!/bin/sh
# Check naming conventions
npx eslint --fix packages/*/src --max-warnings 0
```

---

## Examples by Category

### Repository Classes
```javascript
✅ TaskRepository           // Persistence of tasks
✅ FlowRepository           // Persistence of flows
✅ ToolRepository           // Persistence of tools
✅ FileRepository           // Persistence of files
❌ TaskDB                   // Abbreviation
❌ TaskManager              // Too vague
```

### Service Classes
```javascript
✅ TaskService              // Business logic for tasks
✅ FlowService              // Business logic for flows
✅ ErrorService             // Error handling service
✅ CacheService             // Caching service
❌ TaskProcessor            // Use "Service" not "Processor"
❌ TaskManager              // Use "Service" not "Manager"
```

### Factory Functions
```javascript
✅ createTaskRepository()   // Creates repository instance
✅ createErrorResponse()    // Creates error response
✅ createRateLimitMiddleware() // Creates middleware
✅ createDependencyContainer() // Creates DI container
❌ TaskRepository()         // Missing "create"
❌ makeErrorResponse()      // Use "create" not "make"
```

### Boolean Functions
```javascript
✅ isValidEmail()           // Returns boolean
✅ hasPermission()          // Returns boolean
✅ isConnected()            // Returns boolean
✅ isDirectory()            // Returns boolean
❌ validateEmail()          // Returns error or throws
❌ checkPermission()        // Ambiguous return
```

### Validation Functions
```javascript
✅ validateParam()          // Throws or returns error
✅ validateRequired()       // Throws or returns error
✅ validateEmail()          // Throws or returns error
❌ isValidEmail()           // Wrong prefix for validation
❌ emailValidator()         // Missing "validate"
```

### Configuration
```javascript
✅ CONFIG                   // All caps for module constant
✅ DATABASE_URL             // All caps for env constant
✅ MAX_RETRIES              // All caps for magic number
✅ DEFAULT_TIMEOUT_MS       // All caps with unit suffix
❌ config                   // Not all caps
❌ databaseUrl              // Not all caps
```

---

## Migration Guide

### Files Requiring Rename
If you encounter these files, they need renaming:

| Current Name | Correct Name | Directory |
|---|---|---|
| SequentialOSClient.js | sequential-os-client.js | packages/desktop-api-client/src/ |
| VFSClient.js | vfs-client.js | packages/desktop-api-client/src/ |
| Button.js | button.js | packages/desktop-ui-components/src/components/ |
| FormGroup.js | form-group.js | packages/desktop-ui-components/src/components/ |
| ListItem.js | list-item.js | packages/desktop-ui-components/src/components/ |
| Sidebar.js | sidebar.js | packages/desktop-ui-components/src/components/ |
| Tabs.js | tabs.js | packages/desktop-ui-components/src/components/ |
| Toolbar.js | toolbar.js | packages/desktop-ui-components/src/components/ |

### Constants Requiring Rename
If you encounter these variables, rename to SCREAMING_SNAKE_CASE:

| Current Name | Correct Name | File |
|---|---|---|
| rateLimitMap | RATE_LIMIT_MAP | packages/desktop-server/src/middleware/rate-limit.js |
| wsConnectionMap | WS_CONNECTION_MAP | packages/desktop-server/src/middleware/rate-limit.js |
| storageState | STORAGE_STATE | packages/desktop-server/src/routes/storage-observer.js |

### Functions Requiring Prefix
If you encounter these functions, add semantic prefixes:

| Current Name | Correct Name | Type |
|---|---|---|
| categorizeError | getErrorCategory | Accessor |
| fetchWithRetry | retryFetch | Action verb |
| respondWith | formatHttpResponse | Format function |

---

## References

- [Google JavaScript Style Guide](https://google.github.io/styleguide/jsguide.html)
- [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript)
- [Node.js Best Practices](https://nodejs.org/en/docs/guides/simple-profiling/)
- [Clean Code by Robert C. Martin](https://www.amazon.com/Clean-Code-Handbook-Software-Craftsmanship/dp/0132350882)

---

**Last Updated**: December 1, 2025
**Status**: Active
**Maintained by**: Sequential Ecosystem Contributors
