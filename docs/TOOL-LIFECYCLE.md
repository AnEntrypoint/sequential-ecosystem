# Tool Registration: Lifecycle & Visibility Model

Understanding tool registration eliminates confusion about persistence, visibility, and when changes take effect.

## Registration Methods Overview

| Method | Scope | Persisted | Visible To | When Available | Use Case |
|--------|-------|-----------|-----------|-----------------|----------|
| `sdk.tool(name, fn)` | App | Yes (default) | All apps | After registration + broadcast (~10ms) | App-owned tools |
| `sdk.tools.register()` | App | No | This app only | Immediately | Temporary/test tools |
| `ToolRegistry.saveTool()` | System | Yes (database) | All apps | Immediately + broadcast | Shared/global tools |
| `__callHostTool__('tool', ...)` | Remote | N/A | Via network | On each call | Cross-app calls |

## The Complete Lifecycle

### Path 1: Using `sdk.tool()` (Most Common)

```
┌─ App Startup
│
├─ sdk.tool('myTool', asyncFn, 'description')
│  └─ Register in local ToolRegistry
│
├─ autoRegister: true (default)
│  ├─ POST /api/tools/register (remote sync)
│  ├─ Tool persisted in database
│  └─ Broadcast via RealtimeBroadcaster
│
└─ Other Apps
   ├─ Receive broadcast on /ws/realtime
   ├─ Update local schema cache (via schema-invalidation-tracker)
   └─ See tool immediately in their tool lists

──────────────────────

⚠️  Important: Schema updates
  - When you change tool parameters: schema version increments
  - InvalidationTracker broadcasts new version
  - Apps clear their schema cache automatically
  - Latency: 10-50ms across network
```

**Visibility timeline**:
- T+0ms: Tool registered locally in your app
- T+10ms: Remote sync to database (if autoRegister=true)
- T+20-50ms: Other apps receive broadcast
- T+60ms: Other apps' caches updated

### Path 2: Using `sdk.tools.register()` (Local Only)

```
┌─ App Startup
│
├─ sdk.tools.register('myTool', asyncFn)
│  └─ Register in local ToolRegistry ONLY
│
├─ NOT sent to /api/tools/register
├─ NOT persisted to database
├─ NOT broadcast to other apps
│
└─ App Restart
   └─ Tool registration LOST (memory-only)
```

**Use when**: Temporary tools, test fixtures, dynamic tools created at runtime.

**Visibility**: This app only, immediately.

### Path 3: Using `ToolRegistry.saveTool()` (Persistent)

```
┌─ Anywhere in Code
│
├─ ToolRegistry.saveTool(toolDefinition)
│  └─ Save to database (persisted)
│
├─ Broadcast via RealtimeBroadcaster
├─ Other apps notified immediately
│
└─ On App Restart
   └─ Tool still available (loaded from database)
```

**Use when**: Creating tools programmatically that should survive restarts.

**Visibility**: All apps, across restarts.

### Path 4: Using `__callHostTool__('tool', ...)` (Remote)

```
┌─ Inside Task/Flow
│
├─ await __callHostTool__('tool', 'toolName', input)
│  └─ Send to server, execute there
│
└─ Results returned
   └─ No local registration required
```

**Use when**: Calling tools from another app, or tools you don't own.

**Visibility**: Remote execution, results returned.

---

## Schema Changes & Invalidation

When you update a tool's parameters, the system automatically handles schema cache invalidation.

### Scenario 1: Simple Parameter Change

```javascript
// V1: Your app registers tool
sdk.tool('fetchData', async (url: string) => { /* ... */ })

// Later: You add a new parameter
sdk.tool('fetchData', async (url: string, timeout: number = 5000) => { /* ... */ })

// What happens:
// 1. New schema version created (v2)
// 2. SchemaInvalidationTracker broadcasts version change
// 3. All apps clear their schema cache for 'fetchData'
// 4. Next SDK call to validate will get fresh schema
// 5. No restart needed
```

**Timeline**: ~20-50ms for all apps to see new schema.

### Scenario 2: Parameter Removal (Breaking Change)

