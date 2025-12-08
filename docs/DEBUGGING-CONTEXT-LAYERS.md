# Debugging: Understanding the Four Context Layers

The system has four overlapping context/breadcrumb layers. Each solves a different debugging problem. Understanding them prevents confusion and enables expert debugging.

## The Four Layers

### Layer 1: Correlation ID (ExecutionContext)
**What it tracks**: The identity of this entire request/execution

```javascript
{
  correlationId: "uuid-4c2f8a9b-...",  // Unique per execution
  appId: "app-editor",
  userId: "user-123",
  sessionToken: "token-...",
  timestamp: "2025-12-08T10:15:22Z"
}
```

**Use for**: Finding all logs/events related to one execution

**Example**:
```
User in app-editor reports: "My save failed"
→ correlationId = abc-123
→ Search logs for correlationId = abc-123
→ See COMPLETE timeline of what happened
   - Request starts at T+0
   - Tool A finishes at T+50
   - Tool B starts at T+51
   - Tool B fails at T+62
   - Error returned at T+62
```

**Overhead**: <1% (just passing ID through context)

**Enable in**: Development, Staging, Production (always)

---

### Layer 2: Execution Breadcrumbs (ExecutionBreadcrumbs)
**What it tracks**: The chain of TOOLS called in sequence

```javascript
[
  { tool: 'fetchUser', action: 'start', timestamp: '...' },
  { tool: 'fetchUser', action: 'success', result: {...} },
  { tool: 'validateUser', action: 'start', timestamp: '...' },
  { tool: 'validateUser', action: 'error', code: 'INVALID_EMAIL' },
]
```

**Use for**: Understanding what tools were executed and in what order

**Example**:
```
Error message shows breadcrumb:
fetchUser (success) → validateUser (error)

Tells you: The user was fetched successfully, but validation failed.
If validateUser wasn't listed: It never ran, so the error happened before that.
```

**Overhead**: ~1-2% (tracking tool entry/exit)

**Enable in**: Development, Staging, Production (highly recommended)

---

### Layer 3: State Context Breadcrumbs (StateContextBreadcrumbs)
**What it tracks**: STATE transitions in a Flow, with input/output for each state

```javascript
{
  state: 'validateData',
  index: 2,
  input: { userId: '123', email: '...' },
  output: { valid: true, warnings: [...] },
  duration: 145,  // milliseconds
}
```

**Use for**: Understanding FLOW execution (which states ran, what data they processed)

**Example**:
```
You're debugging a Flow with states: [fetch, validate, transform, persist]

Error says: state='transform', input={'valid': true, ...}, stateIndex=3/4

Tells you:
- Fetch succeeded (ran before transform)
- Validate succeeded (input shows valid=true)
- Transform is where it failed
- Persist never ran (index 3 out of 4 = almost done)
```

**Overhead**: ~2% (tracking state entry/exit)

**Enable in**: Development, Staging, (optional in Production)

---

### Layer 4: Execution Trail (ExecutionTrail)
**What it tracks**: WHO CALLED THIS and from where

```javascript
{
  origin: {
    source: 'app-editor',        // Which app called this?
    sourceId: 'app-123',
    initiator: 'user',            // User action or system trigger?
    context: { flowId: 'flow-x' } // Additional context
  }
}
```

**Use for**: Understanding WHERE a request originated (which app, which flow state, which user)

**Example**:
```
Task 'process-data' is executing multiple times in a day.

With ExecutionTrail, you can see:
- 60% calls from 'app-batch-processor' (system)
- 30% calls from 'app-editor' (user clicked save)
- 10% calls from 'cron-job' (scheduled)

This tells you: Most calls are legitimate (batch processor), not unexpected.
```

**Overhead**: <1% (just capturing source context)

**Enable in**: Development, Staging, Production (helpful for multi-app systems)

---

## Decision Tree: Which Layer Do I Need?

### You're Seeing...

**An error message**:
```
Try this order:
1. Look at Correlation ID (Layer 1)
   → Find ALL events for this execution
2. Check Execution Breadcrumbs (Layer 2)
   → Which tools ran? Which failed?
3. If it's a Flow, check State Context (Layer 3)
   → Which state? What input? What output?
4. Check Execution Trail (Layer 4)
   → Did this come from expected source?
```

**Unexpected tool behavior**:
```
1. Execution Breadcrumbs (Layer 2)
   → Did this tool run at all?
   → How many times?
   → In what order relative to other tools?
2. State Context (Layer 3) if in a Flow
   → What input did the tool receive from previous state?
```

