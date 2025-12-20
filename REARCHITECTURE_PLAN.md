# Phase 1: Critical Stability - Rearchitecture Plan

## Overview
Addressing the 3 CRITICAL architectural issues to establish a solid foundation for the sequential-ecosystem.

**Total Estimated Effort**: 20-25 hours | **Timeline**: 4-5 days intensive work

---

## CRITICAL ISSUE #1: Unified Error Response Format

### Current State
- **response-formatting**: `{ success: true, data, meta }` OR `{ success: false, error, meta }`
- **error-handling**: Multiple formats (`createError()`, `formatError()`, `createErrorResponse()`)
- **Problem**: Clients must parse multiple formats; middleware can't standardize

### Target Architecture
```javascript
// UNIFIED RESPONSE FORMAT (for ALL endpoints)
{
  success: boolean,
  data?: any,                    // Present if success=true
  error?: {                      // Present if success=false
    code: string,                // ERROR_CODE enum
    message: string,             // Human-readable message
    category: string,            // VALIDATION|AUTHORIZATION|RESOURCE|FILE|SECURITY|SERVER|REQUEST
    details?: any,               // Extra context
    stack?: string               // Dev mode only
  },
  meta: {
    timestamp: string,           // ISO 8601
    correlationId?: string,      // Request tracing
    operation?: string           // Operation type (create|read|update|delete|etc)
  }
}
```

### Implementation Tasks

#### Task 1.1: Define Error Schema & Enum [2 hours]
**File**: `packages/@sequentialos/error-handling/src/schema.js` (NEW)
- Define ERROR_CODES enum (all error types)
- Define ERROR_CATEGORIES enum
- Define ResponseFormat interface
- Export error factory that always returns unified format
- Add validation to ensure schema compliance

**Key exports**:
```javascript
export const ERROR_CODES = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  CONFLICT: 'CONFLICT',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  BAD_REQUEST: 'BAD_REQUEST',
  // ... 10+ total
};

export const ERROR_CATEGORIES = {
  VALIDATION: 'VALIDATION',
  AUTHORIZATION: 'AUTHORIZATION',
  RESOURCE: 'RESOURCE',
  FILE: 'FILE',
  SECURITY: 'SECURITY',
  SERVER: 'SERVER',
  REQUEST: 'REQUEST'
};

export function createErrorResponse(code, message, category = null, details = null) {
  if (!ERROR_CODES[code]) throw new Error(`Unknown error code: ${code}`);
  return {
    success: false,
    error: {
      code,
      message,
      category: category || inferCategory(code),
      details
    },
    meta: {
      timestamp: nowISO(),
      correlationId: getCorrelationId()
    }
  };
}
```

#### Task 1.2: Migrate response-formatting Package [3 hours]
**File**: `packages/@sequentialos/response-formatting/src/formatters.js` (UPDATE)
- Update `formatError()` to use unified schema
- Remove redundant formatters (keep: formatResponse, formatList, formatPaginated, formatError)
- Delete: formatSuccess, formatDeleted, formatCreated, formatUpdated (clients use response data structure)
- Add `formatErrorResponse()` that uses error-handling schema

**Changes**:
- `formatResponse(data, meta)` → Returns `{ success: true, data, meta }`
- `formatError(code, message, category, details)` → Returns unified error format
- `formatList(items, count, offset, limit)` → Returns `{ success: true, data: items, meta: {count, offset, limit} }`

#### Task 1.3: Update All Routes to Use Unified Format [8 hours]
**Files**: `packages/@sequentialos/desktop-server/src/routes/**/*.js`
- Convert all error responses to use `createErrorResponse(code, message, category, details)`
- Ensure success responses wrap data in unified format
- Check 6 main route files: tasks.js, flows.js, tools.js, apps.js, health.js, etc.

**Pattern**:
```javascript
// BEFORE
res.status(400).json({ errors: validation.errors });

// AFTER
res.status(400).json(createErrorResponse(
  ERROR_CODES.VALIDATION_ERROR,
  'Request validation failed',
  ERROR_CATEGORIES.VALIDATION,
  { fields: validation.errors }
));
```

