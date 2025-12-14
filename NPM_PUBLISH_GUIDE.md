# NPM Publishing Guide - sequential-ecosystem

## Current Status (Dec 14, 2025)

**Git**: ✅ All code pushed to GitHub (commit 1d8b392)
**NPM**: ⏳ Blocked by authentication - npm token expired

## What's Ready

**32 @sequentialos Scoped Packages:**
- @sequentialos/timestamp-utilities
- @sequentialos/core
- @sequentialos/async-patterns
- @sequentialos/error-handling
- @sequentialos/response-formatting
- @sequentialos/sequential-logging
- @sequentialos/server-utilities
- @sequentialos/websocket-broadcaster
- @sequentialos/route-helpers
- @sequentialos/app-path-resolver
- @sequentialos/core-config
- @sequentialos/request-validator
- @sequentialos/param-validation
- @sequentialos/crud-router
- @sequentialos/data-access-layer
- @sequentialos/dependency-injection
- @sequentialos/dependency-middleware
- @sequentialos/event-broadcaster
- @sequentialos/file-operations
- @sequentialos/input-sanitization
- @sequentialos/operation-logger
- @sequentialos/persistent-state
- @sequentialos/service-factory
- @sequentialos/task-execution-service
- @sequentialos/unified-validation
- @sequentialos/websocket-factory
- @sequentialos/sequential-os-http
- @sequentialos/desktop-server
- (@sequentialos/code-snippets, cli-commands, app-sdk, etc.)

**12 Sequential-Prefixed Packages:**
- sequential-fetch
- sequential-flow
- sequential-logging
- sequential-machine
- sequential-runner
- sequential-adaptor
- sequential-utils
- sequential-validators
- sequential-http-utils
- sequential-storage-utils
- sequential-wrapper
- sequential-wrapped-services

All packages have:
- ✅ package.json with correct metadata
- ✅ Main entry files (index.js)
- ✅ Proper @sequentialos scope (scoped packages)
- ✅ MIT license

## Publishing Blockers

### Issue 1: Expired npm Auth Token
```
Error: Access token expired or revoked
```

**Solution**: Run `npm login`
```bash
npm login
# Enter npm username, password, and 2FA code if enabled
```

### Issue 2: @sequentialos Organization Setup
For scoped packages (@sequentialos/*), you need either:

1. **npm Pro Account** ($7/month)
   - Allows unlimited scoped packages
   - More flexible

2. **@sequentialos Organization** (free)
   - Requires npm org membership
   - Run: `npm org add <username> @sequentialos`
   - Requires org owner/admin to approve

**Current Setup**: Unclear if @sequentialos org exists. If not, create via:
```bash
npm org create @sequentialos
```

## Publishing Steps (When Auth Fixed)

### Option A: Publish All Packages (Batch)
```bash
cd /home/user/sequential-ecosystem

# Run provided script (publishes in order)
bash /tmp/publish-packages.sh
```

### Option B: Publish Individual Packages
```bash
cd packages/@sequentialos/timestamp-utilities
npm publish --access public

cd ../../sequential-fetch
npm publish --access public

# ... repeat for each package
```

### Option C: Publish from Root (Using Workspaces)
```bash
npm install
npm publish --workspaces
```

## Verification After Publishing

```bash
# Check if package appears on npm
npm view @sequentialos/timestamp-utilities

# Verify version
npm info @sequentialos/timestamp-utilities@1.0.0
```

## Package Versions

All packages are currently at version 1.0.0 (or 1.8.0 for root)

**To bump versions before publishing:**
```bash
# For individual packages
cd packages/@sequentialos/package-name
npm version patch  # or minor, major
npm publish --access public

# Or manually edit package.json and bump version
```

## Troubleshooting

### "404 Not Found - PUT https://registry.npmjs.org/@sequentialos/..."
**Causes:**
- Organization doesn't exist
- Organization not set up for publishing
- Account not part of org

**Fix:**
- Create org: `npm org create @sequentialos`
- Or verify org membership: `npm org ls @sequentialos`

### "Not authorized - PUT https://registry.npmjs.org/..."
**Cause**: Auth token invalid or revoked

**Fix:** `npm login` and re-enter credentials

### "Package already published at version X.Y.Z"
**Cause**: Package already on npm registry

**Fix:** Bump version: `npm version patch && npm publish --access public`

## Next Actions

1. **Renew npm authentication**
   ```bash
   npm login
   ```

2. **Verify/Create @sequentialos org**
   ```bash
   npm org ls @sequentialos
   # If fails, create:
   npm org create @sequentialos
   ```

3. **Publish packages**
   ```bash
   cd /home/user/sequential-ecosystem
   bash /tmp/publish-packages.sh
   ```

4. **Verify on npm registry**
   ```bash
   npm search @sequentialos
   npm view @sequentialos/timestamp-utilities
   ```

## Additional Notes

- All packages follow MIT license
- All have proper metadata in package.json
- Code consolidated from @sequential → @sequentialos namespace migration
- Desktop server includes 13 routes registered
- All dependencies are correctly mapped
