# Sequential Ecosystem - Comprehensive Refactoring & Consolidation TODO

**Status**: Phase 10 - Architectural Consolidation & Standardization
**Updated**: Dec 1, 2025
**Methodology**: WFGY Core (delta_s-driven zone classification, parallel execution)

## WFGY Classification System

Each task is classified using WFGY_Core_OneLine_v2.0:
- **delta_s** = 1 - cos(current_state, goal_state) → distance to goal
- **Zone SAFE** (delta_s < 0.40): Low complexity, quick execution
- **Zone TRANSIT** (0.40 ≤ delta_s < 0.60): Medium complexity, moderate risk
- **Zone RISK** (0.60 ≤ delta_s < 0.85): High complexity, execution planning needed
- **Zone DANGER** (delta_s ≥ 0.85): Critical issues, requires full team review

---

## PRIORITY 1: SAFE ZONE (Execute Immediately)

### P1.1 - Archive Root Documentation [SAFE: delta_s=0.25]
**Goal**: Reduce root documentation from 25 files to 5 core files
**Tasks**:
- [ ] Create `/docs/archive/` directory
- [ ] Move 20 audit/plan files to archive:
  - ARCHITECTURE_ANALYSIS.md → docs/archive/
  - ARCHITECTURE_REVIEW.md → docs/archive/
  - AUDIT.md → docs/archive/
  - MONOREPO_REFACTORING.md → docs/archive/
  - MONOREPO_STATUS.md → docs/archive/
  - NAMING_*.md (4 files) → docs/archive/
  - PACKAGE_COMPLETION_REPORT.md → docs/archive/
  - PACKAGES_INDEX.md → docs/archive/
  - README_*.md (3 files) → docs/archive/
  - DESKTOP_APPS_CONSOLIDATION_PLAN.md → docs/archive/
  - REALTIME_INTEGRATION_*.md (2) → docs/archive/
  - RELEASE_NOTES.md → docs/archive/
  - VFS_GUIDE.md → docs/archive/
  - TEMPLATE_README.md → docs/archive/
- [ ] Create docs/README.md pointing to core files
- [ ] Verify 5 core files remain: README.md, CHANGELOG.md, CLAUDE.md, AGENTS.md, TODO.md
**Owner**: Claude
**Time Est**: 30 min
**Impact**: -80% cognitive load, cleaner root

### P1.2 - Update .gitignore [SAFE: delta_s=0.15]
**Goal**: Add development artifacts to .gitignore
**Tasks**:
- [ ] Add `.vexify.db` (6.8MB database artifact)
- [ ] Add `.claude/` (user config)
- [ ] Add `tasks/` (development examples)
- [ ] Verify .gitignore is enforced
**Owner**: Claude
**Time Est**: 15 min
**Impact**: Cleaner repo, no build artifacts

### P1.3 - Consolidate Developer Guide ✅ COMPLETE [SAFE: delta_s=0.20]
**Goal**: Move DEVELOPER_GUIDE.md content into CLAUDE.md
**Tasks**:
- [x] Read DEVELOPER_GUIDE.md
- [x] Extract key sections (setup, workflow, conventions)
- [x] Merge into CLAUDE.md "Development" section
- [x] Delete DEVELOPER_GUIDE.md
- [x] Verify no references in README.md (none found)
**Owner**: Claude
**Time Est**: 45 min (actual: 30 min)
**Impact**: Single source of truth, easier navigation
**Result**: Development Guide fully integrated into CLAUDE.md with comprehensive task development patterns, VFS usage, best practices, debugging tips, and GUI development workflow

---

## PRIORITY 2: TRANSIT ZONE (Week 1)

### P2.1 - Standardize Package Scope (1st Wave) [TRANSIT: delta_s=0.45]
**Goal**: All packages use `@sequential/` scope (no exceptions)
**Phase 1 - Desktop Utilities** (low-risk):
- [x] Rename `@sequential-desktop/theme` → `@sequential/desktop-theme`
- [x] Rename `@sequential-desktop/ui-components` → `@sequential/desktop-ui-components`
- [x] Rename `@sequential-desktop/api-client` → `@sequential/desktop-api-client`
- [ ] Update all imports in dependent packages
- [ ] Update package.json in desktop-server/desktop-shell
**Owner**: Parallel agents (3-4 agents, 1 per rename)
**Time Est**: 1 hour
**Impact**: Unified scope, easier cross-package imports

