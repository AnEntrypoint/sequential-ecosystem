# Sequential Ecosystem - Architectural Improvements Checklist

**Generated**: December 1, 2025
**Prepared For**: Team Review & Implementation
**Estimated Effort**: 20-25 hours total (recommended: phased approach)

---

## Phase 1: Quick Wins (3-4 hours) - PRIORITY LEVEL: HIGH

### Win 1.1: Fix createErrorResponse() Undefined ⚡
- [ ] File: `/packages/desktop-server/src/routes/sequential-os.js` (line 15)
- [ ] Issue: Function called but not imported/defined
- [ ] Action: Import from `@sequential/error-handling`
- [ ] Testing: `npm test` for sequential-os routes
- [ ] Time: 15 minutes
- [ ] Status: Ready to implement

### Win 1.2: Make Storage-Observer Read-Only ⚡
- [ ] File: `/packages/desktop-server/src/routes/storage-observer.js`
- [ ] Issue: In-memory Map grows unbounded, not persisted
- [ ] Action: Query TaskRepository instead of maintaining STORAGE_STATE Maps
- [ ] Testing: `npm test -w @sequential/desktop-server`
- [ ] Time: 1 hour
- [ ] Status: Ready to implement
- [ ] Benefit: Eliminates memory leak, ensures data consistency

### Win 1.3: Run Dependency Cleanup Audit ⚡
- [ ] Command: `node packages/tools/dependency-cleanup.js --dry-run`
- [ ] Review: Check changes in `.dependency-cleanup-backup/changes.json`
- [ ] Apply: Run without `--dry-run` flag
- [ ] Testing: `npm install && npm test`
- [ ] Time: 30 minutes
- [ ] Status: Script exists, ready to run
- [ ] Benefit: Removes 40 unused dependencies

### Win 1.4: Consolidate File Operations Routes ⚡
- [ ] Files to merge:
  - [ ] `/packages/desktop-server/src/routes/file-read-operations.js` (81 lines)
  - [ ] `/packages/desktop-server/src/routes/file-write-operations.js` (79 lines)
  - [ ] `/packages/desktop-server/src/routes/file-transform-operations.js` (64 lines)
- [ ] New file: `/packages/desktop-server/src/routes/file-operations.js`
- [ ] Create: `FileOperationsService` (timing, logging wrapper)
- [ ] Testing: All file endpoint tests pass
- [ ] Time: 2 hours
- [ ] Status: Code exists, needs extraction
- [ ] Benefit: 223 lines → ~80 lines, reusable service

---

## Phase 2: Medium Effort (6-8 hours) - PRIORITY LEVEL: CRITICAL FOR P3.2

### Issue 2.1: Extract Sequential-OS HTTP Adapter ⭐
- [ ] Create new package: `@sequential/sequential-os-http`
- [ ] Step 1: Create package structure
  - [ ] `packages/sequential-os-http/src/index.js`
  - [ ] `packages/sequential-os-http/src/routes.js`
  - [ ] `packages/sequential-os-http/src/state-kit-client.js`
  - [ ] `packages/sequential-os-http/package.json`
- [ ] Step 2: Move route logic from desktop-server
  - [ ] Copy `registerSequentialOsRoutes()` function
  - [ ] Update imports as needed
  - [ ] Test with mock kit instance
- [ ] Step 3: Create StateKitHttpClient abstraction
  - [ ] Handles kit initialization
  - [ ] Manages state directory
  - [ ] Delegates to underlying StateKit
- [ ] Step 4: Update desktop-server
  - [ ] Import from `@sequential/sequential-os-http`
  - [ ] Remove old sequential-os.js route file
  - [ ] Update dependencies
- [ ] Step 5: Integration testing
  - [ ] `/api/sequential-os/*` endpoints work
  - [ ] StateKit functionality preserved
  - [ ] Module isolation verified
