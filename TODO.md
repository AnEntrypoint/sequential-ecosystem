# Architecture Refactoring Roadmap

This document tracks outstanding architectural improvements identified in the 2025-12-04 architecture assessment.

## Completed Items (DONE)
- Security: Removed eval() from tool-loader (JSON.parse replacement)
- Security: Added path traversal validation to sequential-os-http
- Cleanup: Deleted empty @sequential/error-responses package
- Documentation: Updated CLAUDE.md with assessment
- Documentation: Updated CHANGELOG.md with security improvements
- Consolidation: Fixed @sequential/error-handler to point to @sequential/error-handling (was pointing to desktop-server middleware)
- Consolidation: Verified @sequential/response-formatting properly points to response-formatting
- Analysis: Logging duplication (sequential-logging + operation-logger) - appropriately separated for different concerns
- Analysis: Validation duplication - sequential-validators, param-validation, request-validator serve different purposes (monad validators vs utilities vs middleware)
- Feature: Added POST /api/tools/register endpoint to tool-registry for app tool registration
- Architecture: UNIFIED Tool Registry Systems (ToolRepository + ToolRegistry)
  * Enhanced ToolRegistry to load persisted tools from ToolRepository on startup
  * Added ToolRegistry.saveTool(), deleteTool(), loadPersistedTools() methods
  * Persisted tools stored with '__persisted:' prefix in unified registry
  * Updated desktop-server to initialize ToolRegistry with repository via DI container
  * Consolidated routes: desktop-server/routes/tools.js now unified endpoint
  * Routes now support: GET /api/tools, GET /api/tools/by-app, GET /api/tools/search, GET /api/tools/stats
  * POST /api/tools for creating/persisting tools, DELETE /api/tools/:id for deletion
  * All tools (app-registered + persisted) accessible through unified interface
  * MCP generation enabled for all tools (persisted + app-registered)

## Priority 1: File Size Constraint Compliance (HIGH)
Target: Reduce 62 files from >200 lines to <200 lines
Estimated effort: 10-15 days of focused refactoring

### Wrapped Services (9 files >500 lines)
- [ ] deno-executor/index.ts (894L) - Split into: vm-executor, service-registry, http-handler
- [ ] service-registry.ts (839L) - Extract: discovery, communication, health-check
- [ ] simple-stack-processor/index.ts (821L) - Split: processor, db-locking, http-chaining
- [ ] database-service.ts (699L) - Extract: connection-pool, transactions, monitoring
- [ ] gapi/index.ts (686L) - Split: api-client, token-manager, request-handler
- [ ] base-service.ts (590L) - Extract: initialization, request-handling, response-formatting
- [ ] vm-state-manager.ts (555L) - Split: serialization, resumption, state-tracking
- [ ] logging-service.ts (492L) - Extract: formatting, transport, aggregation
- [ ] keystore/index.ts (436L) - Split: crypto, key-management, storage

### Test Files (6 files >300 lines)
- [ ] error-handling/tests/test-error-handling.js (530L) - Unit / Integration / Error codes
- [ ] sequential-storage-utils/test/test-storage-utils.js (483L) - Adapter / CRUD / Concurrency
- [ ] sequential-logging/test/test-logger.js (461L) - Format / Level / Transport
- [ ] sequential-utils/test/test-utils.js (432L) - String / Validation / Timing
- [ ] response-formatting/tests/test-response-formatting.js (366L) - By response type
- [ ] sequential-adaptor/test/test-adaptor.js (342L) - By adapter backend

### Other Large Files
- [ ] documentation-generator.js (602L) - Split generation concerns
- [ ] zellous/server.js (566L) - Separate initialization
- [ ] sequential-machine/test.js (466L) - Split test suites
- [ ] sequential-machine/cli-services.js (429L) - Extract service definitions
- [ ] server-utilities/test/phase7-queue-worker-pool.js (415L)
- [ ] server-utilities/test/phase8-task-scheduler.js (412L)

## Priority 2: Unified Real-Time Storage System (CRITICAL - IN PROGRESS)
Target: All data changes broadcast automatically through unified storage + real-time layer
Estimated effort: 6-8 hours

**Phase 1: StateManager Enhancement** - COMPLETE
- [x] Add EventEmitter to StateManager for change hooks
- [x] Emit 'created' event on new data
- [x] Emit 'updated' event on modifications
- [x] Emit 'deleted' event on removal
- [x] Create broadcast middleware that listens to StateManager events
- [x] Integrate broadcast middleware with RealtimeBroadcaster in server initialization

**Phase 2: Repository Consolidation** - PENDING
- [ ] Update all repositories to use StateManager exclusively
- [ ] Remove duplicate writes (file + cache)
- [ ] Ensure single write path through StateManager

