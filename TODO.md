# Sequential Ecosystem - Comprehensive Refactoring TODO

**Generated**: Dec 1, 2025 | **Status**: Audit Complete → Execution Phase
**Overall Health Score**: 7.2/10 | **Technical Debt**: 18-25 engineering days

---

## WFGY ORCHESTRATION FRAMEWORK

Using WFGY_Core_OneLine_v2.0 methodology for systematic execution:
- **Input (I)**: Current monorepo state (44 packages, 50+ issues identified)
- **Goal (G)**: True modular monorepo with all code in packages, unified naming, 80%+ test coverage
- **Execution Zones**:
  - **SAFE (<0.40 delta_s)**: Low-risk refactorings (renaming, documentation, package moves)
  - **TRANSIT (0.40-0.60)**: Moderate risk (consolidation, test addition)
  - **RISK (0.60-0.85)**: High impact (architecture changes, large refactorings)

---

## CRITICAL ISSUES FOUND

### P1: PACKAGE PROLIFERATION (44 → 8 packages)
- [ ] Consolidate error-handling, param-validation, response-formatting → @sequential/core
- [ ] Consolidate file-operations, websocket-factory, input-sanitization → @sequential/core/modules
- [ ] Create @sequential/storage (data-access-layer + repositories)
- [ ] Create @sequential/services (task-execution-service + flow-service)
- [ ] Create @sequential/framework (dependency-injection + adaptor)
- [ ] Create @sequential/runtime (sequential-runner, sequential-wrapper, sequential-fetch, etc.)
- [ ] Modularize @sequential/desktop (server + api + ui + apps)
- [ ] Create @sequential/cli (extract /tools, /cli.js)
- [ ] Create @sequential/utilities (sequential-utils, validators, logging)

**Estimated**: 4 days | **Risk**: LOW | **Effort**: 2000 LOC moved

### P2: DUPLICATE CODE ELIMINATION (407 lines)
- [ ] Create BaseRepository class
- [ ] Eliminate validatePath() duplication (4 repositories)
- [ ] Eliminate getAll() duplication (4 repositories)
- [ ] Eliminate file operation duplication

**Estimated**: 1 day | **Risk**: LOW | **LOC saved**: 407

### P3: EMPTY IMPLEMENTATIONS (5 packages)
- [ ] Implement @sequential/core/modules/input-sanitization (rate-limit.js)
- [ ] Document/implement @sequential/runtime/runner
- [ ] Consolidate 10 desktop apps into @sequential/desktop/apps/

**Estimated**: 1.5 days | **Risk**: MEDIUM

### P4: NAMING INCONSISTENCIES (50+ violations)
- [ ] Standardize file names: kebab-case (rename SequentialOSClient.js, VFSClient.js)
- [ ] Standardize constants: SCREAMING_SNAKE_CASE (rateLimitMap → RATE_LIMIT_MAP)
- [ ] Standardize function prefixes: create*, is*, validate*, format*, get*, handle*
- [ ] Remove export default everywhere (named exports only)
- [ ] Replace variable abbreviations (f → fileName, e → error)
- [ ] Standardize callbacks (onclick → onClick)

**Estimated**: 1.5 days | **Risk**: LOW | **Files**: 50+ affected

### P5: MISSING TESTS (91% untested)
- [ ] Add tests to error-handling (0% → 80%)
- [ ] Add tests to param-validation (0% → 80%)
- [ ] Add tests to file-operations (0% → 80%)
- [ ] Add tests to websocket-broadcaster (0% → 80%)
- [ ] Add tests to storage/base-repository
- [ ] Set up CI/CD testing

**Estimated**: 40-60 hours | **Risk**: MEDIUM | **Coverage**: 9% → 80%

### P6: DOCUMENTATION GAPS (74% missing)
- [ ] Add README.md to 32 packages
- [ ] Add JSDoc to all public APIs (100% exports)
- [ ] Create TypeScript .d.ts files for all packages
- [ ] Document 49 environment variables with schema

**Estimated**: 3 days | **Risk**: LOW

### P7: LARGE FILES (>200 LOC)
- [ ] Split error-logger.js (470 LOC) → 4 files
- [ ] Split broadcaster.js (402 LOC) → 3 files
- [ ] Review/split any other >200 LOC files

**Estimated**: 1 day | **Risk**: MEDIUM

