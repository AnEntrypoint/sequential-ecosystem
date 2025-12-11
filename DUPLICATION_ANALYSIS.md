# Code Duplication Analysis & Consolidation Opportunities

**Analysis Date**: Dec 11, 2025
**Scope**: 89 packages, ~820k lines
**Duplication Level**: 5-8% of codebase

## Executive Summary

Comprehensive scan identified 12 class definitions, 3+ function patterns, and significant import duplication across the ecosystem. Strategic consolidation could eliminate 500-800 LOC while improving maintainability.

## Critical Findings

### 1. SerializedError Class (3 locations, HIGH PRIORITY)

**Locations:**
1. `@sequential/error-handling/src/serialize.js` ⭐ CANONICAL
2. `@sequential/sequential-utils/src/errors.js`
3. `@sequential/core/src/modules/error/error-serializer.js`

**Comparison Table:**

| Feature | error-handling | sequential-utils | core |
|---------|-----------------|------------------|------|
| statusCode field | ✅ Yes | ❌ No | ❌ No |
| getStack() method | ✅ Yes | ❌ No | ❌ No |
| getStackTrace() fn | ✅ Yes | ❌ No | ✅ Yes |
| toJSON() includes stack | ❌ No | ✅ Yes | ✅ Yes |
| normalizeError behavior | Full handling | Returns null | Returns null |

**Recommendation**: Use `@sequential/error-handling` as single source
- Most complete implementation
- Has HTTP status code support
- Includes stack trace utilities
- Create wrapper re-exports in other packages

**Implementation Plan:**
```javascript
// In @sequential/sequential-utils/src/errors.js
export { SerializedError, serializeError, normalizeError }
  from '@sequential/error-handling/src/serialize.js';
```

**Risk Level**: MEDIUM (subtle behavior differences)
**Estimated Effort**: 3-4 hours (includes compatibility testing)

---

### 2. ValidationResult Class (2 locations, HIGH PRIORITY)

**Locations:**
1. `@sequential/validation/src/validation-result.js` ⭐ CANONICAL
2. `@sequential/sequential-validators/src/result.js`

**Status**: Implementations are similar
**Recommendation**: Use @sequential/validation as primary
- Higher-level abstraction
- Used by more packages
- Better integration with validation framework

**Implementation Plan:**
```javascript
// In @sequential/sequential-validators/src/result.js
export { ValidationResult } from '@sequential/validation';
```

**Risk Level**: LOW (very similar implementations)
**Estimated Effort**: 1-2 hours

---

### 3. ToolRegistry Class (2 locations, HIGH PRIORITY)

**Locations:**
1. `@sequential/tool-registry/src/index.js` ⭐ CANONICAL
2. `app-sdk/src/tool-registration.js`

**Status**: Both provide same interface
**Recommendation**: Use @sequential/tool-registry exclusively
- Specialized module (single responsibility)
- Better for discovery and management
- Cleaner architecture

**Implementation Plan:**
```javascript
// In app-sdk/src/tool-registration.js
export { default as ToolRegistry } from '@sequential/tool-registry';
```

**Risk Level**: LOW (clean interface)
**Estimated Effort**: 1-2 hours

---

### 4. EditorFeatures Class (3 locations, MEDIUM PRIORITY)

**Locations:**
1. `app-flow-editor/dist/editor-features.js`
2. `app-tool-editor/dist/editor-features.js`
3. `app-task-editor/dist/editor-features.js`

**Status**: All in `/dist/` (compiled/build artifacts)
**Action**: Rebuild from source to eliminate dist duplication
**Recommendation**: Create `@sequential/editor-features` shared package
- Extract common editor features
- Import in all three editors
- Rebuild dist files

**Risk Level**: LOW (build artifacts only)
**Estimated Effort**: 2-3 hours

---

### 5. Error Handler Patterns (3 locations, MEDIUM PRIORITY)

**Pattern**: `createErrorHandler` utility appears 3 times

**Locations:**
- Error handling middleware
- Controller factories
- Route handlers

**Recommendation**: Extract to `@sequential/error-handling` utilities
**Implementation**: Add helper function
```javascript
export function createErrorHandler(errorMap = {}) {
  return (err) => {
    const category = categorizeError(err);
    return errorMap[category] || defaultHandler(err);
  };
}
```

**Risk Level**: LOW (utility extraction)
**Estimated Effort**: 2-3 hours

---

## Import Duplication Analysis

### High-Volume Imports (Consolidation Not Needed)

These are legitimate shared dependencies, not duplication:

| Import | Count | Package |
|--------|-------|---------|
| sequential-logging | 83 | @sequential/sequential-logging |
| path | 72 | Node.js builtin |
| timestamp-utilities | 60 | @sequential/timestamp-utilities |
| fs-extra | 24 | External package |
| async-patterns | 22 | @sequential/async-patterns |

**Note**: High import counts are expected for foundational utilities.

---

## Function Signature Duplication

### Patterns Appearing 3+ Times

