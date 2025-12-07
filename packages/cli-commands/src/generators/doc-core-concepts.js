export function coreConceptsSection() {
  return `## Part 1: Core Concepts

### What is Sequential Ecosystem?

Sequential Ecosystem is an infinite-length task execution framework for distributed systems. Unlike traditional serverless (Lambda, Cloud Functions) which timeout after 15 minutes, Sequential automatically:

1. **Pauses on HTTP calls** (\`fetch()\`, \`__callHostTool__()\`)
2. **Saves complete execution state** (variables, call stack, context)
3. **Resumes on next trigger** (webhook, scheduled, API call)
4. **Never loses progress** even across server restarts

### Three Execution Patterns

#### Pattern 1: Implicit (Sequential-JS) - 80% of Use Cases
Write normal async code. Pause/resume triggered automatically by \`fetch()\` calls.

\`\`\`javascript
export async function processOrder(input) {
  const user = await fetch(\`/api/users/\${input.userId}\`).then(r => r.json());
  const payment = await fetch('/api/charge', { method: 'POST', body: JSON.stringify({ userId: input.userId, amount: 100 }) }).then(r => r.json());
  if (!payment.success) throw new Error('Payment failed');
  const confirmation = await fetch('/api/confirm', { method: 'POST', body: JSON.stringify({ orderId: input.orderId }) }).then(r => r.json());
  return { status: 'complete', confirmation };
}
\`\`\`

#### Pattern 2: Explicit (FlowState/xstate) - Complex Workflows
Define state machine. Executor follows transitions, calling handlers.

\`\`\`javascript
export const graph = {
  id: 'orderFlow',
  initial: 'validateInput',
  states: {
    validateInput: { onDone: 'fetchUser', onError: 'handleInvalidInput' },
    fetchUser: { onDone: 'processPayment', onError: 'handleMissingUser' },
    processPayment: { onDone: 'sendConfirmation', onError: 'handlePaymentFailed' },
    sendConfirmation: { onDone: 'complete' },
    handleInvalidInput: { type: 'final' },
    handleMissingUser: { type: 'final' },
    handlePaymentFailed: { type: 'final' },
    complete: { type: 'final' }
  }
};

export async function validateInput(input) {
  if (!input.userId || !input.orderId) throw new Error('Missing required fields');
  return { valid: true };
}

export async function fetchUser(input) {
  return await fetch(\`/api/users/\${input.userId}\`).then(r => r.json());
}
\`\`\`

#### Pattern 3: Container (Sequential-OS) - System Workflows
Shell commands + content-addressable layers for system-level workflows.

\`\`\`javascript
export async function buildApp(input) {
  const steps = [
    { cmd: 'npm install', label: 'Install dependencies' },
    { cmd: 'npm run build', label: 'Build project' },
    { cmd: 'npm run test', label: 'Run tests' },
    { cmd: 'npm publish', label: 'Publish to npm' }
  ];

  for (const step of steps) {
    const result = await __callHostTool__('executeShell', {
      command: step.cmd,
      workingDir: input.projectDir
    });
    if (result.exitCode !== 0) throw new Error(\`\${step.label} failed\`);
  }

  return { success: true };
}
\`\`\`

### State Scopes

Each task has access to scoped state, persistent across pauses:

\`\`\`javascript
export async function processLargeDataset(input) {
  for (let i = 0; i < input.items.length; i++) {
    globalThis.__state = globalThis.__state || { processed: 0 };
    const item = input.items[i];

    const result = await fetch('/api/process', {
      method: 'POST',
      body: JSON.stringify(item)
    }).then(r => r.json());

    globalThis.__state.processed++;
    globalThis.__state.lastItem = item.id;
  }

  return { processed: globalThis.__state.processed };
}
\`\`\`

---

## Part 2: Architecture & Design Patterns

### System Architecture

Sequential uses a layered architecture:

- **Execution Layer**: Task runners with automatic pause/resume
- **Storage Layer**: Pluggable backends (folder, SQLite, Supabase, PostgreSQL)
- **Scheduler Layer**: Cron-like scheduling with pause/resume
- **API Layer**: RESTful + WebSocket APIs for task submission and monitoring
- **Component Layer**: React components for UI building

### Design Patterns

1. **Implicit Pause Pattern**: Code pauses automatically when fetch() or __callHostTool__() is called
2. **Explicit State Machine Pattern**: Declare states and transitions, executor follows path
3. **Composable Tasks Pattern**: Break complex workflows into smaller tasks that call each other
4. **Idempotent Processing**: Design tasks to handle re-execution safely
5. **Event-Driven Pattern**: Tasks triggered by events (webhooks, schedules, API calls)

`;
}
