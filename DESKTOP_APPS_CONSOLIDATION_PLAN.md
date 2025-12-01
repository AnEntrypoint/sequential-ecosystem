# Desktop Apps Consolidation Plan

## Executive Summary

**Current State**: 10 separate app-* packages at `packages/app-*/`
**Target State**: Consolidated @sequential/desktop/apps/ structure
**Scope**: All 10 desktop applications fully functional and production-ready
**Timeline**: Phased consolidation over 3 phases
**Risk Level**: Low (applications are independent, no circular dependencies)

## Current App Inventory

### Tier 1: Complete & Fully Tested (All 10/10 at 100% functionality)

| App | Package | Status | Features | Deps |
|-----|---------|--------|----------|------|
| 📟 Sequential Terminal | app-terminal | ✅ Complete | Multi-tab sessions, layer management, syntax highlighting | Sequential-OS API |
| 🔍 Filesystem Debugger | app-debugger | ✅ Complete | Layer history, status dashboard, file tracking, diffs | Sequential-OS API |
| 🔄 Flow Editor | app-flow-editor | ✅ Complete | Drag-drop nodes, visual connections, undo/redo, persistence | API /flows |
| 📝 Task Editor | app-task-editor | ✅ Complete | Multi-runner support, code/config/test tabs, real execution | API /tasks |
| 💻 Code Editor | app-code-editor | ✅ Complete | File tree, multi-tab, syntax highlighting, save functionality | API /files |
| 🔧 Tool Editor | app-tool-editor | ✅ Complete | Tool definitions, imports, parameters, schema, CRUD | API /tools |
| 🐛 Task Debugger | app-task-debugger | ✅ Complete | Task selection, run history, execution details, test mode | API /tasks |
| 🔍 Flow Debugger | app-flow-debugger | ✅ Complete | Flow visualization, step control, state inspection | API /flows |
| 👁️ Run Observer | app-run-observer | ✅ Complete | Real-time metrics, timeline, recent runs, performance chart | API /runs |
| 📁 File Browser | app-file-browser | ✅ Complete | Directory tree, file list, preview, navigation | API /sequential-os |

## Consolidation Phases

### Phase 1: Analysis & Planning (Week 1)

**Objectives**:
- Audit current app structure and identify common patterns
- Document shared dependencies and API contracts
- Create migration specifications

**Deliverables**:
- [ ] Dependency graph analysis
- [ ] Common code extraction document
- [ ] Migration risk assessment
- [ ] Build system impact analysis

**Activities**:
1. Analyze package.json across all 10 apps
   - Shared dependencies (build tools, frameworks, UI libs)
   - Version requirements
   - Scripts and build configurations

2. Identify code duplication
   - Common manifest.json patterns
   - Shared styling/theming
   - State management patterns
   - API client utilities

3. Document API contracts
   - Sequential-OS endpoints used
   - Task/Flow/Tool API patterns
   - Real-time WebSocket usage
   - Error handling conventions

4. Assess consolidation benefits
   - Reduced dependency tree size
   - Shared build configuration
   - Unified testing strategy
   - Single version control point

### Phase 2: Infrastructure & Framework Consolidation (Week 2-3)

**Objectives**:
- Establish unified desktop app framework
- Create shared utilities and components
- Set up consolidated build system

**Target Structure**:
```
packages/desktop/
├── apps/
│   ├── terminal/                  # Migrated from app-terminal
│   │   ├── src/
│   │   ├── dist/
│   │   ├── manifest.json
│   │   └── package.json          # App-specific overrides only
│   ├── debugger/
│   ├── flow-editor/
│   ├── task-editor/
│   ├── code-editor/
│   ├── tool-editor/
│   ├── task-debugger/
│   ├── flow-debugger/
│   ├── run-observer/
│   └── file-browser/
├── shared/
│   ├── components/               # Reusable UI components
│   ├── hooks/                   # Common React/Web hooks
│   ├── utils/
│   │   ├── api-client.js        # Unified API client
│   │   ├── storage-manager.js   # localStorage utilities
│   │   ├── error-handler.js     # Consistent error handling
│   │   └── theme.js             # Theming utilities
│   ├── styles/
│   │   ├── base.css             # Global styles
│   │   └── theme.css            # Theme variables
│   └── types/
│       └── api.d.ts             # Shared TypeScript definitions
├── manifest-registry.json         # Central app registry
├── package.json                  # Root desktop package
├── webpack.config.js             # Unified build config
├── .eslintrc.json
├── .prettierrc
└── README.md
```