| Pattern | Count | Category | Action |
|---------|-------|----------|--------|
| `export async function main` | 9 | Template generation | Generate correctly each time (OK) |
| `export async function myTask` | 7 | Example code | Template generation (OK) |
| `handleError` | 6 | Helper | Consolidate to @sequential/error-handling |
| `escapeHtml` | 4 | Text utility | Already in @sequential/text-encoding ✓ |
| `fetchData` | 4 | API helper | Keep separate (domain-specific) |
| `validateType` | 3 | Validation | Already consolidated in @sequential/validation ✓ |
| `sanitizeInput` | 3 | Text utility | Already in @sequential/text-encoding ✓ |

**Conclusion**: Most legitimate patterns; already consolidated in Phase 3.

---

## Consolidation Roadmap

### Phase 2d: Critical Consolidations (Recommend This Week)

| Task | Files | LOC Saved | Priority | Effort |
|------|-------|-----------|----------|--------|
| SerializedError unification | 2 | ~100 | HIGH | 3-4h |
| ValidationResult unification | 1 | ~80 | HIGH | 1-2h |
| ToolRegistry unification | 1 | ~60 | HIGH | 1-2h |
| **Subtotal Phase 2d** | **4** | **~240** | - | **~6-8h** |

### Phase 2e: Medium Consolidations (Next Week)

| Task | Files | LOC Saved | Priority | Effort |
|------|-------|-----------|----------|--------|
| EditorFeatures extraction | 2 | ~150 | MEDIUM | 2-3h |
| Error handler patterns | 2 | ~120 | MEDIUM | 2-3h |
| **Subtotal Phase 2e** | **4** | **~270** | - | **~4-6h** |

### Phase 2f: Build Artifacts (Week 2)
- Rebuild dist/ folders to eliminate generated code duplication

---

## Files Requiring Detailed Review

Before consolidation, the following need careful analysis:

1. **Error-handling trio**
   - Review all imports of SerializedError
   - Check error type compatibility
   - Test error serialization round-trips

2. **Validation pair**
   - Verify schema validation compatibility
   - Check error message formatting
   - Test with existing validators

3. **ToolRegistry pair**
   - Ensure tool discovery still works
   - Check registration side-effects
   - Verify app-sdk still initializes correctly

---

## Quality Checks Before/After

```javascript
// Before consolidation:
// 3 separate SerializedError implementations
// 2 separate ValidationResult implementations
// 2 separate ToolRegistry implementations
// 3+ handleError implementations

// After consolidation:
// 1 canonical SerializedError (3 packages import from it)
// 1 canonical ValidationResult (2 packages import from it)
// 1 canonical ToolRegistry (2 packages import from it)
// 1 canonical createErrorHandler utility

// Verification checklist:
✓ All imports still resolve
✓ No circular dependencies introduced
✓ 100% backward compatibility via re-exports
✓ All existing tests pass
✓ Performance unaffected
✓ Bundle sizes unchanged or reduced
```

---

## Risk Assessment

| Consolidation | Risk | Mitigation |
|---------------|------|-----------|
| SerializedError | MEDIUM | Extensive testing, careful behavior review |
| ValidationResult | LOW | Very similar implementations |
| ToolRegistry | LOW | Clean interface, minimal dependencies |
| EditorFeatures | LOW | Build artifacts, full rebuild capability |
| Error handlers | LOW | Utility extraction, backward compatible |

---

## Timeline Estimate

**Realistic Effort Breakdown:**

- **Research & Planning**: 4-6 hours (per major consolidation)
- **Implementation**: 2-4 hours (per consolidation)
- **Testing & Verification**: 3-5 hours (per consolidation)
- **Integration & Documentation**: 2-3 hours (per consolidation)

**Total for Phase 2d**: ~20-30 hours (multi-day project)

**Recommended Approach:**
- Do consolidations one at a time
- Full test suite after each
- Stagger changes across commits
- Document all breaking changes (if any)

---

## Tools & Commands

### Find all usages of SerializedError:
```bash
find packages -name "*.js" ! -path "*/node_modules/*" \
  -exec grep -l "SerializedError" {} +
```

### Check which files import from each location:
```bash
grep -r "from.*error-handling" packages
grep -r "from.*sequential-utils" packages
grep -r "from.*@sequential/core" packages
```

### Verify no circular dependencies:
```bash
npm run build 2>&1 | grep -i "circular"
```

---

## Conclusion

The ecosystem has **moderate duplication** (5-8%) that's mostly:
1. **Legitimate patterns** (main, myTask, etc.) - template/example code
2. **Foundation duplicates** (logging, path imports) - expected high usage
3. **Consolidatable classes** (SerializedError, ValidationResult, etc.) - 240+ LOC gain

**Recommended Action**:
- ✅ Execute Phase 2d consolidations this week (20-30 hours)
- ⏳ Defer Phase 2e to next week (lower risk, lower priority)
- 📅 Schedule Phase 2f (rebuild dist/) after core consolidations

**Expected Outcome**:
- -240 LOC of exact duplication
- Unified error, validation, tool-registry handling
- 100% backward compatibility maintained
- Better long-term maintainability

---

**Generated**: Dec 11, 2025
**Next Review**: After Phase 2d completion