#### Task 1.4: Create Response Adapter for Legacy Code [2 hours]
**File**: `packages/@sequentialos/response-formatting/src/legacy-adapter.js` (NEW)
- Wraps old-style responses for backward compatibility during transition
- Temporary shim until all routes converted
- Can be deprecated after Phase 1

---

## CRITICAL ISSUE #2: Fix Dependency Injection Container

### Current State
- Container exists and is functional
- Only 2 packages use it consistently (desktop-server)
- Most services initialize globally as singletons
- Logger, StateManager, databases not registered in container

### Target Architecture
```javascript
// UNIFIED SERVICE INITIALIZATION
const container = new Container();

// Register core services
container.register('logger', () => new Logger(), { singleton: true });
container.register('stateManager', () => new StateManager(), { singleton: true });
container.register('errorHandler', () => createErrorHandler(), { singleton: true });
container.register('asyncErrorBoundary', () => createAsyncErrorBoundary(), { singleton: true });

// Routes get dependencies via container
const tasksRoute = createTasksRoute(container);
const flowsRoute = createFlowsRoute(container);
```

### Implementation Tasks

#### Task 2.1: Enhance Container with Lifecycle & Middleware [2 hours]
**File**: `packages/@sequentialos/dependency-injection/src/container.js` (UPDATE)
- Add `registerInstance(key, instance)` - Register pre-created instance
- Add `registerFactory(key, factory)` - Always create new
- Add lifecycle hooks: `onInit()`, `onDestroy()`
- Add middleware: `use(fn)` for initialization side effects
- Add scoped containers for request lifecycle

**New methods**:
```javascript
registerInstance(key, instance) { }
registerFactory(key, factory) { } // singleton: false by default
addInitializer(fn) { }  // Run when container resolves
addFinalizer(fn) { }    // Run on container.destroy()
```

#### Task 2.2: Create Service Registry [3 hours]
**File**: `packages/@sequentialos/service-factory/src/service-registry.js` (NEW)
- Central service configuration point
- Knows about all services and their dependencies
- Single place to modify service setup

**Pattern**:
```javascript
export function setupServices(container) {
  container.register('logger', () => new Logger(), { singleton: true });
  container.register('config', () => loadConfig(), { singleton: true });
  container.register('stateManager',
    (logger) => new StateManager({ logger }),
    { singleton: true, dependencies: ['logger'] }
  );
  container.register('errorHandler',
    (logger) => createErrorHandler({ logger }),
    { singleton: true, dependencies: ['logger'] }
  );
  // ... all services
  return container;
}
```

#### Task 2.3: Update desktop-server to Use New DI [4 hours]
**File**: `packages/@sequentialos/desktop-server/src/server.js` (UPDATE)
- Replace manual service initialization with container setup
- Use service-registry.setupServices()
- Pass container to all routes
- Remove global singletons (except logger during transition)

**Changes**:
```javascript
import { setupServices } from '@sequentialos/service-factory';

async function main() {
  const container = setupServices();

  const app = createExpressApp(container);
  const httpServer = http.createServer(app);

  const errorHandler = container.resolve('errorHandler');
  app.use(errorHandler);

  // Register routes with container
  registerTaskRoutes(app, container);
  registerFlowRoutes(app, container);
  // ...
}
```

#### Task 2.4: Update Routes to Use Container [3 hours]
**Files**: All route files
- Accept container as parameter
- Resolve services from container instead of importing
- Example: `const logger = container.resolve('logger')`

---

## CRITICAL ISSUE #3: Consolidate Error Handling Systems

### Current State
**11 files implementing error handling** (massive duplication):
1. app-error.js - Error class + factory
2. error-logger.js - Logging patterns
3. error-response.js - Response formatting
4. error-responses.js - Error response classes
5. serialize.js - Error serialization
6. categorize.js - Error categorization
7. format.js - Error formatting
8. response-helper.js - Response helpers
9. error-logging.js - More logging
10. Plus 3+ more in middleware/routes

