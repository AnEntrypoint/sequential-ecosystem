# Iteration 4 Plan: Developer App Integration & UX Enhancements

**Status**: Planning | **Target Date**: Dec 8, 2025 | **Focus**: App Integration, Developer Friction Reduction

## Executive Summary

Iteration 4 focuses on reducing developer friction by integrating isolated developer apps into cohesive workflows. The main opportunity: editors (Task, Tool, Flow, App) are disconnected from executors and debuggers, forcing context-switching. Iteration 4 will create an **unified IDE experience** with execution, debugging, and testing all in one interface.

---

## Key Problems to Solve

### 1. **Execution Isolation**
- Task Editor has code execution but separate from debugger
- Flow Editor can't execute flows inline
- Tool Editor can't test tools without switching app
- Tool Executor and Task Executor are separate, minimal apps

**Solution**: Add execution panels to all editors

### 2. **Missing Developer Assistance**
- No syntax highlighting in Flow/App editors
- No auto-complete anywhere
- No error suggestions
- No template system in Tool/Flow/App editors

**Solution**: Add highlight.js + error analyzer + template system

### 3. **Artifact Navigation**
- Tasks can't see which flows use them
- Tools can't see which tasks use them
- No dependency graph visualization
- Users manually hunt for references

**Solution**: Build artifact cross-reference system

### 4. **Fragmented Workflows**
- Edit task → switch to executor → switch to debugger
- Edit flow → switch to different editor to visualize
- No side-by-side code/execution/debugging

**Solution**: Unified IDE with split-pane layout

---

## Proposed Features (Iteration 4)

### Phase 1: Syntax Highlighting (Week 1)

**All Code Editors**
- Add highlight.js CDN inclusion
- Apply to: Flow Editor code textarea, App Editor code sections, Tool Editor
- Support: JavaScript, JSON, HTML, CSS
- Colors: VS Dark theme integration

**Implementation**:
```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js"></script>
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/atom-one-dark.min.css">

// In textarea onchange:
hljs.highlightElement(element);
```

**Files to Update**:
- `app-flow-editor/dist/index.html`
- `app-app-editor/dist/index.html`
- `app-tool-editor/dist/index.html`

**Impact**: High (makes code much more readable, reduces errors)

---

### Phase 2: Integrated Execution (Week 2)

**Task Editor**
- Keep current execute + add "Run & Debug" option
- Run: execute and show output
- Run & Debug: open execution panel + flow debugger side-by-side

**Tool Editor**
- Add execution panel (mirror from Tool Executor)
- Show input fields, execute, display output/errors
- Add test case history

**Flow Editor**
- Add execution panel below canvas
- Support both simulation (current) and real execution
- Show state transitions in real-time with output

**Implementation**:
- Execution panel: 30% of screen, split-pane layout
- Reuse execution components from executors
- Stream output to console
- Show errors with line numbers

**Files to Update**:
- `app-task-editor/dist/index.html` - Add "Run & Debug" button
- `app-tool-editor/dist/index.html` - Add execution console
- `app-flow-editor/dist/index.html` - Add execution panel

**Impact**: High (saves context switching, enables rapid iteration)

---

### Phase 3: Enhanced Templates (Week 2-3)

**Task Editor** (expand from 3 → 7 templates)
1. Simple function (current)
2. Async with fetch (current)
3. With error handling (current)
4. Database query
5. File I/O operation
6. Task composition (calls other task)
7. Parallel execution

**Tool Editor** (add 5 templates)
1. Basic computation
2. HTTP API wrapper
3. Database tool
4. File system tool
5. Custom validation

**Flow Editor** (add 5 templates)
1. Linear workflow (3 states)
2. Error handling flow (success + error paths)
3. Conditional branching (if/switch)
4. Parallel branches
5. Loop/repeat pattern

**App Editor** (add 3 templates)
1. Dashboard layout
2. Form with submission
3. Data visualization

**Implementation**:
- Template dropdown in each editor
- Load template code on selection
- Pre-populate config/imports as needed

**Impact**: Medium-High (reduces boilerplate by 40%, speeds up new artifacts)

---

### Phase 4: Artifact Cross-References (Week 3-4)

**Task Dependencies**
- Show: "Used by flows: [list]"
- Click to navigate to that flow
- Show: "Uses tools: [list]"
- Click to jump to tool editor

**Tool Dependencies**
- Show: "Used by tasks: [list]"
- Show: "Used by flows: [list]"

**Flow Dependencies**
- Show: "Uses tasks: [list]"
- Show: "Uses tools: [list]"

**Implementation**:
- API endpoint: `/api/artifacts/dependencies/{id}`
- Returns: `{ usedBy: [...], uses: [...] }`
- Panel in each editor sidebar
- Click to navigate and open in new tab

**Files to Add**:
- `packages/desktop-server/src/routes/dependencies.js` - dependency resolver
- UI updates in editors

