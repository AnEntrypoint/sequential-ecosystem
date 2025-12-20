# Technical Caveats

**Memory Management**: Server requires `--max-old-space-size=4096` to avoid heap OOM on extended runs. Monitor for memory growth over time.

**StateKit Module Loading**: sequential-machine has mixed module types (CommonJS in lib/, ES Module in src/). Server gracefully continues without StateKit initialization (non-critical). Architectural refactoring deferred.

**Sequential-OS API**: `/api/sequential-os/*` endpoints return 503 when StateKit unavailable. Apps should handle gracefully without calling .map() on error responses.

**Zellous Module Resolution**: @sequentialosos/zellous-client-sd module not found in some apps (File Browser, Run Observer). Apps render and function correctly despite warning.

**API Response Format**: All endpoints return wrapped responses: `{success: boolean, data: {...}}`. Client apps must unwrap data property before processing.

**Path Validation**: Use `fs.realpathSync()` for path validation to prevent symlink and traversal attacks. Validate paths before all file operations.

**Concurrent File Operations**: Parent directories are created atomically before writes via `fs.ensureDir()` to prevent race conditions on concurrent requests.

**Error Responses**: Stack traces never included in error responses (security). Only error messages sent to clients.

**Task Names**: Must be kebab-case without spaces. Display names with spaces are metadata only and cannot be used for API calls.

**Hot Reload**: ES modules in `type="module"` scripts cannot use function declarations at module level (strict mode violation). Use const assignments instead.

**OS Task Filesystem Access**: OS tasks executed via sequential-machine have **IDENTICAL filesystem access to xstate tasks**. Both execution models provide:
- Full environment variables (`process.env`)
- Working directory control (`cwd: workdir`)
- System command execution via `spawn('sh', ['-c', cmd])`
- Complete filesystem operations (read/write/delete/execute)
- File descriptor access and inheritance

**Implementation Details**: xstate tasks use `execSync` from worker threads; OS tasks use `spawn` with full environment. Both provide complete host system access for legitimate use cases (file operations, system administration, container orchestration).

**Process Management**: NEVER use `&` (background processes) or `run_in_background` parameter. This breaks tool access (Playwright MCP, Glootie). Only test servers in foreground or use timeout wrapper. Keep development workflow as: `npm run dev` runs hot reload indefinitely until user stops it.

**Service Locator Anti-Pattern**: All 6 route files now use direct DI via `container.resolve('ServiceName')` instead of `createServiceFactory()`. This improves testability and reduces runtime service lookup overhead.

**Monorepo Structure (Dec 20, 2025)**: All packages are now inlined into the monorepo (`packages/@sequentialos/*`). No git submodules. All packages available locally without npm publishing. Single git repository with unified version control.

**GXE Dispatcher System (Dec 20, 2025)**:
- Repository distributed via GXE (https://github.com/AnEntrypoint/gxe)
- No npm publishing of individual packages
- Centralized entry points: `scripts/gxe-dispatch.js` router
- All dispatcher scripts use ES modules (import/export syntax)
- Webhook-style execution: `gxe . webhook:task --taskName=foo --input='{...}'`
- Compatible with Node 18+ for URL API (`fileURLToPath`)
- GXE caches repository in `~/.gxe/` for fast repeated execution

**Package Resolution (Dec 20, 2025)**:
- All `@sequentialos/package` imports refer to local `packages/@sequentialos/package`
- No external npm dependencies on @sequentialos packages
- Requires Node 18+ for ES module support with `type: "module"` in root package.json
- Cannot use CommonJS `require()` at top level in any .js files (strict ESM mode)

**CRITICAL: HTTP Request Hang (Dec 17, 2025)**: Desktop-server HTTP endpoints hang indefinitely (100% CPU, no response). Root cause: Event loop blocked during request handling, likely in route handler or middleware with synchronous I/O. Investigation findings:
- Server initializes successfully and prints startup logs
- HTTP server binds to port 8003 without error
- curl requests to any endpoint timeout after 3+ seconds
- Issue persists even when: (1) disabling request-logger middleware, (2) disabling rate-limit middleware, (3) registering only health endpoint, (4) reducing routes to single handler
- Suggests blocking I/O in route handler itself, not middleware
- 100% CPU usage indicates infinite loop or heavy sync computation
- TODO: Systematically profile each route handler for sync I/O; check for busy-wait loops in ServiceBootstrapper or dependency resolution