```javascript
// V1:
sdk.tool('process', async (data: Object, deprecated: string) => { /* ... */ })

// V2 (removed deprecated param):
sdk.tool('process', async (data: Object) => { /* ... */ })

// What happens:
// 1. Schema version increments
// 2. Old code calling with 3 params will:
//    a. Fail validation (unexpected param 'deprecated')
//    b. Suggest: "parameter 'deprecated' not in schema"
// 3. Developer must update their code
```

**Best practice**: Use defaults for new params, don't remove params suddenly.

---

## Persistence Model

### Where Is My Tool Stored?

```
┌─ Tool Created with sdk.tool()
│
├─ ✓ Local memory (ToolRegistry in RAM)
├─ ✓ Database (if autoRegister=true)
├─ ✓ Realtime broadcasts (to other apps)
│
└─ On App Restart
   ├─ ✓ Reloaded from database (persisted)
   └─ ✓ Broadcast again to other apps
```

### What If App Crashes?

- **Local registration lost**: Yes (RAM is cleared)
- **Database registration intact**: Yes (persisted)
- **Other apps see it again after restart**: Yes (reloaded from DB)

### What If You Disable autoRegister?

```javascript
const sdk = new AppSDK({ autoRegister: false })

sdk.tool('myTool', fn)  // Registered locally only
// NOT sent to database
// NOT visible to other apps
// Lost on app restart
```

**Use when**: Testing, temporary tools, one-off scripts.

---

## Tool Visibility Rules

### Rule 1: A Tool Is Visible To...

| Registration Method | This App | Other Apps | After Restart |
|-------------------|----------|-----------|-----------------|
| `sdk.tool()` | ✓ | ✓ (via broadcast) | ✓ (from DB) |
| `sdk.tools.register()` | ✓ | ✗ | ✗ |
| `saveTool()` | ✓ | ✓ (immediate) | ✓ (from DB) |

### Rule 2: Tool Invocation Paths

```javascript
// From same app:
await sdk.tools('invoke', 'myTool', input)  // Direct, ~0ms

// From other app:
await __callHostTool__('tool', 'other-app:myTool', input)  // Network, ~50-200ms

// Remote doesn't require registration:
await __callHostTool__('task', 'fetch-user', input)  // Works if task exists anywhere
```

---

## Performance & Latency

### Schema Lookup

```
First call to tool:
  └─ Fetch schema from /api/tools/:toolName → 50-200ms
  └─ Cache for 5 minutes locally

Subsequent calls within 5 minutes:
  └─ Use cached schema → 0ms

After schema invalidation broadcast:
  └─ Cache cleared automatically
  └─ Next call fetches fresh schema
```

### Tool Invocation

```
Local tool (same app):
  └─ Direct function call → ~0-5ms

Remote tool (other app):
  └─ HTTP to /api/tools/app/:appId/:toolName → 50-200ms
  └─ Includes network latency
```

### Broadcast Delays

```
Tool registration broadcast:
  └─ Published to RealtimeBroadcaster → ~5ms
  └─ Received by other apps → ~10-50ms (network dependent)
  └─ Schema cache invalidated → immediate

Sequence guarantee:
  └─ BroadcastSequenceController prevents out-of-order updates
  └─ Even if broadcast #2 arrives before #1, only latest applied
```

---

## FAQ

**Q: I registered a tool. Why don't I see it in other apps?**
A: Check:
1. Did you use `sdk.tool()` or `autoRegister=true`? (required for broadcast)
2. Is the other app listening on `/ws/realtime`? (required to receive broadcasts)
3. Are they on the same server? (tools don't cross server boundaries)

**Q: My tool definition changed but the old version is still being called.**
A: Schema cache issue. Solution:
1. Check InvalidationTracker is enabled (default: yes)
2. Manually clear cache: `composerInstance.clearCache()`
3. Restart the app using the tool

**Q: Can I have two tools with the same name in different apps?**
A: Yes. Invocation uses namespace: `app-a:myTool` vs `app-b:myTool`. But you must explicitly specify which one.

**Q: What happens if I register the same tool name twice?**
A: Second registration overwrites the first (same app). Different apps can have same name with namespacing.

**Q: How long are tools persisted?**
A: Indefinitely, unless you explicitly delete them or the database is wiped. No TTL.

**Q: Can I share tools between apps securely?**
A: Use `ToolRegistry.saveTool()` (persisted, all apps can see). Authentication is per-request (checked at invocation time, not registration).