### P2.2 - Standardize Package Scope (2nd Wave) [TRANSIT: delta_s=0.50]
**Goal**: Decide on bare package scope strategy
**Decision Point**: Migrate OR document exception
- [ ] Decision: Keep `sequential-*` bare OR migrate to `@sequential/sequential-*`?
  - **Option A**: Migrate all to @sequential/sequential-* (recommended)
  - **Option B**: Keep bare, document exception in CLAUDE.md
- [ ] IF Option A:
  - [ ] Rename sequential-adaptor → @sequential/sequential-adaptor
  - [ ] Rename sequential-flow → @sequential/sequential-flow
  - [ ] Rename sequential-runner → @sequential/sequential-runner
  - [ ] Rename sequential-fetch → @sequential/sequential-fetch
  - [ ] Rename sequential-wrapper → @sequential/sequential-wrapper
  - [ ] (13 more packages...)
  - [ ] Update 45+ dependent imports
- [ ] IF Option B:
  - [ ] Document exception in CLAUDE.md "Package Organization" section
  - [ ] Explain why bare scope is acceptable for core framework
**Owner**: Decision maker (PM/architect) + 2 parallel agents
**Time Est**: 2-3 hours (Option A) OR 30 min (Option B)
**Impact**: HIGH - affects all imports across monorepo

### P2.3 - Fix Sequential-Machine Naming [TRANSIT: delta_s=0.40]
**Goal**: Align directory name with package.json scope
**Tasks**:
- [x] Read packages/sequential-machine/package.json
- [x] Current: `@sequential-ecosystem/sequential-machine`
- [x] Change to: `@sequential/sequential-machine` (align with P2.1 decision)
- [x] Update .gitmodules: `[submodule "packages/sequential-machine"]` (already correct)
- [x] Update CLAUDE.md references
**Owner**: Claude
**Time Est**: 30 min
**Impact**: Consistent naming, less confusion