- [ ] Testing: `npm run dev`, test all endpoints
- [ ] Time: 4-6 hours
- [ ] Status: Design complete, ready to implement
- [ ] Benefit: Clean P3.2 integration, reusable HTTP adapter
- [ ] **P3.2 BLOCKER**: Must complete before P3.2

### Issue 2.2: Extract Metrics Service 📊
- [ ] Create: `@sequential/metrics-service`
- [ ] Implementation:
  - [ ] `MetricsService` class with caching
  - [ ] TTL-based cache invalidation
  - [ ] Duration statistics calculation
  - [ ] Active task integration
- [ ] Integration:
  - [ ] Update `/packages/desktop-server/src/routes/runs.js`
  - [ ] Replace inline calculation with service call
  - [ ] Verify cache behavior
- [ ] Testing: Metrics endpoint tests pass
- [ ] Time: 2 hours
- [ ] Status: Code identified, ready for extraction
- [ ] Benefit: Caching, cleaner code, reusable

### Issue 2.3: Standardize Error Responses 🔧
- [ ] Add to `@sequential/error-handling`:
  - [ ] `createErrorResponse(code, message, statusCode)`
  - [ ] `errorToResponse(error)` helper
  - [ ] Export from `src/index.js`
- [ ] Audit and fix all route files:
  - [ ] Find all `createErrorResponse()` uses
  - [ ] Find all inconsistent response formats
  - [ ] Replace with standard format
- [ ] Files to update:
  - [ ] `sequential-os.js` (uses undefined function)
  - [ ] `storage-observer.js` (uses undefined function)
  - [ ] Other routes using `{code, message}` format
- [ ] Testing: Error response format consistent
- [ ] Time: 1 hour
- [ ] Status: Ready to implement
- [ ] Benefit: API consistency, fewer runtime errors
- [ ] **P3.2 BLOCKER**: createErrorResponse() undefined in sequential-os.js

---

## Phase 3: Major Refactoring (8-12 hours) - PRIORITY LEVEL: HIGH (POST-P3.2)

### Issue 3.1: Implement StateManager with Lifecycle 🎯
- [ ] Create new package: `@sequential/persistent-state-manager`
- [ ] Phase A: Design StateManager class
  - [ ] Memory cache with TTL
  - [ ] Max size enforcement
  - [ ] Periodic cleanup (configurable interval)
  - [ ] Adapter pattern for persistence
  - [ ] Graceful shutdown
- [ ] Phase B: Implement adapter interface
  - [ ] `PersistentStateAdapter` base class
  - [ ] `FileSystemStateAdapter` implementation
  - [ ] Get/set/shutdown methods
- [ ] Phase C: Integrate into desktop-server
  - [ ] Create StateManager instance at startup
  - [ ] Register graceful shutdown handlers
  - [ ] Replace STORAGE_STATE Maps with StateManager
- [ ] Phase D: Update all routes
  - [ ] Replace `STORAGE_STATE.get()` with `stateManager.get()`
  - [ ] Replace `STORAGE_STATE.set()` with `stateManager.set()`
  - [ ] Verify all functionality preserved
- [ ] Testing:
  - [ ] Unit tests for StateManager
  - [ ] TTL expiration verified
  - [ ] Size limits enforced
  - [ ] Server graceful shutdown works
  - [ ] Memory bounded under load
- [ ] Time: 8-12 hours
- [ ] Status: Design complete, ready for implementation
- [ ] Benefit: Prevents memory leaks, enables long-term server stability
- [ ] **POST-P3.2**: Schedule after P3.2 stabilizes

---

## Review Checklist

### Before Starting Each Phase
- [ ] Read related documentation (ARCHITECTURE-ANALYSIS.md)
- [ ] Create git branch: `improve/phase-X-issue-Y`
- [ ] Identify all affected files
- [ ] Review current code patterns
- [ ] Plan for backward compatibility