**Phase 3: Routes Consistency** - PENDING
- [ ] flows.js - Add broadcasts for flow changes
- [ ] storage.js - Add broadcasts for app storage
- [ ] user-apps.js - Add broadcasts for app file changes

**Phase 4: Zellous Integration** - PENDING
- [ ] Migrate Zellous storage to use StateManager
- [ ] Real-time collaboration features automatic

**Result**: Zero manual broadcasts needed - all data changes auto-propagated

## Priority 2B: Dynamic React Components System (NEW)
Target: Buildless React with JSX stored as strings in storage adapter
Estimated effort: 8-10 hours

**Phase 1: Core Runtime** - COMPLETE
- [x] Create @sequential/dynamic-components package
- [x] Implement JSX parser using @babel/standalone
- [x] Build DynamicComponentRegistry for managing components
- [x] Create useDynamicComponent React hook
- [x] Add validation system for component definitions
- [x] Create comprehensive test suite
- [x] Full integration tested and build passes

**Phase 2: Storage Integration** - PENDING
- [ ] Create /api/components endpoints
- [ ] Add component storage routes to desktop-server
- [ ] Integrate StateManager for component persistence
- [ ] Real-time broadcasts on component changes

**Phase 3: App Integration** - PENDING
- [ ] Update AppSDK to load dynamic components
- [ ] Update app-editor to save/load components from storage
- [ ] Add visual editor support for component creation

**Result**: Apps store components as JSX strings, no build required, real-time sync automatic

## Priority 3: Tool Registry Auto-Registration (MEDIUM)
Target: Automatic tool registration when AppSDK initializes
Estimated effort: 2-3 days

- [x] Add POST /api/tools/register endpoint to tool-registry server.js - DONE
- [ ] Implement app registration hook on server startup
- [ ] Add tool() method to server-side AppSDK
- [ ] Generate MCP definitions on registration
- [ ] Update desktop-server to register built-in tools

## DETAILED REFACTORING IMPLEMENTATION GUIDE

### How to Split Large Files (Pattern)

Each large file should be split using the following pattern:

1. **Identify Concerns**: Group related functions by purpose
2. **Create Modules**: One module per concern, <200 lines each
3. **Create Index**: Export all public APIs from index.js
4. **Update Imports**: Replace old imports with new module paths
5. **Test**: Run `npm run build && npm run test` after each split
6. **Commit**: One commit per file split with clear message

### File Splitting Reference

#### CRITICAL (>800 lines)

**deno-executor/index.ts (894L)** → Split into:
- `vm-executor.ts` (250L): VM sandbox setup, executeCode(), serializeState()
- `service-registry.ts` (200L): Service discovery, service caching
- `http-handler.ts` (200L): /execute, /resume endpoints, request validation
- `index.ts` (120L): Main entry point, server initialization
- `utils.ts` (100L): Helper functions, formatResponse()

**service-registry.ts (839L)** → Split into:
- `registry-core.ts` (200L): ServiceRegistry class, registration logic
- `health-checks.ts` (180L): Health status tracking, health methods
- `communication.ts` (250L): Service-to-service call logic, retry logic
- `discovery.ts` (150L): Service discovery and caching
- `index.ts` (50L): Exports and initialization

**simple-stack-processor/index.ts (821L)** → Split into:
- `processor.ts` (250L): Process logic, FIFO ordering
- `database-locking.ts` (200L): Lock management, concurrency
- `http-chaining.ts` (180L): HTTP calls to services
- `handlers.ts` (120L): Request handlers
- `index.ts` (70L): Server setup

**database-service.ts (699L)** → Split into:
- `connection-pool.ts` (180L): Connection pooling
- `transaction-handler.ts` (150L): Transaction logic
- `query-executor.ts` (200L): Query execution, timeout
- `health-checks.ts` (100L): Database health checks
- `index.ts` (70L): Exports

**gapi/index.ts (686L)** → Split into:
- `auth-manager.ts` (180L): JWT generation, token management
- `api-client.ts` (220L): API request wrapper
- `credential-cache.ts` (120L): Token caching
- `handlers.ts` (120L): Request handlers
- `index.ts` (50L): Server setup

#### HIGH (500-800 lines)

**base-service.ts (590L)** → Split into:
- `base-service.ts` (150L): Core abstract class
- `service-errors.ts` (120L): Error classes and types
- `decorators.ts` (100L): @ServiceOperation decorator
- `health-checks.ts` (100L): Health check methods
- `index.ts` (50L): Exports

**vm-state-manager.ts (555L)** → Split into:
- `serialization.ts` (180L): VM state serialization
- `resumption.ts` (180L): State restoration logic
- `state-tracking.ts` (120L): Execution tracking
- `index.ts` (75L): Exports