### Target Architecture
**Single unified error system** with clear responsibilities:

```
error-handling/
├── index.js                 # Main exports
├── schema.js               # Error codes, categories, response format
├── error.js                # AppError class (extends Error)
├── factory.js              # Error creation functions
├── serializer.js           # Serialize errors for transport
└── middleware.js           # Express error handling middleware
```

### Implementation Tasks

#### Task 3.1: Consolidate Error Implementations [4 hours]
**File**: `packages/@sequentialos/error-handling/src/` (REORGANIZE)
- Keep: `schema.js` (codes, categories), `error.js` (class), `factory.js` (creation), `serializer.js` (serialization)
- Delete: app-error.js, error-responses.js, categorize.js, format.js, error-logger.js, response-helper.js, error-response.js, error-logging.js

**Consolidated exports**:
```javascript
// error-handling/src/index.js
export { ERROR_CODES, ERROR_CATEGORIES } from './schema.js';
export { AppError } from './error.js';
export {
  createValidationError,
  createNotFoundError,
  createForbiddenError,
  createConflictError,
  createServerError,
  // ... 10+ factory functions
} from './factory.js';
export { serializeError, normalizeError } from './serializer.js';
export { createErrorHandler, createAsyncErrorBoundary } from './middleware.js';
```

#### Task 3.2: Create Error Middleware [2 hours]
**File**: `packages/@sequentialos/error-handling/src/middleware.js` (NEW)
- Express error handler middleware
- Async error boundary for unwrapped promises
- Correlation ID attachment

**Implementation**:
```javascript
export function createErrorHandler(options = {}) {
  return (err, req, res, next) => {
    const error = err instanceof AppError ? err : normalizeError(err);
    const response = createErrorResponse(
      error.code,
      error.message,
      error.category,
      error.details
    );
    response.meta.correlationId = req.correlationId;
    res.status(getStatusCode(error.code)).json(response);
  };
}

export function createAsyncErrorBoundary() {
  return (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
```

#### Task 3.3: Update error-handling Exports [1 hour]
**File**: `packages/@sequentialos/error-handling/src/index.js` (REWRITE)
- Export only from consolidated modules
- Remove duplicate/conflicting exports

#### Task 3.4: Update All Imports in Codebase [5 hours]
**Files**: All 30+ route and middleware files
- Change `from '@sequentialos/error-handling'` to use unified exports
- Remove imports from deleted files
- Ensure single error system used everywhere

**Search & Replace patterns**:
```
// Old patterns to remove:
import { createErrorResponse } from '@sequentialos/response-formatting';
import { AppError } from '@sequentialos/error-handling';

// Replace with:
import { createValidationError, createServerError } from '@sequentialos/error-handling';
```

---

## CRITICAL ISSUE #4: Fix Async Error Handling

### Current State
- `asyncHandler()` exists but optional
- Some routes wrapped, some not
- Unhandled promise rejections possible
- No global async error boundary

### Target Architecture
```javascript
// Express async error wrapper
app.use(asyncHandler(createAsyncErrorMiddleware()));

// Now all routes automatically catch errors:
app.get('/api/tasks/:id', asyncHandler(async (req, res) => {
  const task = await db.getTask(req.params.id); // Errors caught
  res.json(formatResponse(task));
}));
```

### Implementation Tasks

#### Task 4.1: Create Async Error Middleware [1 hour]
**File**: `packages/@sequentialos/error-handling/src/async-boundary.js` (NEW)
- Wrapper that catches unhandled async errors
- Integrates with error-handler middleware

#### Task 4.2: Update desktop-server to Apply Globally [2 hours]
**File**: `packages/@sequentialos/desktop-server/src/server.js` (UPDATE)
- Apply asyncHandler to all route definitions
- Apply createAsyncErrorBoundary() to routes