**Data corruption**:
```
1. Correlation ID (Layer 1) + Execution Breadcrumbs (Layer 2)
   → Find execution, see which tools wrote bad data
2. Check sequence numbers (broadcast-sequence-controller)
   → Did updates arrive out of order?
```

**Performance issue**:
```
1. State Context (Layer 3)
   → Which state is slow?
   → How long did it take (duration field)?
2. Execution Breadcrumbs (Layer 2)
   → Are tools running in sequence (slow) or parallel (fast)?
```

**Multi-app confusion**:
```
1. Execution Trail (Layer 4)
   → Which app called this?
   → Is that expected?
2. Correlation ID (Layer 1)
   → Follow the trace through all apps
```

---

## Overhead & Production Settings

| Layer | Overhead | Production Setting | Notes |
|-------|----------|-------------------|-------|
| Correlation | <1% | Always On | Negligible cost, essential for debugging |
| Breadcrumbs | 1-2% | Recommended | Minimal cost, high value |
| State Context | 2% | Optional | Higher cost, useful for Flow debugging |
| Trail | <1% | Recommended | Negligible cost, helpful for multi-app |

### Recommended Profiles

**Development**:
```
✓ Correlation ID: enabled
✓ Breadcrumbs: enabled
✓ State Context: enabled (all layers)
✓ Trail: enabled

Cost: ~5% performance overhead
Value: Maximum debuggability
```

**Staging**:
```
✓ Correlation ID: enabled
✓ Breadcrumbs: enabled
✓ State Context: enabled (for key flows)
✓ Trail: enabled

Cost: ~3% performance overhead
Value: Production-like debugging
```

**Production**:
```
✓ Correlation ID: enabled (required)
✓ Breadcrumbs: enabled (recommended)
✓ State Context: disabled (or sample 1/10 requests)
✓ Trail: enabled (recommended)

Cost: <2% performance overhead
Value: Incident debugging without overload
```

---

## How Layers Work Together

### Scenario: Multi-App Workflow Failure

```
app-editor calls flow 'generate-code'
  → flow-state-1: fetch template
    → tool: download-template (succeeds)
  → flow-state-2: process template
    → tool: parse-template (succeeds)
  → flow-state-3: generate code
    → tool: invoke-api (fails with timeout)

Error reported by app-editor:
"Generate code failed"

You investigate:

┌─ Step 1: Correlation ID
│  └─ Find all events for correlationId='xyz'
│
├─ Step 2: Execution Trail
│  └─ Confirms: source='app-editor', initiator='user'
│
├─ Step 3: Execution Breadcrumbs
│  └─ Shows: download-template ✓, parse-template ✓, invoke-api ✗
│
└─ Step 4: State Context
   └─ Shows: state-3 with input={template: {...}}, never produced output
     (confirms failure happened during code generation, not parsing)

Diagnosis: Template parsing succeeded, but code generation API timed out.
Action: Increase timeout or optimize generate code API.
```

---

## FAQ

**Q: Which layer should I log to?**
A: Use ExecutionContext's correlationId in all logs. The other layers are automatic.

```javascript
import { getCorrelationId } from '@sequential/app-sdk'

logger.info('Processing started', {
  correlationId: getCorrelationId(),
  userId: getCurrentUser()
})
```

**Q: Why do I see both breadcrumbs AND state context?**
A: Breadcrumbs show TOOL sequence. State context shows FLOW state sequence. In a Flow:
- Breadcrumbs: which tools, in what order
- State Context: which flow states, with input/output

Both together give you the complete picture.

**Q: My error doesn't have breadcrumbs attached. Why?**
A: Breadcrumbs are attached automatically. If missing:
1. Check if execution-breadcrumbs.js is initialized (default: yes)
2. Check if error happened before any tools ran
3. If in a Task without tool calls, breadcrumbs will be empty (that's normal)

**Q: How do I disable a layer for performance?**
A: Layers are enabled/disabled at app startup:

```javascript
const sdk = new AppSDK({
  enableBreadcrumbs: true,    // Default: true
  enableStateContext: false,  // Default: true
  enableTrail: true          // Default: true
})
```

**Q: Can I see breadcrumbs in real-time while task is running?**
A: Yes. Subscribe to execution updates:

```javascript
sdk.on('execution:breadcrumb', (breadcrumb) => {
  console.log(`Tool ${breadcrumb.tool} → ${breadcrumb.action}`)
})
```

**Q: Are breadcrumbs stored or just in-memory?**
A: In-memory only (last 50 items). If you need persistent debugging, query logs by correlationId (stored in database).