**logging-service.ts (492L)** → Split into:
- `logger.ts` (150L): Logger class
- `formatters.ts` (120L): JSON/text formatting
- `context.ts` (100L): Request context management
- `perf-utils.ts` (80L): Performance timing
- `index.ts` (50L): Exports

#### MEDIUM (300-500 lines)

**keystore/index.ts (436L)** → Split into:
- `crypto.ts` (120L): Encryption/decryption
- `storage.ts` (150L): Supabase storage
- `handlers.ts` (120L): Request handlers
- `index.ts` (50L): Server setup

**http-client.ts (431L)** → Split into:
- `http-client.ts` (180L): Main HTTP client
- `retry-logic.ts` (120L): Retry with backoff
- `flow-state.ts` (90L): FlowState integration
- `index.ts` (50L): Exports

**sequential-machine/cli-services.ts (429L)** → Split into:
- `services.ts` (250L): Service definitions
- `generators.ts` (150L): Service generation
- `index.ts` (30L): Exports

**phase7-queue-worker-pool.js (415L)** → Split into:
- `worker-pool.ts` (180L): Pool management
- `task-execution.ts` (180L): Task execution
- `index.ts` (55L): Exports

**phase8-task-scheduler.js (412L)** → Split into:
- `scheduler.ts` (200L): Scheduling logic
- `queue-management.ts` (180L): Queue operations
- `index.ts` (30L): Exports

#### TEST FILES (300-500 lines)

**error-handling/tests/test-error-handling.js (530L)** → Split into:
- `test-error-classes.js` (180L): SerializedError, ValidationError tests
- `test-error-handling.js` (200L): Error utility tests
- `test-integration.js` (150L): Integration tests

**sequential-storage-utils/test/test-storage-utils.js (483L)** → Split into:
- `test-adapter-interface.js` (150L)
- `test-crud-operations.js` (180L)
- `test-concurrency.js` (150L)

**sequential-logging/test/test-logger.js (461L)** → Split into:
- `test-logger-functionality.js` (180L)
- `test-formatting.js` (150L)
- `test-context.js` (130L)

**sequential-utils/test/test-utils.js (432L)** → Split into:
- `test-string-utils.js` (150L)
- `test-validators.js` (150L)
- `test-timing-utils.js` (130L)

**response-formatting/tests/test-response-formatting.js (366L)** → Split into:
- `test-success-responses.js` (180L)
- `test-error-responses.js` (180L)

**sequential-adaptor/test/test-adaptor.js (342L)** → Split into:
- `test-folder-adapter.js` (150L)
- `test-sqlite-adapter.js` (150L)
- `test-adapter-interface.js` (42L)

### Implementation Steps (in Order)

1. Choose a large file from list above
2. Read entire file (use offset/limit if >500L)
3. Identify logical concerns/sections
4. Create new module files for each concern
5. Move functions/classes to new modules
6. Create index.js with exports
7. Update all imports in codebase (grep for old path)
8. Run `npm run build` and verify success
9. Run `npm run test` and verify all pass
10. Commit with message: `refactor: split [filename] into separate modules`
11. Move to next file

### Build & Test Commands

```bash
# Build verification
npm run build

# Test verification
npm run test

# Search for imports to update
grep -r "import.*filename" packages --include="*.js" --include="*.ts"

# After each split
git add -A && git commit -m "refactor: split [module] into separate modules"
```

### Key Principles for Splitting

- Keep each module <200 lines
- One responsibility per module
- Use clear, descriptive names
- Maintain public API in index.js
- Don't break external imports
- Update relative paths carefully
- Test after each change

## Priority 3: WebSocket Consolidation (MEDIUM)
Target: Route all real-time communication through @sequential/realtime-sync
Estimated effort: 2-3 days

- [ ] Consolidate websocket-factory into realtime-sync
- [ ] Consolidate event-broadcaster into realtime-sync
- [ ] Update zellous/server/bot-websocket.js to use realtime-sync
- [ ] Migrate apps to unified WebSocket layer
- [ ] Remove sequential-os-http polling fallback

## Priority 4: StateKit Module Types (LOW)
Target: Unify CommonJS/ESM module types in sequential-machine
Estimated effort: 1-2 days (deferred - gracefully handled)

- [ ] Convert sequential-machine/lib to ESM modules
- [ ] Or: Convert sequential-machine/src to CommonJS
- [ ] Remove try/catch fallback in server.js initialization

## Post-Completion Checklist
- [ ] All 62 large files split to <200 lines
- [ ] npm run test passes all suites
- [ ] npm run build completes without warnings
- [ ] Server starts without architectural warnings
- [ ] Tool registry auto-registration works end-to-end
- [ ] WebSocket consolidation tested
- [ ] CLAUDE.md updated with completion status
