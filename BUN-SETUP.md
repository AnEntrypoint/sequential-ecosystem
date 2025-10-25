# Bun Development Environment Setup Guide

## Status

✅ Completed:
- Bun 1.3.1 installed and verified
- Hot reload dev server created (dev-bun.ts)
- Bun package links configured with `bun link`
- npm links setup scripts created

❌ Issues Found:
- Bun's dynamic `import()` doesn't resolve linked packages created by `bun link`
- TypeScript dynamic imports in dev-bun.ts can't find tasker-adaptor-sqlite, etc.

## Installation

```bash
# Bun is already installed at /home/user/.bun/bin/bun (v1.3.1)
/home/user/.bun/bin/bun --version
```

## Setup NPM Links

Two approaches available:

### Option 1: Using Bun Link (Current - Has Issues)
```bash
bash setup-npm-links.sh
```
Status: ✅ Links created but dynamic imports don't work

###Option 2: Using NPM Link (Recommended - Use Next)
```bash
bash setup-npm-links-v2.sh
```
Status: 🔄 Needs testing

## Start Development Server

```bash
# With PATH set
export PATH="$HOME/.bun/bin:$PATH"

# Start dev server (SQLite backend)
bun dev-bun.ts --sqlite

# Or with hot reload
bun --watch dev-bun.ts --sqlite

# Or use package.json script
npm run dev
```

## Test Health Check

```bash
curl http://localhost:3000/health
```

Expected response:
```json
{
  "status": "ok",
  "backend": "sqlite",
  "runtime": "Bun 1.3.1",
  "timestamp": "2025-10-25T22:52:42.581Z"
}
```

## Issues & Solutions

### Issue 1: Cannot find package 'tasker-adaptor-sqlite'

**Error:**
```
Handler error: error: Cannot find package 'tasker-adaptor-sqlite' from '/mnt/c/dev/sequential-ecosystem/dev-bun.ts'
```

**Root Cause:**
Bun's `bun link` creates symbolic links in the Bun cache, but Bun's module resolution for dynamic `import()` statements in TypeScript files doesn't properly resolve these linked packages.

**Solutions:**

1. **Use npm link instead** (Recommended)
   ```bash
   bash setup-npm-links-v2.sh
   ```

2. **Remove dynamic imports** (Alternative)
   - Replace `import("tasker-adaptor-sqlite")` with static imports at file top
   - Downside: Loses hot reload capability

3. **Use CommonJS require** (Not ideal for Bun)
   - Bun prefers ES modules
   - Would require module wrapper

4. **Add bunfig.toml** (Attempted - Didn't fully work)
   ```toml
   [install]
   linkPackageRoot = true
   ```

### Issue 2: Dynamic Imports and Module Resolution

**Problem:**
The dev-bun.ts file uses dynamic `import()` to support hot reloading, but this conflicts with how Bun resolves linked packages.

**Current Code (Problematic):**
```typescript
const { SQLiteAdapter } = await import("tasker-adaptor-sqlite");
```

**Solutions:**

1. **Use bun's built-in loader hooks** (Bun-specific)
   - Implement a custom module loader
   - More complex but preserves hot reload

2. **Use relative paths** (Simpler)
   ```typescript
   import { SQLiteAdapter } from "../packages/tasker-adaptor-sqlite/src/index.js";
   ```
   - Downside: Tight coupling

3. **Proxy through a wrapper package** (Elegant)
   - Create tasker-services package that re-exports adapters
   - Import from wrapper instead of individual packages
   - Wrapper uses static imports internally

## Recommended Fix Path

1. First, try Option 2 (npm link v2):
   ```bash
   bash setup-npm-links-v2.sh
   ```

2. If that doesn't work, modify dev-bun.ts to use relative imports:
   ```typescript
   // Instead of:
   // const { SQLiteAdapter } = await import("tasker-adaptor-sqlite");

   // Use:
   import { SQLiteAdapter } from "tasker-adaptor-sqlite";
   ```

3. If relative imports don't work either, use absolute paths with subpath resolution

## NPM Scripts

```bash
# Dev with Bun (primary)
npm run dev           # SQLite with watch
npm run dev:sqlite    # Explicit SQLite
npm run dev:supabase  # Supabase backend

# Dev with Node (fallback)
npm run dev:node      # Node.js with hot reload
npm run dev:node:supabase

# Testing
npm run test          # Run Bun tests
npm run test:tasker   # Test tasker-sequential

# Utilities
npm run health        # Check server health
npm run link          # Setup npm links
```

## Bun Configuration

File: `bunfig.toml`
```toml
[install]
registry = "https://registry.npmjs.org/"
linkPackageRoot = true
cacheDir = ".bun-cache"
```

## Troubleshooting Checklist

- [ ] Bun is installed: `which bun` or `/home/user/.bun/bin/bun --version`
- [ ] npm links are created: `npm link` shows registered packages
- [ ] Bun server starts: `bun dev-bun.ts --sqlite`
- [ ] Health check works: `curl http://localhost:3000/health`
- [ ] Task submission works: `curl -X POST http://localhost:3000/task/submit ...`
- [ ] Database is created: `ls -la tasks-dev.db`
- [ ] No module resolution errors in logs: `tail -f /tmp/bun-server.log`

## Performance Notes

- Bun startup: ~300ms
- Module resolution: Fast (native)
- Hot reload: ⚠️ Needs fixing
- SQLite operations: Very fast

## Next Steps

1. ✅ Install Bun
2. ✅ Setup npm links (bun link - working for packages, not for dynamic imports)
3. 🔄 Test npm link approach (v2)
4. 🔄 Fix dynamic import module resolution
5. 🔄 Test task submission end-to-end
6. ⏳ Implement hot reload testing
7. ⏳ Create test suite for adapters

## Resources

- [Bun Documentation](https://bun.sh)
- [Bun Package Linking](https://bun.sh/docs/cli/link)
- [Module Resolution](https://bun.sh/docs/runtime/modules)
- [Dynamic Imports](https://bun.sh/docs/runtime/import#dynamic-import)

## Known Limitations

1. Dynamic imports don't work with `bun link`
2. Type definitions might need adjustment for Bun
3. Some Node.js APIs might behave differently
4. Hot reload with linked packages needs workaround

## Development Tips

- Use `--watch` flag for automatic reload
- Check `/tmp/bun-server.log` for detailed errors
- Use `bun --help` to see all CLI options
- Export PATH before using bun: `export PATH="$HOME/.bun/bin:$PATH"`