### During Implementation
- [ ] Follow existing code style
- [ ] Maintain <150 lines per file guideline
- [ ] Use async/await throughout
- [ ] Add proper error handling
- [ ] Update imports in affected files
- [ ] Keep JSDoc comments current

### Testing Requirements
- [ ] Unit tests for new services
- [ ] Integration tests for routes
- [ ] Manual testing with `npm run dev`
- [ ] Check for memory leaks under load
- [ ] Verify graceful error handling

### Git Workflow
- [ ] Commit after each logical change
- [ ] Write clear commit messages
- [ ] Reference issues in commits
- [ ] Create PR with ARCHITECTURE-ANALYSIS link
- [ ] Get team review before merging

---

## Success Criteria

### Phase 1 Complete (✅ = ALL ITEMS)
- [ ] createErrorResponse() working everywhere
- [ ] Storage-observer uses persistent sources
- [ ] Dependency cleanup audit complete
- [ ] File operations consolidated
- [ ] No new errors in `npm test`
- [ ] **Time**: 3-4 hours

### Phase 2 Complete (✅ = ALL ITEMS)
- [ ] Sequential-OS HTTP adapter extracted
- [ ] Metrics service created and integrated
- [ ] Error responses standardized
- [ ] All P3.2 blockers resolved
- [ ] **Time**: 6-8 hours
- [ ] **Ready for P3.2**: YES

### Phase 3 Complete (✅ = ALL ITEMS)
- [ ] StateManager implemented with cleanup
- [ ] Server graceful shutdown works
- [ ] Memory bounded under sustained load
- [ ] All storage uses StateManager
- [ ] Long-term stability achieved
- [ ] **Time**: 8-12 hours

---

## Risk Mitigation

### What Could Go Wrong
1. **State data loss** → Use separate adapter, test migration
2. **Performance regression** → Profile before/after, cache metrics
3. **Breaking changes** → Maintain backward compatibility, test thoroughly
4. **Memory still grows** → Verify cleanup actually runs, add monitoring

### Rollback Strategy
```bash
# Before each phase
git checkout -b improve/phase-X
git commit --allow-empty -m "Checkpoint: Phase X start"

# If something breaks
git reset --hard <checkpoint-hash>
git clean -fd
```

---

## Timeline Estimate

| Phase | Effort | Status | Recommended |
|-------|--------|--------|------------|
| Phase 1 (Quick Wins) | 3-4 hrs | Ready | **DO IMMEDIATELY** |
| Phase 2 (Medium) | 6-8 hrs | Ready | **DO BEFORE P3.2** |
| Phase 3 (Major) | 8-12 hrs | Design Complete | **DO AFTER P3.2** |
| **TOTAL** | **20-25 hrs** | Planned | **P3.2 Prep: 9-11 hrs** |

---

## Team Assignments

Suggested task distribution (assuming 2-3 developers):

### Developer A: Infrastructure
- [ ] Phase 2.1: Sequential-OS HTTP adapter
- [ ] Phase 3.1: StateManager implementation
- **Estimated**: 12-14 hours

### Developer B: Routes & Services
- [ ] Phase 1.1: Fix createErrorResponse()
- [ ] Phase 1.4: Consolidate file operations
- [ ] Phase 2.2: Metrics service
- [ ] Phase 2.3: Error standardization
- **Estimated**: 8-10 hours

### Developer C: Cleanup & Testing
- [ ] Phase 1.2: Storage-observer refactor
- [ ] Phase 1.3: Dependency cleanup
- [ ] All testing and verification
- **Estimated**: 6-8 hours

**Parallel Execution**: All 3 can work simultaneously on different issues

---

## Sign-Off

- [ ] Architecture analysis reviewed
- [ ] Implementation plan approved
- [ ] Team assignments confirmed
- [ ] Timeline commitments made
- [ ] Risk mitigation accepted

**Approved By**: _____________________ **Date**: _________

---

**Ready to Implement!** Start with Phase 1 Quick Wins for immediate wins.