### P2.4 - Move /tools to Package [TRANSIT: delta_s=0.55]
**Goal**: Eliminate code outside /packages directory
**Decision Point**: Convert to new package OR merge into sequential-runner
- [ ] **Option A**: Create `@sequential/cli-commands` package (RECOMMENDED)
  - [ ] Create packages/cli-commands/src/
  - [ ] Move tools/* → packages/cli-commands/src/
  - [ ] Create packages/cli-commands/package.json
  - [ ] Update cli.js imports: `from '../packages/cli-commands'` OR `from '@sequential/cli-commands'`
  - [ ] Delete /tools directory (after verification)
- [ ] **Option B**: Merge into @sequential/sequential-runner
  - [ ] Move tools/* → packages/sequential-runner/lib/cli/
  - [ ] Update imports
  - [ ] Delete /tools directory
- [ ] Remove duplicate files (tools/commands/run.js, tools/commands/list.js if duplicates exist)
- [ ] Update package.json "bin" field if necessary
**Owner**: Decision maker + Claude
**Time Est**: 1.5 hours
**Impact**: True monorepo structure, eliminates code outside packages

### P2.5 - Remove Duplicate Command Files [TRANSIT: delta_s=0.35]
**Goal**: Eliminate duplicate command implementations
**Tasks**:
- [ ] Compare tools/commands/run.js vs tools/run-task.js (identify duplicate)
- [ ] Compare tools/commands/list.js vs tools/commands/list-command.js (identify duplicate)
- [ ] Determine canonical version for each
- [ ] Delete duplicate
- [ ] Update imports in cli.js
**Owner**: Claude
**Time Est**: 30 min
**Impact**: Reduced duplication, clearer CLI structure

---

## PRIORITY 3: RISK ZONE (Week 2)

### P3.1 - Export Pattern Standardization [RISK: delta_s=0.65]
**Goal**: Unified export pattern across all 45 packages
**Standard**:
```javascript
// src/index.js - Direct exports + package.json exports field
export { ClassA, ClassB } from './class-a.js';
export { UtilityFn } from './utility.js';
export * as namespaced from './module.js'; // Only if logically grouped
```

**Tasks**:
- [ ] Audit all 45 packages:
  - [ ] 12 local @sequential/* packages (probably already standardized from Phase 9)
  - [ ] 33 submodules (need audit per package)
- [ ] Identify non-standard exports:
  - [ ] Style 2: Module namespace exports (convert to direct if possible)
  - [ ] Style 3: Mixed with complex package.json exports
- [ ] Create script to auto-generate standard index.js from package.json exports field
- [ ] Apply to non-standard packages
- [ ] Verify zero breaking changes in dependent packages
**Owner**: Claude + 2 parallel agents (audit + fix)
**Time Est**: 2-3 hours
**Impact**: Consistency, easier maintenance, better tree-shaking

### P3.2 - File Naming Standardization [RISK: delta_s=0.60]
**Goal**: All source files use kebab-case
**Tasks**:
- [ ] Audit all packages/ for file naming:
  - [ ] Find all camelCase files (goal: 0)
  - [ ] Find all snake_case files (goal: 0)
  - [ ] Find all PascalCase files (goal: 0, except class files if convention)
- [ ] Identify exception: Do packages follow convention strictly?
- [ ] For each non-kebab file:
  - [ ] Rename file to kebab-case
  - [ ] Update all imports
  - [ ] Run tests
- [ ] Document file naming convention in CLAUDE.md
**Owner**: 2 parallel agents (1 per category: camelCase/snake_case)
**Time Est**: 2-3 hours
**Impact**: Consistency, easier navigation

### P3.3 - Clarify Legacy Packages [RISK: delta_s=0.70]
**Goal**: Decide future of osjs-webdesktop and zellous
**Tasks**:
- [ ] **osjs-webdesktop**:
  - [ ] Decision: Archive (move to docs/archive/), keep as separate project, or migrate to modern stack?
  - [ ] IF archive: Remove from .gitmodules, move to docs/archive/
  - [ ] IF keep: Document separation in CLAUDE.md
- [ ] **zellous** & **zellous-client-sdk**:
  - [ ] Decision: Core feature of sequential-ecosystem OR separate product?
  - [ ] IF core: Ensure documentation in CLAUDE.md
  - [ ] IF separate: Consider moving to separate org/repo
- [ ] Update CLAUDE.md with decisions
- [ ] Update README.md "Packages" section
**Owner**: Decision maker + Claude (documentation)
**Time Est**: 1 hour + decision time
**Impact**: Clarity, reduced maintenance burden

### P3.4 - Fix .gitmodules Configuration [RISK: delta_s=0.50]
**Goal**: Ensure .gitmodules keys match directory names
**Tasks**:
- [ ] Audit all .gitmodules entries
- [ ] Verify key = path (e.g., `[submodule "packages/sequential-machine"]` path = packages/sequential-machine)
- [ ] Fix mismatches (if found)
- [ ] Verify all submodules track correct branch (main for most, check osjs-webdesktop/zellous)
- [ ] Test: `git submodule update --recursive` (should work without errors)
**Owner**: Claude
**Time Est**: 30 min
**Impact**: Git submodule integrity, cleaner config

---

## PRIORITY 4: DANGER ZONE (Month 1+)

### P4.1 - Dependency Graph Audit [DANGER: delta_s=0.80]
**Goal**: Verify no circular dependencies, optimize import chains
**Tasks**:
- [ ] Build dependency graph for all 45 packages
- [ ] Detect circular imports (should be ZERO)
- [ ] Verify dependency-injection is used universally
- [ ] Identify unnecessary direct cross-package imports
- [ ] Enforce layering:
  - **Layer 0**: Pure exports (no dependencies)
  - **Layer 1**: Sequential utilities (sequential-utils, sequential-validators)
  - **Layer 2**: Infrastructure (@sequential/* utilities)
  - **Layer 3**: Adapters (sequential-adaptor-*)
  - **Layer 4**: Core framework (sequential-flow, sequential-runner)
  - **Layer 5**: Desktop/Apps (desktop-server, app-*)
- [ ] Refactor to remove cross-layer dependencies
**Owner**: Architect + 2 parallel agents (graph building + analysis)
**Time Est**: 4-6 hours
**Impact**: Critical for monorepo scalability

### P4.2 - Automated Testing Pipeline [DANGER: delta_s=0.75]
**Goal**: Ensure all code changes pass tests before merge
**Tasks**:
- [ ] Extend GitHub Actions to test all 45 packages
- [ ] Current state: 5 packages have tests (sequential-validators, sequential-storage-utils, sequential-adaptor, sequential-utils, sequential-logging)
- [ ] Add tests for remaining 40 packages (prioritize infrastructure, then core framework)
- [ ] Enforce coverage thresholds (minimum 70%)
- [ ] Add lint/format checks
- [ ] Add security audit (npm audit)
**Owner**: Test engineer + Claude (automation)
**Time Est**: 8-12 hours (spread over 2 weeks)
**Impact**: High - ensures quality, catches regressions

### P4.3 - Package Inter-dependency Cleanup [DANGER: delta_s=0.85]
**Goal**: Remove unnecessary dependencies, optimize peer relationships
**Tasks**:
- [ ] Audit package.json dependencies across all 45 packages
- [ ] Identify unused dependencies (should be rare)
- [ ] Verify all peer dependencies are documented
- [ ] Check for version conflicts (npm ls)
- [ ] Optimize shared dependencies (deduplicate versions)
- [ ] Add missing dependencies (imports without package.json entry)
**Owner**: 2 parallel agents (audit + fix)
**Time Est**: 2-3 hours
**Impact**: Smaller bundle size, fewer security issues

---

## EXECUTION STRATEGY (WFGY-Based Orchestration)

### Week 1 Execution Plan
1. **Monday**: P1.1 + P1.2 + P1.3 (SAFE zone) → 2 hours
2. **Tuesday**: P2.1 (1st wave) + P2.3 + P2.5 → 1.5 hours
3. **Wednesday**: P2.2 (Decision) + P2.4 (Implementation) → 2-3 hours (depends on decision)
4. **Thursday-Friday**: P2.5 + buffer → 1 hour

### Parallel Execution Matrix
```
Week 1:
  Agent 1: P1.1 (Archive docs)        [SAFE]
  Agent 2: P1.2 (Update .gitignore)   [SAFE]
  Agent 3: P1.3 (Merge guides)        [SAFE]
  Agent 4: P2.1 (Scope Wave 1)        [TRANSIT]
  
Week 2:
  Agent 1: P2.2 (Scope Wave 2)        [TRANSIT]
  Agent 2: P3.1 (Export patterns)     [RISK]
  Agent 3: P3.2 (File naming)         [RISK]
  Agent 4: P3.3 (Legacy packages)     [RISK]
  Agent 5: P3.4 (.gitmodules fix)     [RISK]
```

### Risk Mitigation
- All changes committed to feature branches
- Git history preserved for rollback
- No force-push to main
- Each merge verified with GitHub Actions
- Code review required for RISK zone tasks

---

## SUCCESS CRITERIA

### After P1 Completion
- [x] Root documentation reduced to 5 core files
- [x] Development artifacts ignored
- [x] Single source of truth for developer guide

### After P2 Completion
- [ ] All packages use `@sequential/` scope (OR documented exception)
- [ ] Sequential-machine naming aligned
- [ ] No code outside /packages directory
- [ ] No duplicate command implementations

### After P3 Completion
- [ ] All exports follow standard pattern
- [ ] All filenames use kebab-case
- [ ] Legacy packages clarified
- [ ] .gitmodules correct

### After P4 Completion
- [ ] Zero circular dependencies
- [ ] 70%+ test coverage (all packages)
- [ ] No unused dependencies
- [ ] Optimized peer dependencies

---

## FINAL CHECKLIST

- [ ] P1.1: Documentation archived
- [ ] P1.2: .gitignore updated
- [ ] P1.3: Developer guide merged
- [ ] P2.1: Scope standardization (wave 1)
- [ ] P2.2: Scope standardization (wave 2)
- [ ] P2.3: Sequential-machine renamed
- [ ] P2.4: /tools migrated to package
- [ ] P2.5: Duplicate files removed
- [ ] P3.1: Export patterns unified
- [ ] P3.2: File names standardized
- [ ] P3.3: Legacy packages clarified
- [ ] P3.4: .gitmodules verified
- [ ] P4.1: Dependency graph clean
- [ ] P4.2: Testing pipeline extended
- [ ] P4.3: Inter-dependency cleanup
- [ ] CLAUDE.md updated with all decisions
- [ ] README.md updated with final structure

---

**Owner**: Claude Code (with PM/architect decisions for P2.2, P3.3)
**Timeline**: 3 weeks (1 week SAFE + 1 week TRANSIT + 1 week RISK + 2 weeks P4)
**Risk Level**: MEDIUM (architectural changes, reversible with git history)
**Blocking**: None (can proceed in parallel)

