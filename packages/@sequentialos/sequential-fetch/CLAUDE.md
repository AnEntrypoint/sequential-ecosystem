# CLAUDE.md - Sequential Fetch VM

## Project Overview

**sequential-fetch** (published as `sequential-fetch`) is a pure JavaScript virtual machine that executes code statement-by-statement and **pauses on every `fetch()` call**. It's a zero-dependency drop-in replacement for fetchflow, designed for cross-runtime compatibility (Node.js, Bun, Deno, Google Apps Script).

**Core Purpose:** Enable sequential fetch execution with pause/resume capability across any JavaScript runtime without external VM dependencies.

## Architecture

### Execution Model
- **Statement-by-statement execution:** Code is split into statements using regex-based parsing
- **Fetch detection:** Pattern matching for `fetch(` calls triggers pause state
- **Variable scope:** In-memory Map tracks variables across execution/resume cycles
- **Evaluation:** Uses native `eval()` within controlled variable scope

### Design Philosophy
- **Zero dependencies:** Pure JavaScript using only built-in primitives
- **Cross-runtime:** No runtime-specific APIs (no QuickJS, V8, etc.)
- **Simple over powerful:** Optimized for sequential data flow, not general-purpose execution
- **Pause/resume state:** Preserves variable state and remaining code at fetch points

## File Structure

```
sequential-fetch/
├── sequential-fetch-vm-lib.cjs    # Main library (CommonJS)
├── test-commonjs.js               # Comprehensive test suite
├── package.json                   # NPM package config
├── README.md                      # User documentation
├── CHANGELOG.md                   # Version history
├── LICENSE                        # MIT license
└── .gitignore                     # Git ignore rules
```

## Key Components

### SequentialFetchVM Class (sequential-fetch-vm-lib.cjs)

**Properties:**
- `variables: Map` - Stores variable name-value pairs
- `paused: Object|null` - Paused state with fetch ID, variables snapshot, remaining code
- `nextFetchId: number` - Auto-incrementing fetch identifier
- `_lastValue` - Last evaluated expression result

**Core Methods:**

1. **`initialize()`** - Idempotent initialization (currently no-op)
2. **`executeCode(code)`** - Entry point for code execution
3. **`_execute(code, remainingCode)`** - Internal execution loop
4. **`resumeExecution(fetchId, response)`** - Resume from paused state
5. **`dispose()`** - Cleanup resources

**Parsing Methods:**

6. **`_split(code)`** - Split code into statements (handles strings, brackets, semicolons)
7. **`_extractUrl(stmt)`** - Extract fetch URL from statement
8. **`_extractVarName(stmt)`** - Extract variable name from declaration

**Execution Methods:**

9. **`_executeStmt(stmt)`** - Execute single statement (var declaration, assignment, throw, expression)
10. **`_eval(expr)`** - Evaluate expression with variable substitution

### Helper Function

**`executeCode(code)`** - Convenience function that auto-creates and disposes VM for one-off execution

## Code Patterns & Conventions

### Statement Parsing
- Semicolon-delimited statements (handles nested brackets/strings)
- Regex patterns for variable declarations: `/^(const|let|var)\s+(\w+)\s*=\s*(.+)$/`
- Fetch detection: Simple string match `stmt.includes('fetch(')`

### Variable Handling
```javascript
// Declaration patterns supported:
const x = 5
let y = 10
var z = "hello"

// Assignment patterns:
x = 20
obj.property  // Property access

// Expression evaluation:
x + y         // Arithmetic with variable substitution
```

### Fetch Pause Mechanism
```javascript
// On fetch detection:
1. Generate fetchId
2. Extract URL and variable name
3. Snapshot current variables
4. Store remaining statements
5. Return pause result

// Pause result structure:
{
  type: 'pause',
  state: <fetchId>,
  fetchRequest: { id, url, options: null }
}
```

### Resume Flow
```javascript
// On resume:
1. Validate fetchId matches paused state
2. Assign response to fetch variable
3. Execute remaining statements
4. Return complete/pause/error result
```

## API Reference

### Result Types

**Pause:** `{ type: 'pause', state: <fetchId>, fetchRequest: {...} }`
**Complete:** `{ type: 'complete', result: <value> }`
**Error:** `{ type: 'error', error: <message> }` (via throw)

### Usage Patterns

**Simple execution:**
```javascript
const result = await executeCode('const x = 5; x * 2');
// result.result === 10
```

**Fetch handling:**
```javascript
const vm = new SequentialFetchVM();
const p1 = await vm.executeCode('const data = fetch("https://api.com/data"); data.id');
// p1.type === 'pause', p1.state === 1
const p2 = await vm.resumeExecution(1, { id: 123 });
// p2.type === 'complete', p2.result === 123
vm.dispose();
```

