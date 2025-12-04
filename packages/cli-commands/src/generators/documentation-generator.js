export function generateTechnicalDocumentation() {
  return `# Sequential Ecosystem - Complete Technical Reference

## Table of Contents
1. Core Concepts & Philosophy
2. Architecture & Design Patterns
3. Writing Tasks (Implicit & Explicit)
4. Dynamic React Component System
5. Advanced Patterns & Recipes
6. Storage Backends
7. Visual Component Builder
8. API Reference
9. CLI Commands
10. Deployment & Scaling
11. Troubleshooting
12. Performance & Best Practices

---

## Part 1: Core Concepts

### What is Sequential Ecosystem?

Sequential Ecosystem is an infinite-length task execution framework for distributed systems. Unlike traditional serverless (Lambda, Cloud Functions) which timeout after 15 minutes, Sequential automatically:

1. **Pauses on HTTP calls** (\`fetch()\`, \`__callHostTool__())\`
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

Tasks can read/write files at three scopes:

\`\`\`javascript
await __callHostTool__('writeFile', {
  path: 'progress.json',
  content: { completed: 50, total: 100 },
  scope: 'run'
});

await __callHostTool__('writeFile', {
  path: 'cache.json',
  content: { lastChecked: Date.now() },
  scope: 'task'
});

await __callHostTool__('writeFile', {
  path: 'config.json',
  content: { apiKey: 'secret', dbUrl: 'postgres://...' },
  scope: 'global'
});

const config = await __callHostTool__('readFile', {
  path: 'config.json',
  scope: 'auto'
});
\`\`\`

---

## Part 2: Architecture

### Unified Real-Time Storage System

Sequential Ecosystem v1.7.2+ provides a unified storage and real-time communication layer:

**StateManager (Core Storage)**
- Persistent key-value store organized by type (tasks, flows, components, etc.)
- Automatic change event broadcasting on create/update/delete
- Memory caching with LRU eviction and TTL
- Works with any adaptor: filesystem, SQLite, PostgreSQL, Supabase

**RealtimeBroadcaster (Real-Time Layer)**
- WebSocket-based pub/sub for all storage changes
- Auto-reconnection with exponential backoff
- Channel-based subscriptions for granular updates
- Used by components, apps, and debuggers for live sync

**Integration**
- StateManager emits events → RealtimeBroadcaster broadcasts to connected clients
- All data changes are automatically synchronized across all connected apps
- No manual sync code needed - framework handles it transparently

### Internal State Management

When a task calls \`fetch()\` or \`__callHostTool__()\`:

1. **Serializer** captures: variables, call stack, execution context
2. **Adaptor** persists to storage (folder/SQLite/PostgreSQL) via StateManager
3. **Unique run ID** generated (e.g., \`run-1702600000-abc123\`)
4. **RealtimeBroadcaster** emits change event to all connected apps
5. **HTTP response** sent immediately
6. **Next call** resumes from exact pause point with all state restored

---

## Part 3: Writing Tasks

### Implicit Pattern Example

\`\`\`javascript
export async function userOnboarding(input) {
  if (!input.email) throw new Error('Email required');

  const userCheck = await fetch(\`/api/check-email\`, {
    method: 'POST',
    body: JSON.stringify({ email: input.email })
  }).then(r => r.json());

  if (userCheck.exists) {
    throw new Error('User already registered');
  }

  const newUser = await fetch('/api/users', {
    method: 'POST',
    body: JSON.stringify(input)
  }).then(r => r.json());

  await fetch('/api/email/send', {
    method: 'POST',
    body: JSON.stringify({ to: input.email, template: 'welcome', name: input.name })
  }).then(r => r.json());

  await __callHostTool__('writeFile', {
    path: 'user-log.json',
    content: { userId: newUser.id, createdAt: nowISO() },
    scope: 'global'
  });

  return { success: true, userId: newUser.id };
}

export const config = {
  id: 'user-onboarding',
  name: 'User Onboarding',
  inputs: [
    { name: 'email', type: 'string', required: true },
    { name: 'name', type: 'string', required: true },
    { name: 'password', type: 'string', required: true }
  ],
  timeout: 300000,
  retries: 3
};
\`\`\`

### Explicit Pattern Example

\`\`\`javascript
export const graph = {
  id: 'paymentFlow',
  initial: 'validatePayment',
  states: {
    validatePayment: { onDone: 'authorizeCard', onError: 'rejectPayment' },
    authorizeCard: { onDone: 'captureAmount', onError: 'handleAuthFailure' },
    captureAmount: { onDone: 'sendReceipt', onError: 'reverseAuth' },
    sendReceipt: { onDone: 'complete' },
    rejectPayment: { type: 'final' },
    handleAuthFailure: { type: 'final' },
    reverseAuth: { type: 'final' },
    complete: { type: 'final' }
  }
};

export async function validatePayment(input) {
  const errors = [];
  if (!input.amount || input.amount < 0.01) errors.push('Invalid amount');
  if (!input.cardToken) errors.push('Card token required');
  if (errors.length > 0) throw new Error(errors.join(', '));
  return { validated: true, amount: input.amount };
}

export async function authorizeCard(data) {
  const result = await fetch('/api/stripe/authorize', {
    method: 'POST',
    body: JSON.stringify({ amount: data.amount, token: data.cardToken })
  }).then(r => r.json());

  if (!result.success) throw new Error('Authorization failed');
  return { authId: result.authId, amount: data.amount };
}

export async function captureAmount(data) {
  const result = await fetch('/api/stripe/capture', {
    method: 'POST',
    body: JSON.stringify({ authId: data.authId, amount: data.amount })
  }).then(r => r.json());

  if (!result.success) throw new Error('Capture failed');
  return { transactionId: result.transactionId };
}

export async function sendReceipt(data) {
  await fetch('/api/email/receipt', {
    method: 'POST',
    body: JSON.stringify({ transactionId: data.transactionId, amount: data.amount })
  }).then(r => r.json());

  return { status: 'complete', transactionId: data.transactionId };
}

export async function rejectPayment(error) {
  await fetch('/api/logging/error', {
    method: 'POST',
    body: JSON.stringify({ error: error.message, type: 'validation' })
  });
  return { status: 'rejected' };
}

export async function handleAuthFailure(error) {
  await fetch('/api/logging/error', {
    method: 'POST',
    body: JSON.stringify({ error: error.message, type: 'auth_failed' })
  });
  return { status: 'failed' };
}

export async function reverseAuth(data) {
  await fetch('/api/stripe/reverse', {
    method: 'POST',
    body: JSON.stringify({ authId: data.authId })
  }).then(r => r.json());
  return { status: 'reversed' };
}

export const config = {
  id: 'payment-workflow',
  name: 'Payment Processing',
  runner: 'flow',
  inputs: [
    { name: 'amount', type: 'number' },
    { name: 'cardToken', type: 'string' }
  ]
};
\`\`\`

---

## Part 4: Dynamic React Component System

### Overview

The Dynamic Component System enables buildless React development using components stored as JSX strings. Components are compiled at runtime using Babel, providing full React support without build steps. Components automatically inherit Sequential OS services and are part of the unified storage system.

### Component Architecture

**Three Core Systems:**

1. **Component Storage** (\`@sequential/persistent-state\`)
   - All components persisted via StateManager
   - Automatic real-time broadcasts on changes
   - Stored as type \`component\` in storage adapter
   - Survives server restarts

2. **Component Rendering** (\`@sequential/dynamic-components\`)
   - JSX parser with Babel transformation
   - SystemProvider: injects all OS services into components
   - Boundary components for error handling and loading states
   - React hooks for accessing Sequential services

3. **Visual Builder** (drag-drop interface)
   - Compose components without code
   - Real-time canvas preview
   - Property editing panels
   - Save directly to storage

### Using Components in Apps

#### 1. Load Components from Storage

\`\`\`javascript
import { DynamicComponentRenderer } from '@sequential/dynamic-components';

const renderer = new DynamicComponentRenderer();
await renderer.loadComponents();
const components = renderer.listComponents();
\`\`\`

#### 2. Render a Component

\`\`\`javascript
renderer.renderToElement('container-id', 'card', {
  title: 'My Card',
  content: 'Card content here'
});
\`\`\`

#### 3. Access System Services Inside Components

When components are rendered with \`SystemProvider\`, they automatically access:

\`\`\`javascript
import { useSystem, useStorage, useRealtime, useAppSDK, useAuth } from '@sequential/dynamic-components';

export function MyComponent() {
  const system = useSystem();           // All OS services
  const storage = useStorage();         // StateManager API
  const realtime = useRealtime();       // Real-time broadcasts
  const sdk = useAppSDK();              // Tool execution
  const auth = useAuth();               // Authentication context

  return <div>Component with full OS integration</div>;
}
\`\`\`

### Bootstrap System

On server startup, Sequential automatically initializes 7 example components:

- **Card**: Display content in styled container
- **Button**: Clickable button with variants
- **Badge**: Small label badge
- **Metric**: Display key metrics
- **Text Input**: Text field for user input
- **Alert**: Alert messages (success/error/info)
- **Header**: Page header with title

These components are stored in StateManager and immediately available for use.

### Component Storage Location

All components live in storage adapter under type \`component\`:

\`\`\`
~/.sequential/.state/component/
  card.json
  button.json
  badge.json
  [user-created components].json
\`\`\`

Properties:
- Persisted to disk/database
- Cached in memory with LRU
- Broadcast on all changes via RealtimeBroadcaster
- Accessible via \`/api/components\` endpoints

### System Context & Inheritance

Components inherit from OS via **SystemProvider**:

\`\`\`javascript
<SystemProvider
  stateManager={stateManager}
  realtimeBroadcaster={broadcaster}
  appSDK={sdk}
  auth={authContext}
  requestContext={{ path, method, headers }}
  errorHandler={errorHandler}
>
  {children}
</SystemProvider>
\`\`\`

All child components automatically access these services through hooks.

### Boundary Components

Automatic error handling and loading states:

- **ErrorBoundary**: Catches React errors with fallback UI
- **LoadingBoundary**: Shows loading state during async operations
- **OutletBoundary**: Combines ErrorBoundary + LoadingBoundary
- **ViewportBoundary**: Container with responsive sizing
- **MetadataBoundary**: Attaches component metadata

### Component Composition Example

\`\`\`javascript
// Store reusable dashboard component
const dashboardComponent = {
  name: 'Dashboard',
  description: 'Metric dashboard with cards',
  jsxCode: \`
React.createElement('div', { style: { display: 'grid', gap: '16px', gridTemplateColumns: '1fr 1fr' } },
  React.createElement('div', {}, 'Metric 1'),
  React.createElement('div', {}, 'Metric 2')
)
  \`
};

// Save to storage
await fetch('/api/components', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(dashboardComponent)
});

// Use in app
const renderer = new DynamicComponentRenderer();
await renderer.loadComponents();
renderer.renderToElement('app', 'dashboard');
\`\`\`

---

## Part 5: Advanced Patterns

### Retry with Exponential Backoff
\`\`\`javascript
export async function retryableTask(input) {
  const maxRetries = 5;
  let lastError;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const result = await fetch(\`/api/unstable-service\`).then(r => r.json());
      return { success: true, data: result };
    } catch (error) {
      lastError = error;
      if (attempt < maxRetries - 1) {
        const delayMs = Math.pow(2, attempt) * 1000 + Math.random() * 1000;
        await new Promise(r => setTimeout(r, delayMs));
      }
    }
  }

  throw lastError;
}
\`\`\`

### Batch Processing with Progress
\`\`\`javascript
export async function batchProcess(input) {
  const batchSize = 100;
  const items = input.items;
  const results = [];

  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);

    const batchResults = await Promise.all(
      batch.map(item =>
        fetch('/api/process', {
          method: 'POST',
          body: JSON.stringify(item)
        }).then(r => r.json())
      )
    );

    results.push(...batchResults);

    const progress = {
      current: Math.min(i + batchSize, items.length),
      total: items.length,
      percentage: Math.round((i + batchSize) / items.length * 100)
    };

    await __callHostTool__('writeFile', {
      path: 'progress.json',
      content: progress,
      scope: 'run'
    });
  }

  return { processed: results.length, results };
}
\`\`\`

### Resumable with Checkpoint
\`\`\`javascript
export async function resumableTask(input) {
  const checkpointFile = 'checkpoint.json';
  let checkpoint = { processed: 0, errors: [] };

  try {
    const existing = await __callHostTool__('readFile', {
      path: checkpointFile,
      scope: 'run'
    });
    checkpoint = JSON.parse(existing.content);
  } catch {
  }

  for (let i = checkpoint.processed; i < input.items.length; i++) {
    try {
      const item = input.items[i];

      const result = await fetch('/api/process', {
        method: 'POST',
        body: JSON.stringify(item)
      }).then(r => r.json());

      checkpoint.processed = i + 1;

      await __callHostTool__('writeFile', {
        path: checkpointFile,
        content: checkpoint,
        scope: 'run'
      });
    } catch (error) {
      checkpoint.errors.push({
        index: i,
        error: error.message,
        timestamp: nowISO()
      });

      await __callHostTool__('writeFile', {
        path: checkpointFile,
        content: checkpoint,
        scope: 'run'
      });

      throw error;
    }
  }

  return { processed: checkpoint.processed, errors: checkpoint.errors };
}
\`\`\`

### Rate Limiting
\`\`\`javascript
export async function rateLimitedTask(input) {
  const rateLimitPerSecond = 10;
  const results = [];

  for (let i = 0; i < input.items.length; i++) {
    const result = await fetch('/api/limited-service', {
      method: 'POST',
      body: JSON.stringify(input.items[i])
    }).then(r => r.json());

    results.push(result);

    if ((i + 1) % rateLimitPerSecond === 0 && i < input.items.length - 1) {
      await new Promise(r => setTimeout(r, 1000));
    }
  }

  return { processed: results.length, results };
}
\`\`\`

---

## Part 6: Storage Backends

#### Folder Adaptor (Default)
\`\`\`
tasks/
├── my-task/
│   ├── code.js
│   ├── config.json
│   └── runs/
│       ├── run-1702600000-abc123.json
│       ├── run-1702610000-def456.json
\`\`\`
- Zero setup
- Git-friendly (ignore runs/ in .gitignore)
- Perfect for dev/testing
- Single-machine only

#### SQLite Adaptor
\`\`\`bash
DATABASE_URL="sqlite:./tasks.db"
\`\`\`
- Persistent, queryable
- Single-machine (one writer)
- Fast file I/O
- Suitable for small teams

#### PostgreSQL/Supabase Adaptor
\`\`\`bash
DATABASE_URL="postgresql://user:password@host/dbname"
\`\`\`
- Distributed (multiple writers with locking)
- Horizontal scaling
- Production-grade
- Supports multi-region

---

## Part 7: Visual Component Builder

### Access the Builder

Navigate to \`/app-builder.html\` in the desktop shell.

### Component Workflow

1. **Browse Components**: Left panel shows all available components
2. **Drag to Canvas**: Drag components from left to center canvas
3. **Edit Properties**: Select component on canvas, edit properties in right panel
4. **Compose UI**: Arrange multiple components to build UIs
5. **Save Component**: Name your composition and save to storage
6. **Preview**: See the resulting JSX structure

### Drag-Drop System

\`\`\`javascript
// Components support drag-drop composition
// Select a component → right panel shows editable properties
// Changes update in real-time on canvas
// Save creates new component stored in StateManager
\`\`\`

### Component Property Editing

Each component shows editable properties in the right panel:

\`\`\`javascript
// Card component properties
{
  title: "Edit Title",
  content: "Edit Content"
}

// Button component properties
{
  label: "Edit Button Text",
  variant: "primary|secondary"
}

// All properties update canvas preview instantly
\`\`\`

### Exporting Composed Components

When you save a composition, it's stored as:

\`\`\`json
{
  "id": "my-dashboard",
  "name": "My Dashboard",
  "description": "Custom dashboard composition",
  "jsxCode": "React.createElement(...)",
  "created": "2025-12-04T12:34:56Z",
  "updated": "2025-12-04T12:34:56Z",
  "isExample": false
}
\`\`\`

### Using Saved Components in Apps

\`\`\`javascript
// After saving in builder, use anywhere in your app
const renderer = new DynamicComponentRenderer();
await renderer.loadComponents();

// Render your custom component
renderer.renderToElement('container', 'my-dashboard', {
  // pass any props needed
});
\`\`\`

---

## Part 8: API Reference

### Component Management Endpoints
\`\`\`
GET /api/components
  Returns all components from storage

GET /api/components/:id
  Returns specific component definition

POST /api/components
  Body: { name, jsxCode, description }
  Creates and broadcasts to all clients

PUT /api/components/:id
  Body: { name, jsxCode, description }
  Updates component and broadcasts

DELETE /api/components/:id
  Removes component and broadcasts deletion
\`\`\`

### Task Management Endpoints
\`\`\`
POST /api/tasks
  Body: { name, code, config }

GET /api/tasks
  Returns: [{ id, name, lastRun, status }]

POST /api/tasks/:taskName/run
  Body: { input }
  Returns: { runId, taskName, status }

GET /api/tasks/:taskName/history
  Returns: [{ runId, status, createdAt }]

GET /api/runs/:runId
  Returns: { runId, taskName, status, state, output }
\`\`\`

### File Operations
\`\`\`javascript
await __callHostTool__('writeFile', { path, content, scope });
const data = await __callHostTool__('readFile', { path, scope });
const files = await __callHostTool__('listFiles', { path, scope });
const exists = await __callHostTool__('fileExists', { path, scope });
await __callHostTool__('deleteFile', { path, scope });
await __callHostTool__('mkdir', { path, scope });
const result = await __callHostTool__('executeShell', { command, workingDir });
\`\`\`

---

## Part 9: CLI Commands

\`\`\`bash
# Initialize
npx sequential-ecosystem init
npx sequential-ecosystem init --no-examples

# Task management
npx sequential-ecosystem create-task <name> [--runner flow|machine|sequential-os]
npx sequential-ecosystem list
npx sequential-ecosystem run <name> --input '{json}'
npx sequential-ecosystem run <name> --input '{json}' --dry-run --verbose
npx sequential-ecosystem history <name>
npx sequential-ecosystem show <name> <run-id>
npx sequential-ecosystem delete <name>

# Configuration
npx sequential-ecosystem config set adaptor sqlite
npx sequential-ecosystem config show

# Server
npx sequential-ecosystem gui              # Desktop GUI (port 3001)
npx sequential-ecosystem server           # API server (port 3000)
\`\`\`

---

## Part 10: Deployment

### Development
\`\`\`bash
npx sequential-ecosystem init
npx sequential-ecosystem gui
\`\`\`

### Production (PostgreSQL)
\`\`\`bash
DATABASE_URL="postgresql://user:pass@prod.db/sequential" \\
NODE_ENV=production \\
npx sequential-ecosystem server
\`\`\`

### Horizontal Scaling
With PostgreSQL + multiple servers:
\`\`\`bash
DATABASE_URL="postgresql://..." PORT=3001 npx sequential-ecosystem server
DATABASE_URL="postgresql://..." PORT=3002 npx sequential-ecosystem server
# Use load balancer to distribute traffic
\`\`\`

---

## Part 11: Troubleshooting

**Task won't run:**
\`\`\`bash
npx sequential-ecosystem run my-task --input '{}' --dry-run --verbose
\`\`\`

**Check execution state:**
\`\`\`bash
npx sequential-ecosystem show my-task <run-id>
cat ./tasks/my-task/runs/run-*.json | jq .
\`\`\`

**Reset storage:**
\`\`\`bash
rm -rf ./tasks/*/runs
DATABASE_URL="sqlite:./tasks.db" rm ./tasks.db
npx sequential-ecosystem init
\`\`\`

---

## Part 12: Best Practices

1. **Always use scope when writing files** - prevents data loss across runs
2. **Implement checkpointing** - resume from exact failure point
3. **Log to global scope** - audit trail across all executions
4. **Use exponential backoff** - for API calls to unreliable services
5. **Test with --dry-run** - validate before production deployment
6. **Monitor run history** - track success/failure patterns
7. **Validate input early** - fail fast with clear error messages
8. **Handle partial failures** - be idempotent where possible

---

## Part 13: Examples

Run examples from ./tasks/:
\`\`\`bash
npx sequential-ecosystem run example-simple-flow --input '{}'
npx sequential-ecosystem run example-api-integration --input '{"url":"https://api.example.com"}'
npx sequential-ecosystem run example-batch-process --input '{"items":[1,2,3]}'
npx sequential-ecosystem run example-payment-flow --input '{"amount":100,"cardToken":"tok_123"}'
npx sequential-ecosystem run example-resumable-task --input '{"items":[1,2,3,4,5]}'
\`\`\`

---

Happy building! 🚀

**Quick Links:**
- GUI: http://localhost:3001
- API: http://localhost:3000
- Docs: Read all CLAUDE.md / AGENTS.md / GEMINI.md / README.md files
- Examples: ./tasks/ directory
`;
}