**Impact**: High (enables refactoring, reduces manual hunting for references)

---

### Phase 5: Error Suggestion Engine (Week 4)

**Error Categories**
- Syntax errors: "Missing closing brace on line 15"
- Reference errors: "Function 'undefined_fn' not found. Did you mean: 'definedFn'?"
- Type errors: "Expected object, got string. Update input schema?"
- Import errors: "Cannot find module 'axios'. Add to imports?"
- Validation errors: "Input missing required field 'userId'"

**Implementation**:
- Parse error message
- Suggest fixes based on pattern matching
- Show "Quick Fix" button with code change
- Support one-click auto-fix for common issues

**Example**:
```
Error: "Cannot find function 'calculateTotal' in module"
Suggestion: "Add 'calculateTotal' function or import from module"
Quick Fix: [Auto-add function stub]
```

**Files to Update**:
- All editors - error display sections

**Impact**: Medium (reduces debugging time by 20-30%)

---

## Implementation Priority

**Must Have** (Week 1-2):
1. Syntax highlighting in all editors
2. Integrated execution panels (Task + Tool + Flow)
3. Expanded templates (5-10 per editor)

**Should Have** (Week 3-4):
4. Artifact cross-references
5. Error suggestions

**Nice to Have** (Week 5+):
6. Live collaboration
7. Performance profiler
8. Mobile-responsive design

---

## Success Metrics

| Metric | Current | Target | Impact |
|--------|---------|--------|--------|
| Context switches per workflow | 5-7 | 1-2 | Reduce friction by 70% |
| Time to create artifact | 10-15 min | 3-5 min | 60% faster development |
| Error resolution time | 10 min | 3 min | 70% faster debugging |
| Template usage | 20% of users | 60% of users | Boilerplate reduction |
| Cross-reference navigation | Manual search | 1-click | 10x faster refactoring |

---

## Technical Decisions

### Syntax Highlighting
**Choice**: highlight.js (not CodeMirror/Monaco)
**Rationale**:
- Lighter weight (100KB vs 1MB+)
- Works with plain textarea (no Monaco container overhead)
- Easy to integrate with existing code
- Performance: instant highlight, no lag

### Execution Integration
**Choice**: Reuse existing executor components
**Rationale**:
- No code duplication
- Consistent behavior across apps
- Leverage proven execution paths
- Easy to maintain

### Dependency Resolution
**Choice**: Server-side API + client-side caching
**Rationale**:
- Accurate (reads actual artifact definitions)
- Scalable (doesn't load all artifacts into browser)
- Cacheable (dependencies change rarely)
- Can handle large projects

---

## Files to Create

```
ITERATION_4_SUMMARY.md         - Final summary after completion
ITERATION_4_IMPLEMENTATION.md  - Detailed implementation guide
packages/desktop-server/src/routes/dependencies.js  - Dependency API
packages/desktop-server/src/services/dependency-resolver.js  - Core logic
packages/app-*/dist/index.html (modified)  - Syntax highlighting + panels
```

---

## Testing Strategy

### Unit Tests
- Dependency resolver: 10 test cases (circular deps, missing artifacts, etc.)
- Error suggester: 15 test cases (all error types)

### Integration Tests
- Task editor + executor flow
- Flow editor + debugger flow
- Cross-reference navigation

### Manual Testing
- Create artifact → edit → execute → debug (full workflow)
- Dependency graph for complex projects (10+ artifacts)
- Error recovery workflows

---

## Risks & Mitigations

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|-----------|
| Split-pane layout breaks on small screens | Medium | Medium | Provide toggle, responsive CSS |
| Highlight.js performance hit | Low | Low | Lazy load, debounce updates |
| Dependency resolver has bugs | Medium | High | Comprehensive test suite |
| Error suggestions cause confusion | Low | Medium | Suggestions as hints, not auto-apply |

---

## Success Criteria

✅ All code editors have syntax highlighting
✅ All editors have execution/testing capability
✅ Templates reduce boilerplate creation time by 50%
✅ Dependency graph works for 5+ artifact projects
✅ Error messages suggest specific fixes
✅ No performance regression (same FCP/LCP as before)
✅ 100% backwards compatible

---

## Next Steps

1. **Approval**: Review this plan with team
2. **Detailed Design**: Create technical specs for each component
3. **Sprint Planning**: Break into weekly sprints
4. **Implementation**: Start with Phase 1 (syntax highlighting)
5. **Integration**: Connect components in Phase 5
6. **QA & Testing**: Comprehensive manual + automated testing
7. **Documentation**: Update developer guides
8. **Release**: Ship as Iteration 4

---

## Related Iterations

**Iteration 3**: Advanced debugging & observability (conditional breakpoints, metrics, regression testing)
**Iteration 4**: Developer app integration & UX (this document)
**Iteration 5+**: Real-time collaboration, visual profiler, advanced IDE features

---

**Plan Status**: ✅ Complete | **Ready for**: Implementation Sprint