## Limitations (By Design)

**NOT SUPPORTED:**
- Loops (`for`, `while`, `do-while`)
- Conditionals (`if/else`, `switch`)
- Function definitions or calls
- `async/await` syntax
- Closures and complex scoping
- Array/object destructuring
- Template literals with expressions
- Advanced JavaScript features

**WHY:** Supporting these requires runtime-specific VM (QuickJS, V8), breaking cross-runtime compatibility. Current design uses only built-in primitives (`eval`, regex) that work everywhere.

**INTENDED USE CASE:**
```javascript
// Simple sequential data flow ✓
const userId = 123;
const user = fetch('https://api.example.com/user/' + userId);
const posts = fetch('https://api.example.com/posts?userId=' + user.id);
posts.length
```

**NOT INTENDED:**
```javascript
// Loops ✗
for (let i = 0; i < 10; i++) {
  const data = fetch(...);
}

// Functions ✗
function getData() {
  return fetch(...);
}
```

## Development Workflow

### Testing
```bash
npm test  # Runs test-commonjs.js
```

**Test Coverage:**
1. VM initialization
2. Basic arithmetic and expressions
3. Variable assignment and usage
4. Fetch detection and pause
5. Resume execution
6. Multi-statement execution
7. Error handling (throw)

### Publishing
```bash
npm publish
```

**Published files:** `sequential-fetch-vm-lib.cjs`, `README.md`, `CHANGELOG.md`, `LICENSE`

### Version History
- **1.0.0:** Removed QuickJS/Acorn dependencies, pure JavaScript implementation
- **Current:** 1.0.0 (npm package name: `sequential-fetch`)

## Important Implementation Details

### String Handling in _split()
- Tracks string boundaries (`"`, `'`, `` ` ``)
- Only splits on semicolons outside strings and balanced brackets
- Does NOT handle escape sequences in strings

### Expression Evaluation (_eval)
1. Literal values (numbers, strings, booleans, null, undefined)
2. Variable lookup from `this.variables`
3. Property access (single-level only: `obj.prop`)
4. Expression substitution with JSON.stringify for complex expressions

### Fetch URL Extraction
- Handles string literals: `fetch("url")`, `fetch('url')`
- Handles variable substitution: `fetch(baseUrl + "/path")`
- Falls back to `'unknown'` on extraction failure

### Error Handling
- `throw` statements detected via regex: `/^throw /`
- Error message extracted from `Error("message")` pattern
- Errors propagate up to caller

### State Preservation
- Variables snapshot: `new Map(this.variables)`
- Remaining code: Array slice of unparsed statements
- Fetch ID: Auto-incrementing counter (never resets)

## Code Style & Conventions

- **CommonJS module:** `module.exports` format
- **Async/await:** All public methods are async
- **Error handling:** Throw errors, no try-catch wrapping in public API
- **Naming:**
  - Private methods: Prefix with `_`
  - Public API: Camel case
  - Internal state: Descriptive names (`paused`, `variables`, `nextFetchId`)

## Common Tasks

### Adding New Statement Type Support
1. Add regex pattern in `_executeStmt()` or `_eval()`
2. Implement evaluation logic
3. Update tests in `test-commonjs.js`
4. Document in README limitations if not supported

### Debugging Execution Issues
- Check `_split()` for statement boundary detection
- Verify `_eval()` variable substitution logic
- Inspect `this.variables` Map state
- Review regex patterns for edge cases

### Extending API
- Maintain backward compatibility for `executeCode()` and `resumeExecution()`
- Add new methods to `SequentialFetchVM` class
- Export new functions via `module.exports`
- Update TypeScript types if added

## Dependencies

**Production:** None (zero dependencies by design)
**Development:** `@types/node@^20.0.0` (TypeScript definitions only)

**Engines:** Node.js >= 18.0.0 (also compatible with Bun, Deno, Google Apps Script)

## Package Details

- **Name:** `sequential-fetch` (npm package)
- **Version:** 1.0.0
- **License:** MIT
- **Repository:** https://github.com/AnEntrypoint/sequential-fetch
- **Main entry:** `sequential-fetch-vm-lib.cjs` (CommonJS)
- **Type:** `commonjs`

## Keywords for Context
fetchflow, sequential-fetch, vm, fetch, pause-resume, cross-runtime, nodejs, bun, deno, google-apps-script, javascript, zero-dependencies

---

**Last Updated:** 2025-06-20 (v1.0.0 release)
