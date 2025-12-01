# Sequential Ecosystem - Testing Infrastructure

## Overview

Comprehensive testing infrastructure covering all 45 packages with automated CI/CD pipeline, coverage tracking, linting, and security auditing.

**Status**: Infrastructure complete, expanding test coverage from 13% to 70%+
**Current Coverage**: 6/45 packages (13%)
**Target Coverage**: 70%+ code coverage across all packages

## Quick Start

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run linting
npm run lint

# Fix linting issues automatically
npm run lint:fix

# Watch mode (runs tests on file changes)
npm run test:watch
```

## Test Coverage Status

### Packages with Tests (6/45 - 13%)

| Package | Status | Coverage |
|---------|--------|----------|
| sequential-validators | ✓ | High |
| sequential-storage-utils | ✓ | High |
| sequential-adaptor | ✓ | High |
| sequential-adaptor-sqlite | ✓ | High |
| sequential-utils | ✓ | High |
| sequential-logging | ✓ | High |

### Packages Needing Tests (39/45 - 87%)

**Core Packages (12)**:
- core
- data-access-layer
- task-execution-service
- dependency-injection
- error-handling
- response-formatting
- param-validation
- file-operations
- input-sanitization
- websocket-broadcaster
- websocket-factory
- server-utilities

**Desktop Packages (5)**:
- desktop-server
- desktop-shell
- desktop-theme
- desktop-ui-components
- desktop-api-client

**Desktop Apps (10)**:
- app-terminal
- app-debugger
- app-code-editor
- app-flow-editor
- app-task-editor
- app-tool-editor
- app-task-debugger
- app-flow-debugger
- app-run-observer
- app-file-browser

**Sequential Packages (8)**:
- sequential-fetch
- sequential-flow
- sequential-machine
- sequential-runner
- sequential-http-utils
- sequential-wrapped-services
- sequential-wrapper
- sequential-adaptor-supabase

**Collaboration (3)**:
- zellous
- zellous-client-sdk
- chat-component

**CLI (1)**:
- cli-commands

## Test Architecture

### Test Runner

**Node.js Native Test Runner**: Using built-in `node:test` module
- No external test framework dependencies
- Native support for describe/test/before/after
- Fast execution
- Built-in parallel test execution

### Coverage Tool

**c8**: Istanbul-based coverage tool
- Configuration: `.c8rc.json`
- Thresholds: 70% minimum (lines, functions, branches, statements)
- Reports: text, text-summary, lcov, html
- Per-file coverage tracking

### Linting

**ESLint**: Code quality and style enforcement
- Configuration: `.eslintrc.json`
- Node.js + ES2022 environment
- CommonJS module support
- Custom rules for async/await, promises, complexity

## Creating Tests

### 1. Use the Test Template

Copy the template to your package:

```bash
cp templates/test-template.js packages/YOUR_PACKAGE/test/index.test.js
```

### 2. Test Structure

```javascript
const { test, describe, before, after } = require('node:test');
const assert = require('node:assert');
const { YourClass, yourFunction } = require('../src/index.js');

describe('Package Name Tests', () => {
  // Setup
  before(() => {
    // Runs once before all tests
  });

  // Teardown
  after(() => {
    // Runs once after all tests
  });

  describe('Feature Tests', () => {
    test('should handle expected input', () => {
      const result = yourFunction('input');
      assert.strictEqual(result, 'expected');
    });

    test('should throw error for invalid input', () => {
      assert.throws(() => {
        yourFunction(null);
      }, /Expected error message/);
    });
  });

  describe('Async Tests', () => {
    test('should resolve with expected value', async () => {
      const result = await asyncFunction();
      assert.strictEqual(result, 'expected');
    });

    test('should reject with error', async () => {
      await assert.rejects(
        async () => await asyncFunction('invalid'),
        /Expected error message/
      );
    });
  });
});
```

### 3. Add Test Script to package.json

```json
{
  "scripts": {
    "test": "node --test test/**/*.test.js",
    "test:watch": "node --test --watch test/**/*.test.js",
    "test:coverage": "c8 node --test test/**/*.test.js"
  }
}
```

### 4. Common Test Patterns

**Class Testing**:
```javascript
test('should create instance with config', () => {
  const instance = new MyClass({ option: 'value' });
  assert.ok(instance);
  assert.strictEqual(instance.config.option, 'value');
});
```

**Function Testing**:
```javascript
test('should return expected value', () => {
  const result = myFunction('input');
  assert.strictEqual(result, 'expected');
});
```

**Async/Await Testing**:
```javascript
test('should resolve promise', async () => {
  const result = await myAsyncFunction();
  assert.strictEqual(result, 'expected');
});
```

**Error Testing**:
```javascript
test('should throw on invalid input', () => {
  assert.throws(() => {
    myFunction(null);
  }, {
    name: 'ValidationError',
    message: 'Input cannot be null'
  });
});
```

**Edge Cases**:
```javascript
test('should handle empty input', () => {
  assert.doesNotThrow(() => myFunction(''));
});