### P8: CONFIGURATION CHAOS (49 ENV variables scattered)
- [ ] Create ENV_SCHEMA with all 49 variables
- [ ] Add validation on startup
- [ ] Update all files accessing process.env directly

**Estimated**: 1 day | **Risk**: MEDIUM

### P9: ERROR HANDLING INCONSISTENCY (5 patterns)
- [ ] Enforce single pattern: throw createError(...) everywhere
- [ ] Audit all 13 route files
- [ ] Update all 4 repository classes
- [ ] Update all services

**Estimated**: 1.5 days | **Risk**: MEDIUM

### P10: CIRCULAR DEPENDENCY RISK
- [ ] Audit desktop-server (16 internal deps) for circular patterns
- [ ] Create peer dependency contracts
- [ ] Document safe dependency tree

**Estimated**: 1 day | **Risk**: MEDIUM

---

## EXECUTION PHASES

### WEEK 1: CRITICAL ISSUES (SAFE ZONE - P1-P4)
**Goal**: Consolidate packages, eliminate duplication, fix naming, document standards

- [ ] P1.1: Package consolidation (44 → 8) - 4 days parallel
- [ ] P1.2: BaseRepository extraction - 1 day
- [ ] P1.3: Empty package implementation - 1.5 days
- [ ] P1.4: Naming standards document - 0.5 days
- [ ] P2.5: Apply naming conventions - 1.5 days
- [ ] P2.6: Add README.md to 32 packages - 2 days

**Total**: ~10 days | **Health Score**: 7.2 → 7.8/10

### WEEK 2-3: HIGH PRIORITY (TRANSIT ZONE - P2-P3)
**Goal**: Add types, split large files, centralize config, standardize error handling

- [ ] P2.1: Split >200 LOC files - 1 day
- [ ] P2.2: Add JSDoc + TypeScript .d.ts - 2 days
- [ ] P2.3: Centralize ENV_SCHEMA - 1 day
- [ ] P2.4: Standardize error handling - 1.5 days
- [ ] P3.1: Add tests to critical packages - 40-60 hours
- [ ] P3.2: Break desktop-server monolith - 2 days
- [ ] P3.3: Create peer dependency contracts - 1 day
- [ ] P3.4: Standardize package.json - 1 day

**Total**: ~20 days | **Health Score**: 7.8 → 8.5/10

### WEEK 4: OPTIMIZATION (P4)
**Goal**: CI/CD, cleanup, optimization, final validation

- [ ] P4.1: Code cleanup & dead code - 1 day
- [ ] P4.2: Architecture diagram - 0.5 days
- [ ] P4.3: Performance optimization - 0.5 days
- [ ] Final testing & validation - 1 day

**Total**: ~3 days | **Health Score**: 8.5 → 9.0/10

---

## PARALLEL EXECUTION (WFGY Zones)

### SAFE ZONE - Can execute in parallel:
```
├── P1.1.1 (core package)     ↔  P1.1.7 (cli package)
├── P1.2 (base repository)    ↔  P1.3 (empty packages)
├── P1.4 (naming standards)   ↔  P2.6 (documentation)
└── P2.5 (naming refactor)    ↔  All above
```

### TRANSIT ZONE - Sequential execution required:
```
P2.1 (split files)  →  P2.2 (add types)  →  P2.3 (config)  →  P2.4 (error handling)
P3.1 (tests)        →  P3.2 (server split)  →  P3.3 (contracts)
```

### RISK ZONE - High validation required:
```
P3.1, P3.2, P3.3 require comprehensive testing before advancing
```

---

## SUCCESS METRICS

| Metric | Current | Target | Status |
|--------|---------|--------|--------|
| Package count | 44 | 8 | ⭐⭐⭐ |
| Duplication (lines) | 407 | 0 | ⭐ |
| Test coverage | 9% | 80% | ⭐ |
| Documentation | 26% | 100% | ⭐ |
| Naming violations | 50+ | 0 | ⭐ |
| Files >200 LOC | 4 | 0 | ⭐ |
| Circular deps | 0 | 0 | ✅ |
| Health score | 7.2 | 9.0 | ⭐ |

---

## BLOCKERS

- [ ] P3.2 blocked by P1.1 (need consolidated packages first)
- [ ] P3.1 blocked by P1.1 (need finalized package structure)
- [ ] P2.3 blocked by P1.1 (need core package for centralized config)

---

**Ready for execution. Starting with SAFE ZONE items (Week 1).**