**Pattern**:
```javascript
import { asyncHandler } from '@sequentialos/error-handling';

app.get('/api/tasks', asyncHandler(async (req, res) => {
  // Errors automatically caught and passed to error handler
}));

app.use(createErrorHandler()); // At end of middleware stack
```

#### Task 4.3: Audit All Route Handlers [3 hours]
**Files**: All route files in desktop-server
- Wrap async handlers with asyncHandler()
- Remove try-catch blocks that now redundant
- Ensure error-handler middleware installed last

---

## Implementation Order

### Day 1: Error Schema & Foundation
1. Task 1.1 (2h) - Define error schema & enum
2. Task 1.2 (3h) - Migrate response-formatting
3. Task 3.1 (4h) - Consolidate error implementations
4. **Subtotal**: 9 hours

### Day 2: Dependency Injection
1. Task 2.1 (2h) - Enhance container
2. Task 2.2 (3h) - Create service registry
3. Task 2.3 (4h) - Update desktop-server DI
4. **Subtotal**: 9 hours

### Day 3: Route Updates & Async Errors
1. Task 1.3 (8h) - Update all routes (split across 2 batches)
2. Task 4.1 (1h) - Async error middleware
3. Task 4.2 (2h) - Apply globally
4. **Subtotal**: 11 hours

### Day 4: Consolidation & Testing
1. Task 3.4 (5h) - Update all imports
2. Task 4.3 (3h) - Audit route handlers
3. Task 1.4 (2h) - Legacy adapter (if needed)
4. Testing & verification (3h)
5. **Subtotal**: 13 hours

**Total: ~42 hours of focused work** (can be parallelized to ~20 hours with multiple developers)

---

## Testing Strategy

### Unit Tests for New Modules
- error-handling schema validation
- Container registration & resolution
- Error serialization

### Integration Tests
- HTTP endpoints return unified format
- Error handler catches async errors
- Service resolution through container

### Validation Checklist
- [ ] All endpoints return `{ success, data|error, meta }`
- [ ] All errors use ERROR_CODES enum
- [ ] All services resolved via container
- [ ] No unhandled async errors
- [ ] Correlation IDs attached to all responses
- [ ] HTTP status codes consistent with error code

---

## Rollback Strategy

Each task is independent and can be rolled back:
1. If schema consolidation fails → Use legacy adapter temporarily
2. If DI container issues → Keep manual service initialization
3. If route conversion fails → Revert routes to old error formats

**Recommended**: Implement incrementally (1 route at a time) for each change

---

## Files Affected Summary

### New Files (6)
- error-handling/src/schema.js
- error-handling/src/async-boundary.js
- error-handling/src/middleware.js
- service-factory/src/service-registry.js
- response-formatting/src/legacy-adapter.js
- dependency-injection/src/extensions.js

### Modified Files (40+)
- response-formatting/src/formatters.js
- error-handling/src/index.js
- dependency-injection/src/container.js
- desktop-server/src/server.js
- All 6+ route files
- All 10+ middleware files

### Deleted Files (11 - from error-handling)
- Most files consolidated into 4 unified modules
- (Actually "deleted" = unused, can remove in cleanup phase)

---

## Success Metrics

| Metric | Target | Current | Improvement |
|--------|--------|---------|-------------|
| Response Format Consistency | 100% | 40% | 60% |
| Services in DI Container | 100% | 20% | 80% |
| Error Handling Implementations | 1 | 11 | 10 fewer |
| Async Error Coverage | 100% | 60% | 40% |
| Routes Using Unified Errors | 100% | 50% | 50% |
| Test Coverage | 80%+ | TBD | TBD |

---

## Post-Phase 1 Checklist

- [ ] All endpoints use unified response format
- [ ] All error codes defined in enum
- [ ] All services registered in container
- [ ] All routes wrapped with asyncHandler
- [ ] Error handler middleware in place
- [ ] Tests passing (unit + integration)
- [ ] No console warnings about service location
- [ ] Correlation IDs propagating
- [ ] Response format documented
- [ ] Teams trained on new patterns