test('should handle null', () => {
  assert.strictEqual(myFunction(null), null);
});

test('should handle undefined', () => {
  assert.strictEqual(myFunction(undefined), undefined);
});
```

## CI/CD Pipeline

### GitHub Actions Workflow

**File**: `.github/workflows/test.yml`

**Jobs**:
1. **test-infrastructure**: Core infrastructure packages (Node 18.x, 20.x, 22.x)
2. **test-core**: Core business logic packages (Node 18.x, 20.x, 22.x)
3. **test-desktop**: Desktop packages (Node 20.x)
4. **test-apps**: Desktop applications (Node 20.x)
5. **test-sequential**: Sequential execution packages (Node 18.x, 20.x, 22.x)
6. **test-collaboration**: Collaboration packages (Node 20.x)
7. **test-cli**: CLI commands (Node 18.x, 20.x, 22.x)
8. **security-audit**: npm audit + secret detection
9. **lint-check**: ESLint + naming conventions
10. **test-summary**: Aggregate results

**Triggers**:
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop`

**Matrix Strategy**:
- Node versions: 18.x, 20.x, 22.x (parallel execution)
- Package groups: Infrastructure, Core, Desktop, Apps, Sequential, Collaboration, CLI
- Fail-fast: Disabled (continue testing all packages even if one fails)

### Coverage Artifacts

Coverage reports are uploaded as artifacts (retention: 7 days):
- Format: HTML + LCOV
- Available per package
- Only generated on Node 20.x to reduce CI time

## Local Development

### Running Tests Locally

```bash
# All packages with tests
npm test

# Specific package
cd packages/sequential-validators
npm test

# Watch mode (auto-rerun on changes)
cd packages/sequential-validators
npm run test:watch

# With coverage
npm run test:coverage
```

### Coverage Reports

Coverage reports are generated in `./coverage/`:
- `index.html`: Interactive HTML report
- `lcov.info`: LCOV format for integrations
- `coverage-summary.json`: Summary statistics

Open coverage report:
```bash
npm run test:coverage
open coverage/index.html
```

### Linting

```bash
# Check all packages
npm run lint

# Auto-fix issues
npm run lint:fix

# Specific package
cd packages/desktop-server
npx eslint src/
```

## Testing Checklist

When adding new features or packages:

- [ ] Create `test/` directory in package
- [ ] Copy test template from `templates/test-template.js`
- [ ] Add `test` script to `package.json`
- [ ] Write unit tests for all exported functions
- [ ] Write integration tests for inter-package interactions
- [ ] Test edge cases (null, undefined, empty, large input)
- [ ] Test error handling and validation
- [ ] Run locally: `npm test`
- [ ] Check coverage: `npm run test:coverage`
- [ ] Verify coverage meets 70% threshold
- [ ] Run linting: `npm run lint`
- [ ] Fix any linting issues: `npm run lint:fix`
- [ ] Commit tests with feature code

## Security

### npm audit

Automatically runs in CI/CD to check for vulnerabilities:
```bash
npm audit --audit-level=moderate
```

### Secret Detection

CI/CD scans for hardcoded secrets:
- Passwords
- API keys
- Secret tokens

Pattern matching:
```bash
grep -r "password\s*=\s*['\"]" packages/ --include="*.js"
grep -r "api_key\s*=\s*['\"]" packages/ --include="*.js"
grep -r "secret\s*=\s*['\"]" packages/ --include="*.js"
```

### File Naming Conventions

Enforces kebab-case naming:
```bash
find packages -name "*.js" -type f | grep -v node_modules
```

