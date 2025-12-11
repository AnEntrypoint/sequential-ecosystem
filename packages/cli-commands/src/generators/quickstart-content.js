export function generateQuickstartMarkdown() {
  return `# 🚀 Quick Start Guide - Sequential Ecosystem

Welcome! You're all set to build tasks, flows, and apps with Sequential Ecosystem. This guide will get you running in **2 minutes**.

---

## What You Have

Your project now includes:

### 📚 Example Tasks (in \`./tasks/\`)

**Learn the Basics:**
- **example-simple-flow**: Basic task with auto-pause on fetch
- **example-api-integration**: Calling external APIs with retry logic
- **example-batch-processing**: Processing large datasets with checkpoints
- **example-payment-flow**: Complex workflows with state machines
- **example-resumable-task**: Long-running tasks that survive restarts

**Learn Integration Patterns:**
- **example-task-calls-tool**: Task calling tools (\`__callHostTool__('tool', ...)\`)
- **example-task-calls-task**: Task calling other tasks (\`__callHostTool__('task', ...)\`)
- **example-validate-input**: Reusable validation helper task
- **example-check-existing**: Reusable database check helper task
- **example-fetch-profile**: Reusable API fetch helper task

**Learn Flows & Orchestration:**
- **example-flow-calls-task**: Flow calling multiple tasks in sequence
- **example-flow-calls-tool**: Flow calling tools with coordination
- **example-flow-orchestration**: Complex flow with error handling

### 🛠️ Example Tools (in \`./tools/\`)
- **database.js**: Database query patterns
- **api-client.js**: HTTP client with exponential backoff
- **filesystem.js**: File operations and caching

### 📦 Documentation
- **README.md**: Full technical reference
- **CLAUDE.md**: For Claude Code & AI integration
- **AGENTS.md**: Agent and LLM patterns
- **GEMINI.md**: Google AI integration

---

## Start Here: Launch the GUI (2 minutes)

This is all you need to do:

\`\`\`bash
npx sequential-ecosystem gui
\`\`\`

Then open **http://localhost:3001** in your browser.

### What You'll See

The GUI has everything built-in:

1. **Task Explorer** - Browse and run example tasks
2. **Visual Builder** - Drag-drop to create UIs and components
3. **Code Editor** - Edit tasks, flows, and tools directly
4. **Debugger** - See execution flow, state, and timing in real-time
5. **Component Library** - Pre-built components (Card, Button, Badge, etc.)

---

## Using the GUI

### Run an Example Task

1. Open the Desktop GUI (\`npx sequential-ecosystem gui\`)
2. Find **example-simple-flow** in the left sidebar
3. Click **Run**
4. Watch it execute with auto-pause on HTTP calls
5. See the complete execution timeline in the debugger

### Explore Example Apps

1. Click **App Manager** in the left sidebar
2. You'll see 3 pre-built example apps:
   - **Task Dashboard**: Monitor tasks and flows
   - **Flow Visualizer**: See flow execution paths
   - **Task Explorer**: Search and browse all examples
3. Click any app to launch it
4. Customize or replace with your own apps

### Build Your First Component

1. Click **Component Builder** in the left sidebar
2. Drag **Card** component to canvas
3. Edit properties in the right panel
4. Save it with a name
5. Use it immediately in your apps

### Create Your First Task

1. Click **Create Task** button
2. Give it a name: \`my-first-task\`
3. Choose a template: **Simple Flow** or **API Integration**
4. Edit the code in the editor
5. Click **Save & Run**

### Monitor Execution

1. Run any task
2. See the **Timeline** showing each pause/resume point
3. View **State** at any point in execution
4. Check **Network** requests and responses
5. Read **Errors** with full stack traces

---

## Examples by Use Case

### I want to call APIs
→ Open **example-api-integration**
- Shows fetch with retry logic
- Auto-pauses on network calls
- Demonstrates error handling

### I want to process data
→ Open **example-batch-processing**
- Processes 1000s of items
- Shows progress tracking
- Resumable from checkpoints

### I want to build a workflow with multiple steps
→ Open **example-task-calls-task**
- Shows task calling other tasks
- Demonstrates validation flow
- Shows how to compose reusable tasks
- Example: validate → check-existing → fetch-profile

### I want to orchestrate with flows
→ Open **example-flow-calls-task** or **example-flow-orchestration**
- Shows flow calling multiple tasks
- Demonstrates explicit state machines with xstate
- Shows error handling and state transitions
- Example: order processing with payment → shipment → notification

### I want to call database or tools
→ Open **example-task-calls-tool**
- Shows task calling tools
- How to use database.js tool
- How to use api-client.js tool
- Pattern: \`__callHostTool__('tool-name', 'function', params)\`

### I want complex business logic
→ Open **example-payment-flow**
- Multi-step state machine
- Error paths and rollbacks
- Demonstrates explicit xstate pattern

### I want to build UI
→ Click **Component Builder**
- Drag-drop to compose
- Edit properties in real-time
- See preview instantly
- Save as reusable component

---

## Next Steps

### For Tasks & Flows
Read Part 1-5 of **README.md**:
1. Implicit pattern (write normal code, auto-pause)
2. Explicit pattern (state machines)
3. Advanced patterns (retry, batch, checkpoint)
4. Storage (folder, SQLite, PostgreSQL)
5. API reference

### For Components
Read Part 4 & 7 of **README.md**:
- How components inherit from OS services
- Building with the visual builder
- Component storage and real-time sync
- 7 built-in example components

### For Apps
Use the **App Editor** in GUI:
1. Create new app
2. Edit manifest.json, HTML, CSS, JS
3. Preview in real-time
4. Deploy to desktop

### For AI/Claude Integration
Read **CLAUDE.md** and **AGENTS.md**:
- Using with Claude Code
- LLM patterns and examples
- Building with agents

---

## Core Concepts (Simplified)

### Auto-Pause on HTTP
\`\`\`javascript
export async function myTask(input) {
  const data = await fetch(url).then(r => r.json());
  return { success: true, data };
}
\`\`\`

### Task Calls Tool
\`\`\`javascript
export async function myTask(input) {
  const result = await __callHostTool__('database', 'query', {
    sql: 'SELECT * FROM users'
  });
  return result;
}
\`\`\`

### Task Calls Another Task
\`\`\`javascript
export async function myTask(input) {
  const validated = await __callHostTool__('task', 'example-validate-input', {
    email: input.email
  });
  if (!validated.success) {
    throw new Error('Validation failed');
  }
  return { validated };
}
\`\`\`

### State Machines (Flows)
\`\`\`javascript
// State graphs coming in next iterations...
\`\`\`

For complete documentation, visit: https://sequential.ecosystem
`;
}
