# Sequential Ecosystem - Refactoring Roadmap

This document tracks architectural improvements for future development phases.

## Phase 1 Status: Onboarding Complete (Dec 4, 2025)
✅ **Latest Release**: GUI-first initialization with comprehensive integration pattern examples
- quickstart-generator.js: 2-minute GUI guide
- comprehensive-workflow.js: 5 example tasks (task→tool, task→task patterns)
- Enhanced init-command.js with clear GUI messaging
- QUICKSTART.md auto-generated in all new projects

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

## Phase 2: Future Refactoring (Not Immediate)

### File Size Constraint Compliance (Future)
**Goal**: Reduce 62 files from >200 lines to <200 lines
**Status**: Identified but deferred - not blocking current usage
**Files**: 9 core services >500L, 6 test files >300L, 12 other files >300L
**Recommendation**: Address when touching specific modules, one at a time with tests

### Real-Time Storage System (Phase 1 Complete)
**Status**: StateManager EventEmitter layer complete, repositories pending consolidation
**Next**: Update all repositories to use StateManager exclusively for single write path

### Dynamic React Components (Phase 1 Complete)
**Status**: Runtime JSX compilation working, storage integration pending
**Next**: Add /api/components endpoints, integrate with storage adaptor

### Tool Registry Auto-Registration (Partial)
**Status**: /api/tools/register endpoint added
**Next**: AppSDK-side registration, auto-initialization on app startup

## Future Improvements (Not Immediate)

### WebSocket Consolidation
Route all real-time communication through @sequential/realtime-sync instead of multiple implementations

### StateKit Module Types Unification
Resolve CommonJS/ESM mixing in sequential-machine (low priority - works with fallback)

### File Size Refactoring
Split 62 files >200 lines (deferred, address one at a time when touching specific modules)