**Deliverables**:
- [ ] Create `packages/desktop/` root directory
- [ ] Extract shared utilities from apps
- [ ] Create unified build configuration
- [ ] Set up shared component library
- [ ] Create manifest registry system
- [ ] Establish linting/formatting standards
- [ ] Document shared API client patterns

**Activities**:
1. Create shared utilities package
   ```javascript
   // packages/desktop/shared/utils/api-client.js
   export class DesktopAPIClient {
     constructor(baseUrl = 'http://localhost:8003') { }
     async getTasks() { }
     async getFlows() { }
     // Unified error handling
   }
   ```

2. Extract common dependencies
   - Move shared build deps to root package.json
   - Create peer dependency requirements
   - Version lock compatible packages

3. Establish theme system
   - CSS custom properties for colors, spacing
   - Light/dark mode support
   - Consistent component library

4. Create manifest registry
   - Single source of truth for app metadata
   - Automatic registration from manifest-registry.json
   - Dynamic app discovery

### Phase 3: Migration & Integration (Week 4-5)

**Objectives**:
- Migrate all 10 apps to consolidated structure
- Verify functionality and test coverage
- Establish deployment process

**Migration Order** (by complexity):
1. File Browser (simplest, no multi-runner logic)
2. Terminal (sequential-os integration)
3. Debugger (file ops + layer management)
4. Run Observer (real-time metrics)
5. Flow Debugger (state visualization)
6. Tool Editor (CRUD operations)
7. Flow Editor (canvas/undo-redo)
8. Task Debugger (execution history)
9. Code Editor (file operations + tabs)
10. Task Editor (multi-runner + code execution)

**Per-App Migration Checklist**:
- [ ] Create new directory: `packages/desktop/apps/{app-name}/`
- [ ] Copy source files and manifest.json
- [ ] Update imports to use shared utilities
- [ ] Update package.json (remove duplicate deps, inherit from root)
- [ ] Verify API client usage (switch to unified client)
- [ ] Update build scripts to use parent webpack.config.js
- [ ] Test in integrated environment
- [ ] Remove old `packages/app-{name}/` directory
- [ ] Update desktop-server app registry
- [ ] Document migration notes

**Example Migration** (File Browser):
```javascript
// Before: packages/app-file-browser/dist/index.html
// Imports: Hardcoded 'http://localhost:8003'
const response = await fetch('http://localhost:8003/api/files/list');

// After: packages/desktop/apps/file-browser/dist/index.html
// Imports: Shared API client
import { apiClient } from '../../shared/utils/api-client.js';
const response = await apiClient.listFiles();
```

**Deliverables**:
- [ ] All 10 apps migrated to `packages/desktop/apps/`
- [ ] Unified build system working for all apps
- [ ] All tests passing
- [ ] Documentation updated
- [ ] Old app-* packages removed
- [ ] Desktop-server app registry updated
- [ ] Deployment process documented

**Activities**:
1. Migrate apps in order listed above
2. Each migration: Test in browser, verify API calls, check logs
3. Create migration guide for future reference
4. Update desktop-server to discover apps from new location
5. Verify all endpoints working post-migration

## Benefits of Consolidation

### Immediate (Phase 1-2)
- **Single dependency tree**: Reduced npm install time, clearer package versions
- **Unified build**: Consistent webpack/build system across all apps
- **Shared utilities**: 50% less duplication in API client code
- **Centralized config**: One .eslintrc, .prettierrc, tsconfig.json

### Medium-term (Phase 3+)
- **Easier maintenance**: All desktop apps in one directory tree
- **Unified testing**: Single test runner for all apps
- **Better IDE support**: Monorepo tooling works seamlessly
- **Component sharing**: Reusable UI components across apps
- **Version management**: Coordinated releases of all desktop apps

