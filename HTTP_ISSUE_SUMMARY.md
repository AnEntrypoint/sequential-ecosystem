# HTTP Request Handling Issue - Investigation Summary

## Status: CRITICAL BLOCKER - Requires Root Cause Analysis

## Problem Statement
Server initializes successfully and listens on port 8003, but HTTP requests are never processed. TCP connections are accepted, but route handlers are never called.

## Observations
- Server initialization completes successfully (logs "Sequential Desktop Server initialized")
- HTTP server listen callback IS triggered (`httpServer.listen(PORT, callback)` - callback executes)
- TCP connections from curl are accepted (connection established, no connection refused)
- HTTP requests hang indefinitely with no response (124 timeout exit code)
- Route handlers are NEVER called - no console logs from inside route functions
- Issue occurs even with minimal Express app with single test route
- Issue persists after removing setupWebSocket, middleware, and all routes except test

## What Has Been Tried
1. Disabling setupWebSocket - **No improvement**
2. Removing all middleware - **No improvement**
3. Removing all route registrations - **No improvement**
4. Adding simple test route directly in server.js before listen() - **No improvement**
5. Minimal Express app test (isolated) - **Works fine**
6. Test curl against minimal Express server - **Successful**

## Key Diagnostic Information
- Server code IS executing (debug logs show app creation, route registration)
- Express app creation succeeds: `const app = express()`
- HTTP server creation succeeds: `const httpServer = http.createServer(app)`
- Server listen succeeds: `httpServer.listen(PORT, callback)` - callback triggers
- Requests timeout on curl side (SIGTERM after 3 seconds timeout)
- No error messages in server logs

## Root Cause Theories
1. **Module Loading Issue**: ESM/CommonJS mixing in dependency chain
2. **Node.js Version Mismatch**: Express incompatibility with Node.js 22.11.0
3. **Express Version Issue**: Specific Express version not properly initialized
4. **Package Dependency Problem**: One of the @sequentialos packages preventing HTTP parsing
5. **Event Loop Blocking**: Some background operation (setImmediate queues) blocking HTTP parser
6. **Framework Integration Issue**: How http.createServer() is receiving the Express app

## Session 3 Findings
- Tested with `app.listen()` instead of `http.createServer(app)` - **No improvement**
- Tested without diagnostic listeners - **No improvement**
- Verified app.listen() callback does trigger - server IS listening
- Issue persists with both http.createServer() and app.listen() patterns
- HTTP requests accepted at TCP level but not processed by Express
- Suggests problem is in Express itself or how it's initialized in this codebase

## Next Steps - Session 3
1. **Run with debug flags**: `node --trace-http --trace-warnings packages/@sequentialos/desktop-server/src/server.js`
2. **Check Express version**: Verify Express is properly installed and compatible
3. **Module inspection**: Check what version of 'express' is actually being imported
4. **Dependency audit**: Run `npm audit` and check for version conflicts
5. **Minimal server test**: Create a test file with only HTTP and minimal Express, NO @sequentialos imports
6. **Trace middleware chain**: Add logging at each middleware to find where HTTP gets stuck
7. **Request listener test**: Add explicit `httpServer.on('request')` listener to verify it's being called
8. **Port check**: Verify no other process is on port 8003 in production state

## Files Modified
- `packages/@sequentialos/desktop-server/src/server.js` - Server initialization
- `packages/@sequentialos/desktop-server/src/routes/health.js` - Debug logging added/removed
- `packages/@sequentialos/desktop-server/src/routes/apps.js` - Debug logging added/removed

## Reference Commits
- `17eddef`: Queue loading fix (working, not related to HTTP issue)
- `e394d16`: Hot reload setup (working, not related to HTTP issue)

## Session History

**Session 2**:
- Took 60+ minutes to narrow down issue
- Confirmed minimal Express works in isolation
- Confirmed server is listening and accepting connections
- Confirmed route handlers are not being called
- Issue is NOT with middleware, routes, or setupWebSocket

**Session 3 (Current - ROOT CAUSE FOUND!)**:
- **Key Discovery**: StateKit initialization causes event loop/import blocking
  - When StateKit is initialized FIRST, then importing @sequentialos/server-utilities HANGS
  - This is a CommonJS/ESM interop issue with sequential-machine module

- **Critical Finding: ROOT CAUSE IDENTIFIED** 🎯
  - **StateKit initialization blocks the HTTP event loop**
  - Systematic staging tests prove:
    - Stage 1-4 (up to hot reload): HTTP works perfectly ✅
    - Stage 5 (add StateKit): HTTP breaks completely ❌
  - Stage 5 detailed logging shows:
    - Server IS listening (`[LISTEN-CALLBACK] Server is listening`)
    - HTTP connections ARE accepted (TCP handshake works)
    - BUT connection events NEVER fire (`[HTTP:connection]` missing)
    - Route handlers NEVER execute
    - No HTTP responses sent

- **Root Cause Analysis**:
  - StateKit's `initializeStateKit()` function is blocking the Node.js event loop
  - This prevents the HTTP parser from being invoked on incoming connections
  - Even though `await initializeStateKit()` completes, some state in Node.js is corrupted
  - Possibly related to: StateKit's background `kit.status()` call with `setImmediate()`
  - Or: Some synchronous operation within StateKit constructor

- **Proof**:
  - Removed the last synchronous `await` - the issue remains
  - Routes, middleware, WebSocket all work fine without StateKit
  - HTTP responds perfectly in Stage 4
  - HTTP completely broken the moment StateKit is initialized

**Session 4 (FINAL - ISSUE RESOLVED!)**:
- ✅ **FIXED**: StateKit initialization deferred to after HTTP listen()
- ✅ **SOLUTION**: Moved StateKit init to setImmediate() in httpServer.listen() callback
- ✅ **TESTED**: HTTP requests now succeed immediately (no timeouts)
- ✅ **VERIFIED**: Dev server with hot reload works perfectly
- ✅ **IMPACT**: All HTTP endpoints now accessible - Task Executor, Flow Engine, WebSocket ready

**Root Cause**: StateKit's synchronous constructor (fs.mkdirSync, Store init, Snapshot init)
was called BEFORE HTTP server creation, corrupting Node.js event loop state.

**The Fix**:
```javascript
// BEFORE (broken):
const kit = await initializeStateKit(...);  // Line 57-58, before HTTP server
httpServer = http.createServer(app);        // Line 163

// AFTER (fixed):
let kit = null;                              // Line 59, deferred
httpServer.listen(PORT, () => {             // Line 242
  setImmediate(async () => {                // Line 258
    kit = await initializeStateKit(...);    // Line 262, after HTTP listen
  });
});
```

**Commits**:
- `b918e85`: fix: Defer StateKit initialization to prevent HTTP event loop corruption
- `c059277`: chore: Update desktop-server submodule (StateKit HTTP fix)

**Test Results**:
- ✓ Direct curl: HTTP request succeeds
- ✓ npm run dev: Server starts with hot reload, HTTP works
- ✓ StateKit: Initializes successfully in background
- ✓ All routes: Registered and accessible
- ✓ No timeouts: curl responses received immediately
