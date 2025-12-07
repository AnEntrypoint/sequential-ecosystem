# Sequential Ecosystem DX Guide

Developer experience guide for building tasks, tools, apps, and flows.

## Quick Start

```bash
# Create a task
npx sequential-ecosystem create-task my-task

# Create a tool
npx sequential-ecosystem create-tool my-tool --template compute

# Create an app
npx sequential-ecosystem create-app my-app --template dashboard

# Create a flow
npx sequential-ecosystem create-flow my-flow --states 5

# Run a task
npx sequential-ecosystem run my-task --input '{}'
```

## Tasks

Tasks are the simplest execution unit. They accept input and return output.

### Create a Task

```bash
npx sequential-ecosystem create-task process-data
```

**Options:**
- `--with-graph` - Use explicit state machine (xstate FlowState)
- `--runner flow|machine` - Choose execution runner (default: flow)
- `--inputs name,age` - Define input parameters
- `--description "..."` - Add description

### Task Structure

```javascript
export const config = {
  name: 'process-data',
  description: 'Process incoming data',
  inputs: [{ name: 'data', type: 'object' }]
};

export async function processData(input) {
  // Your logic here
  return { success: true, result: input };
}
```

### Task Patterns

**Simple Fetch + Transform:**
```javascript
export async function fetchUser(input) {
  const response = await fetch(`https://api.example.com/users/${input.userId}`);
  const user = await response.json();
  return { success: true, user };
}
```

**Error Handling:**
```javascript
export async function validateEmail(input) {
  try {
    if (!input.email?.includes('@')) {
      throw new Error('Invalid email format');
    }
    return { success: true, valid: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
```

**With Tool Call:**
```javascript
export async function saveData(input) {
  const result = await __callHostTool__('database', 'insert', {
    table: 'users',
    data: input
  });
  return { success: true, id: result.id };
}
```

### Run a Task

```bash
# Simple execution
npx sequential-ecosystem run process-data --input '{"name":"Alice"}'

# Via API
curl -X POST http://localhost:3000/api/tasks/process-data/run \
  -H "Content-Type: application/json" \
  -d '{"name":"Alice"}'

# Via AppSDK
const result = await sdk.tasks('run', 'process-data', { name: 'Alice' });
```

## Tools

Tools are reusable functions registered in the Tool Registry.

### Create a Tool

```bash
npx sequential-ecosystem create-tool fetch-user --template api \
  --description "Fetch user from API" --category "User Management"
```

**Templates:**
- `compute` - Data transformation and processing (default)
- `api` - HTTP requests to external APIs
- `database` - Database queries and operations
- `validation` - Input validation and verification

### Tool Structure

```javascript
export const config = {
  id: 'fetch-user-123',
  name: 'fetch-user',
  description: 'Fetch user from API',
  category: 'User Management',
  parameters: {
    userId: { type: 'string', description: 'User ID' },
    include: { type: 'string', description: 'Additional fields to include' }
  }
};

export async function fetchUser(input) {
  const { userId, include } = input;
  // Implementation
  return { id: userId, name: 'John Doe' };
}
```

### Register a Tool

**Via AppSDK (Runtime):**
```javascript
const sdk = new AppSDK({ appId: 'my-app' });

sdk.tool('greet', async (name) => `Hello, ${name}!`, 'Greeting tool');
sdk.tool('add', async (a, b) => a + b, 'Add two numbers');

await sdk.initTools(); // Batch register
```

**Via API (Persist):**
```bash
curl -X POST http://localhost:3000/api/tools \
  -H "Content-Type: application/json" \
  -d '{
    "id": "greet-tool",
    "name": "greet",
    "description": "Greeting tool",
    "implementation": "async (name) => `Hello, ${name}!`",
    "category": "Utilities"
  }'
```

### Use a Tool

```javascript
// In a task
const result = await __callHostTool__('app-id', 'tool-name', input);

// Via API
const response = await fetch('/api/tools/app/my-app/fetch-user', {
  method: 'POST',
  body: JSON.stringify({ userId: '123' })
});
```

### Tool Best Practices

1. **Keep it Simple:** One tool = one responsibility
2. **Error Handling:** Return structured error responses
3. **Logging:** Use logger.info/warn/error for debugging
4. **Timeout:** Set reasonable timeout values
5. **Validation:** Verify input types and required fields

**Example:**
```javascript
export async function validateAndSave(input) {
  // Validate input
  if (!input.email || !input.name) {
    throw new Error('Email and name are required');
  }

  // Process
  const saved = await saveToDb(input);

  // Return structured result
  return {
    success: true,
    id: saved.id,
    timestamp: new Date().toISOString()
  };
}
```

## Apps

Apps are web interfaces that use the AppSDK to interact with Sequential.

### Create an App

```bash
npx sequential-ecosystem create-app my-dashboard --template dashboard
```

**Templates:**
- `blank` - Minimal HTML scaffold
- `dashboard` - Pre-built dashboard with metrics cards
- `task-explorer` - List and search tasks
- `flow-viz` - Visualize flow state machines

### App Structure

```
apps/my-app/
├── manifest.json          # App metadata
└── dist/
    └── index.html         # UI code
```

### App Manifest

```json
{
  "id": "app-my-app",
  "name": "My App",
  "version": "1.0.0",
  "description": "My custom app",
  "icon": "📱",
  "entry": "dist/index.html",
  "capabilities": ["sequential-os", "realtime"],
  "window": {
    "defaultWidth": 1200,
    "defaultHeight": 800,
    "resizable": true
  }
}
```

### Using AppSDK

```javascript
// Initialize
const sdk = new AppSDK({ appId: 'app-my-app' });

// Storage (key-value)
await sdk.storage('set', 'user-preference', { theme: 'dark' });
const pref = await sdk.storage('get', 'user-preference');

// Real-time (WebSocket)
sdk.subscribe('updates', (msg) => console.log('Update:', msg));
sdk.broadcast('status', 'type', { ready: true });

// Tools
sdk.tool('myTool', async (input) => {}, 'Tool description');
await sdk.initTools();
const result = await sdk.tools('invoke', 'myTool', { /* input */ });

// Tasks
const result = await sdk.tasks('run', 'my-task', { /* input */ });

// LLM
const response = await sdk.llm('What is 2+2?', {
  model: 'claude-3-sonnet',
  maxTokens: 100
});
```

### App Best Practices

1. **Initialize AppSDK early** in your app's lifecycle
2. **Use real-time subscriptions** for live updates
3. **Handle errors gracefully** - show user-friendly messages
4. **Cache API results** - reduce unnecessary calls
5. **Responsive design** - works on different screen sizes

## Flows

Flows are explicit state machines for orchestrating multiple steps.

### Create a Flow

```bash
npx sequential-ecosystem create-flow data-pipeline --states 5 \
  --description "Multi-step data processing"
```

### Flow Structure

```javascript
export const config = {
  name: 'data-pipeline',
  description: 'Multi-step data processing'
};

export const graph = {
  id: 'pipeline-123',
  initial: 'initialize',
  states: {
    initialize: { onDone: 'fetch', onError: 'handleError' },
    fetch: { onDone: 'validate', onError: 'handleError' },
    validate: { onDone: 'process', onError: 'handleError' },
    process: { onDone: 'save', onError: 'handleError' },
    save: { type: 'final' },
    handleError: { type: 'final' }
  }
};

export async function initialize(context) {
  return { initialized: true, startedAt: Date.now() };
}

export async function fetch(context) {
  const data = await fetchData();
  return { data };
}

export async function validate(context) {
  if (!isValid(context.data)) throw new Error('Invalid data');
  return { validated: true };
}

export async function process(context) {
  return { processed: transformData(context.data) };
}

export async function save(context) {
  await saveData(context.processed);
  return { success: true };
}

export async function handleError(context) {
  logger.error('Pipeline failed:', context.error);
  return { success: false, error: context.error?.message };
}
```

### State Handler Types

**Code Handler:**
```javascript
{ handlerType: 'code', code: 'return { result: 42 };' }
```

**Task Handler:**
```javascript
{ handlerType: 'task', taskName: 'my-task' }
```

### Flow Patterns

**Sequential Pipeline:**
```
initialize → fetch → process → save → complete
```

**With Error Recovery:**
```
fetch → validate → retry (on error) → process
```

**Conditional Branching:**
```javascript
export async function checkStatus(context) {
  if (context.status === 'active') {
    return { onDone: 'processActive' };
  } else {
    return { onDone: 'processInactive' };
  }
}
```

### Run a Flow

```bash
npx sequential-ecosystem run data-pipeline --input '{"source":"api"}'
```

## Tool Registry API

### List Tools

```bash
# All tools
GET /api/tools

# Tools for an app
GET /api/tools/app/app-my-app

# Search
GET /api/tools/search?q=fetch

# By app
GET /api/tools/by-app
```

### Create Tool

```bash
POST /api/tools
Content-Type: application/json

{
  "name": "my-tool",
  "description": "What it does",
  "category": "Utilities",
  "implementation": "async (input) => { /* ... */ }",
  "parameters": {
    "param1": { "type": "string", "description": "..." }
  }
}
```

### Execute Tool

```bash
POST /api/tools/app/app-my-app/my-tool
Content-Type: application/json

{ "param1": "value" }
```

## Decision Trees

### Choose Task vs Flow

**Use Task if:**
- Single operation with no branching
- Simple input → output transformation
- Synchronous or single async operation

**Use Flow if:**
- Multiple sequential steps
- Error handling with alternate paths
- Complex orchestration
- Need to pause/resume execution

### Choose Tool Template

| Template | Use Case |
|----------|----------|
| `compute` | Transform, aggregate, filter data |
| `api` | HTTP requests, REST APIs, webhooks |
| `database` | SQL queries, document storage |
| `validation` | Input validation, type checking |

### Choose App Template

| Template | Use Case |
|----------|----------|
| `blank` | Custom HTML-only interface |
| `dashboard` | Metrics, KPIs, status displays |
| `task-explorer` | Task browsing and execution |
| `flow-viz` | Flow state visualization |

## Troubleshooting

### Task won't run

```bash
# Check syntax
npx sequential-ecosystem run my-task --dry-run

# Verbose output
npx sequential-ecosystem run my-task -v --input '{}'

# Check task file exists
ls tasks/my-task.js
```

### Tool not found

```bash
# List registered tools
curl http://localhost:3000/api/tools

# Search for tool
curl 'http://localhost:3000/api/tools/search?q=my-tool'

# Check app registration
curl http://localhost:3000/api/tools/app/app-my-app
```

### App not loading

```bash
# Check manifest is valid
cat apps/my-app/manifest.json | jq .

# Check HTML file exists
ls apps/my-app/dist/index.html

# Check browser console for errors
# Open DevTools → Console tab
```

### Flow state not transitioning

```javascript
// Make sure state handler returns properly
export async function myState(context) {
  // Must return something
  return { processed: true };
}

// onDone must point to existing state
states: {
  myState: { onDone: 'nextState' },  // ✓ nextState must exist
  nextState: { type: 'final' }
}
```

## Performance Tips

1. **Cache Results:** Store API responses in app storage
2. **Use Batching:** Combine multiple operations into one task
3. **Set Timeouts:** Prevent hanging requests
4. **Monitor Memory:** Check StateManager cache size
5. **Compress Data:** Minimize payload size for real-time sync

## Security Best Practices

1. **Validate Inputs:** Check type and format
2. **Sanitize Output:** Escape user-generated content
3. **Use Secrets:** Never commit API keys (use env vars)
4. **Auth Checks:** Verify user permissions
5. **Rate Limit:** Prevent tool abuse

## See Also

- **CLAUDE.md** - Project overview and architecture
- **CHANGELOG.md** - Recent changes and updates
- **TODO.md** - Outstanding tasks and improvements
