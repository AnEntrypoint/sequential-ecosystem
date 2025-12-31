# Technical Caveats

**Memory Management**: Server requires `--max-old-space-size=4096` to avoid heap OOM on extended runs.

**StateKit Module Loading**: sequential-machine has mixed module types (CommonJS/ES Module). Server gracefully continues without StateKit initialization.

**Sequential-OS API**: `/api/sequential-os/*` endpoints return 503 when StateKit unavailable. Apps must handle gracefully.

**Path Validation**: Use `fs.realpathSync()` for validation to prevent symlink/traversal attacks.

**Concurrent File Operations**: Parent directories created atomically via `fs.ensureDir()` to prevent race conditions.

**Error Responses**: Stack traces never included (security). Only error messages sent to clients.

**Task Names**: Must be kebab-case without spaces. Display names cannot be used for API calls.

**Hot Reload**: ES modules cannot use function declarations at module level. Use const assignments.

**Process Management**: Never use `&` or `run_in_background`. Breaks tool access. Keep servers in foreground.

**Service Locator**: Use direct DI via `container.resolve('ServiceName')` instead of factory functions.

**Package Resolution**: All `@sequentialos/package` imports refer to local `packages/@sequentialos/package`. Node 18+ required for ES module support. Cannot use CommonJS `require()` at module level.

**API Response Format**: All endpoints return wrapped: `{success: boolean, data: {...}}`. Clients must unwrap data property.

**Task/Flow Execution**: Response format: `{success, data, taskId, runId, taskName, startTime, endTime, duration}`.

**Dynamic React Renderer**: Supports config-driven UI via ComponentRegistry singleton pattern with built-in error boundaries.