Files with uppercase letters or underscores trigger warnings.

## Code Quality Standards

### Coverage Thresholds

Minimum 70% coverage required for:
- Lines
- Functions
- Branches
- Statements

Per-file coverage tracking enabled.

### Linting Rules

**Error-level**:
- No `eval()` or `new Function()`
- No undefined variables
- No unreachable code
- Semicolons required
- No `var` (use `const`/`let`)

**Warning-level**:
- Unused variables (prefix with `_` to ignore)
- Prefer `const` over `let`
- Single quotes preferred
- 2-space indentation
- Max line length: 120 characters
- Complexity limit: 15
- Max depth: 4 levels
- Max nested callbacks: 3
- Max parameters: 5
- Max statements per function: 50

### Performance Testing

Include performance tests for critical paths:
```javascript
test('should complete within time limit', async () => {
  const start = Date.now();
  await criticalFunction();
  const duration = Date.now() - start;
  assert.ok(duration < 1000, `Took ${duration}ms, expected < 1000ms`);
});
```

## Desktop App Testing

### HTML Validation

Desktop apps automatically validate HTML structure:
```bash
grep -q '<html' dist/index.html
grep -q '</html>' dist/index.html
```

### Manifest Validation

App manifests validated as valid JSON:
```bash
node -e "JSON.parse(require('fs').readFileSync('manifest.json', 'utf8'))"
```

## Troubleshooting

### Test Failures

**Issue**: Tests fail locally but pass in CI
- Check Node.js version: `node -v`
- Ensure dependencies installed: `npm install`
- Clear cache: `rm -rf node_modules && npm install`

**Issue**: Coverage below threshold
- Run coverage report: `npm run test:coverage`
- Open HTML report: `open coverage/index.html`
- Add tests for uncovered lines/branches

**Issue**: Linting errors
- Run: `npm run lint:fix`
- Review and commit auto-fixes
- Manually fix remaining issues

### CI/CD Issues

**Issue**: GitHub Actions workflow fails
- Check workflow file: `.github/workflows/test.yml`
- View logs in GitHub Actions tab
- Reproduce locally with same Node version

**Issue**: Coverage artifacts not uploading
- Ensure Node 20.x used for coverage
- Check artifact path in workflow
- Verify `coverage/` directory exists after tests

## Roadmap

### Phase 1 (Current): Infrastructure
- [x] Test template created
- [x] GitHub Actions workflow for all 45 packages
- [x] Coverage tracking with c8
- [x] ESLint configuration
- [x] Root test runner script
- [x] Documentation

### Phase 2: Core Coverage (Target: Feb 2025)
- [ ] Add tests to all 12 core packages
- [ ] Achieve 70%+ coverage on core
- [ ] Integration tests between core packages

### Phase 3: Desktop Coverage (Target: Mar 2025)
- [ ] Add tests to 5 desktop packages
- [ ] Add tests to 10 desktop apps
- [ ] End-to-end tests for desktop features

### Phase 4: Sequential Coverage (Target: Apr 2025)
- [ ] Add tests to 8 sequential packages
- [ ] State machine testing
- [ ] Flow execution testing

### Phase 5: Collaboration Coverage (Target: May 2025)
- [ ] Add tests to 3 collaboration packages
- [ ] WebRTC testing
- [ ] Multi-user scenario testing

### Phase 6: Full Coverage (Target: Jun 2025)
- [ ] 100% package coverage (all 45 packages)
- [ ] 70%+ code coverage globally
- [ ] Performance benchmarks
- [ ] Load testing

## References

- Test Template: `templates/test-template.js`
- GitHub Actions: `.github/workflows/test.yml`
- Coverage Config: `.c8rc.json`
- ESLint Config: `.eslintrc.json`
- Test Runner: `scripts/test-all.js`

## Contributing

When contributing tests:

1. Follow test template structure
2. Use descriptive test names
3. Test edge cases and error conditions
4. Maintain 70%+ coverage
5. Run tests locally before committing
6. Fix linting issues
7. Document complex test scenarios
8. Use mocks/stubs sparingly (prefer real implementations)

## Support

For testing questions:
- Check TESTING.md (this file)
- Review existing tests in infrastructure packages
- Use test template as starting point
- Run `npm test` locally before pushing
