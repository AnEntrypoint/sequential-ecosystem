# Paradigm Choice: Implicit Task vs Explicit Flow

Sequential Ecosystem supports two execution paradigms. Both are powerful; choosing correctly depends on your use case.

## Quick Decision Matrix

| Question | Answer → | Use **Implicit Task** | Answer → | Use **Explicit Flow** |
|----------|----------|----------------------|----------|----------------------|
| Does execution have branching logic? | No | ✓ | Yes | ✓ |
| Do you need error handling per-step? | No | ✓ | Yes | ✓ |
| Is every step run every time? | Yes | ✓ | No | ✓ |
| Do you need audit trail of state changes? | No | ✓ | Yes | ✓ |
| Is the whole thing <50 lines of code? | Yes | ✓ | No | ✓ |

## Pattern Guide

### Use Implicit Task When:
```javascript
// ✓ Sequential, no branching
export async function fetchAndProcess(input) {
  const data = await fetch(input.url).then(r => r.json());
  const validated = await __callHostTool__('validate', data);
  const result = await __callHostTool__('transform', validated);
  return result;
}

// ✓ Simple input → output mapping
// ✓ Error handling: catch at top level or let propagate
// ✓ All steps always execute (linear flow)
// ✓ Debugging: top-to-bottom, like normal code
```

**When NOT to use Task:**
- If you need to retry individual steps (retry logic scattered across code)
- If some steps are conditional (nested if statements get messy)
- If you need timeout per-step (global timeout only)
- If you need to audit "user called step X, it failed, they recovered in step Y" (no per-step history)

### Use Explicit Flow When:
```javascript
export const graph = {
  initial: 'fetchData',
  states: {
    fetchData: { onDone: 'validateData', onError: 'logError' },
    validateData: { onDone: 'transformData', onError: 'rollback' },
    transformData: { onDone: 'persistData', onError: 'cleanup' },
    persistData: { onDone: 'final', onError: 'cleanup' },
    cleanup: { type: 'final' },
    rollback: { type: 'final' },
    logError: { type: 'final' }
  }
};

export async function fetchData(input) { /* ... */ }
export async function validateData(data) { /* ... */ }
export async function transformData(data) { /* ... */ }
export async function persistData(data) { /* ... */ }
export async function logError(err) { /* ... */ }
export async function rollback(err) { /* ... */ }
export async function cleanup() { /* ... */ }
```

**When NOT to use Flow:**
- If your logic is simple linear sequence (Task is clearer)
- If every state is always executed (overhead of state machine)
- If error handling is simple (try-catch is simpler in Task)

## Side-by-Side Examples

### Example 1: Data Processing Pipeline

**Task Approach (Simple, Clear)**:
```javascript
export async function processPipeline(input) {
  const raw = await fetch(input.source);
  if (!raw.ok) throw new Error('Fetch failed');

  const data = await raw.json();
  if (!data.id) throw new Error('Missing ID');

  const processed = await __callHostTool__('process', data);
  const stored = await __callHostTool__('store', processed);

  return { success: true, id: stored.id };
}
```

**Flow Approach (Explicit Error Handling)**:
```javascript
export const graph = {
  initial: 'fetch',
  states: {
    fetch: { onDone: 'validate', onError: 'logFetchError' },
    validate: { onDone: 'process', onError: 'logValidationError' },
    process: { onDone: 'store', onError: 'logProcessError' },
    store: { onDone: 'success', onError: 'rollback' },
    success: { type: 'final' },
    logFetchError: { onDone: 'rollback' },
    logValidationError: { onDone: 'rollback' },
    logProcessError: { onDone: 'rollback' },
    rollback: { type: 'final' }
  }
};
```

**When to choose**:
- **Task**: You just need "try → process → store" with minimal error handling
- **Flow**: You need different error recovery for each step (fetch error ≠ validation error)

---

### Example 2: User Signup Flow

**Task Approach**:
```javascript
export async function signupUser(input) {
  const user = await __callHostTool__('createUser', input);
  const email = await __callHostTool__('sendEmail', user.id);
  const profile = await __callHostTool__('initProfile', user.id);
  return { userId: user.id };
}
```

**Flow Approach**:
```javascript
export const graph = {
  initial: 'createUser',
  states: {
    createUser: { onDone: 'sendWelcome', onError: 'userCreationFailed' },
    sendWelcome: { onDone: 'initProfile', onError: 'sendEmailFailed' },
    initProfile: { onDone: 'success', onError: 'profileInitFailed' },
    success: { type: 'final' },
    userCreationFailed: { onDone: 'cleanup' },
    sendEmailFailed: { onDone: 'notifyAdmin' },  // Email non-critical
    profileInitFailed: { onDone: 'cleanup' },
    notifyAdmin: { type: 'final' },
    cleanup: { type: 'final' }
  }
};
```

**When to choose**:
- **Task**: All steps equally critical, simple error handling
- **Flow**: Different steps have different error semantics (email failure ≠ profile init failure)

---

## Mental Model

Think of it this way:

**Implicit Task** = "I have a recipe: do A, then B, then C"
- If any step fails, the whole recipe fails
- You handle exceptions as they come up
- Perfect for: linear transformations, simple orchestration

**Explicit Flow** = "I have a process with decision points: if A succeeds go to B, if A fails go to recovery"
- Each step can branch to different next steps based on success/failure
- You explicitly define what happens in each failure case
- Perfect for: resilient systems, complex error recovery, audit requirements

---

## Performance & Overhead

- **Task**: ~0% overhead (just async code)
- **Flow**: ~2-5% overhead (state machine execution)

Use Task unless you specifically need Flow's branching/error-handling features.

---

## FAQ

**Q: Can I mix Tasks and Flows?**
A: Yes! A Flow state can call a Task via `__callHostTool__('task', taskName, input)`. A Task can't directly call a Flow state (but can via tool invocation).

**Q: If I choose wrong, how painful is it to switch?**
A: Moderate. Task → Flow requires adding error handlers and state definitions. Flow → Task requires removing state definitions and consolidating error handling. ~10 minutes for a simple example.

**Q: Which is more "correct"?**
A: Neither. Use the simplest tool that solves your problem. If linear works, use Task. If you need branching, use Flow.