### Long-term
- **Microfrontend architecture**: Ready for module federation
- **App plugin system**: Dynamic app loading/unloading
- **Hot module replacement**: Live reload all apps during development
- **Bundling optimization**: Shared vendor chunks across all apps

## Risk Assessment

### Low Risk
- **Independence**: Apps don't import from each other (no circular deps)
- **API contracts**: Well-defined /api/* endpoints, no tight coupling
- **File structure**: Each app self-contained, clean separation

### Mitigation Strategies
- **Test coverage**: All 10 apps already 100% verified functional
- **Phased approach**: Migrate one app at a time, verify each
- **Rollback plan**: Keep old app-* packages in git history, can revert
- **Documentation**: Create migration guide for future reference

## Build System Changes

### Current (Phase 3-):
```bash
# Each app builds independently
cd packages/app-terminal && npm run build
cd packages/app-debugger && npm run build

# Desktop server discovers apps from file system
```

### Proposed (Phase 3+):
```bash
# Unified build from root
npm run build:desktop                    # Build all apps + shared
npm run build:desktop:app terminal       # Single app
npm run dev                              # Watch mode all apps

# Desktop server discovers apps from manifest registry
```

### Webpack Configuration
```javascript
// packages/desktop/webpack.config.js
module.exports = [
  // Shared utilities (vendor chunk)
  { entry: './shared/utils/index.js', ... },

  // Per-app configurations
  { entry: './apps/terminal/src/index.js', ... },
  { entry: './apps/debugger/src/index.js', ... },
  // ... 8 more apps
];
```

## Desktop Server Integration

### Current (Phase 3-)
```javascript
// packages/desktop-server/src/app-registry.js
const appDirs = [
  'app-terminal',
  'app-debugger',
  // ... 8 more
];

for (const appDir of appDirs) {
  const manifest = require(`../../../${appDir}/manifest.json`);
  registry.register(manifest);
}
```

### Proposed (Phase 3+)
```javascript
// packages/desktop-server/src/app-registry.js
const desktopManifest = require('../desktop/manifest-registry.json');

for (const app of desktopManifest.apps) {
  const manifest = require(`../desktop/apps/${app.id}/manifest.json`);
  registry.register(manifest);
}

// Automatic app discovery - no hardcoding needed
```

## Migration Timeline

| Phase | Duration | Focus | Go-Live |
|-------|----------|-------|---------|
| Phase 1: Analysis | 1 week | Planning, documentation | Internal review |
| Phase 2: Framework | 2 weeks | Infrastructure, utilities | Staging environment |
| Phase 3: Migration | 2 weeks | App by app, testing | Production release |
| Phase 4: Optimization | Ongoing | Performance, features | Continuous |

**Total**: 5 weeks to full consolidation

## Dependencies & Blockers

### No External Blockers
- All 10 apps are currently functional
- No breaking API changes required
- Desktop-server can support both old and new app locations during transition

### Internal Dependencies
- **Shared utilities**: Extract before migrating apps
- **Theme system**: Establish before UI migration
- **Build system**: Test with 1-2 apps before full rollout

## Rollback Plan

If consolidation encounters issues:
1. Keep old app-* packages in git history (don't force push)
2. Revert desktop-server app registry to read from old location
3. No data loss, full functionality preserved
4. Can retry consolidation in next phase

## Next Steps

1. **This week**: Review this plan with team
2. **Week 1**: Begin Phase 1 analysis
3. **Week 2-3**: Execute Phase 2 infrastructure
4. **Week 4-5**: Execute Phase 3 migrations
5. **Post-consolidation**: Document learnings, establish standards

## References

- **Current Apps**: See Tier 1 table above (all 10 apps, 100% complete)
- **Desktop Architecture**: See sequential-ecosystem CLAUDE.md section "Sequential Desktop"
- **App Manifests**: Each app has `manifest.json` with metadata
- **API Contracts**: `/api/tasks`, `/api/flows`, `/api/tools`, `/api/runs`, `/api/sequential-os`

---

**Document Version**: 1.0
**Last Updated**: December 1, 2025
**Status**: Ready for Phase 1 review
**Owner**: Sequential Team
