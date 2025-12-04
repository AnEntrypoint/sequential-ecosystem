export function generateQuickstart() {
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
\\\`\\\`\\\`javascript
export async function myTask(input) {
  const data = await fetch(url).then(r => r.json());
  return { success: true, data };
}
\\\`\\\`\\\`

### Task Calls Tool
\\\`\\\`\\\`javascript
export async function myTask(input) {
  const result = await __callHostTool__('database', 'query', {
    sql: 'SELECT * FROM users'
  });
  return result;
}
\\\`\\\`\\\`

### Task Calls Another Task
\\\`\\\`\\\`javascript
export async function myTask(input) {
  const validated = await __callHostTool__('task', 'example-validate-input', {
    email: input.email
  });
  if (!validated.success) {
    throw new Error('Validation failed');
  }
  return { validated };
}
\\\`\\\`\\\`

### State Machines (Flows)
\\\`\\\`\\\`javascript
export const graph = {
  initial: 'fetchData',
  states: {
    fetchData: { onDone: 'processData' },
    processData: { onDone: 'complete' },
    complete: { type: 'final' }
  }
};
\\\`\\\`\\\`

---

## Keyboard Shortcuts (in GUI)

- **Ctrl+S / Cmd+S**: Save current file
- **Ctrl+Shift+D**: Open Debugger
- **Ctrl+Shift+B**: Build/Compile
- **Ctrl+K**: Search tasks/components
- **Ctrl+,**: Settings

---

## File Structure

After init, you have:

\`\`\`
my-project/
├── tasks/
│   ├── example-simple-flow/
│   │   ├── code.js          (Task code)
│   │   ├── config.json      (Metadata)
│   │   └── runs/            (Auto-saved execution states)
│   └── [your-tasks]/
├── tools/
│   ├── database.js
│   ├── api-client.js
│   └── filesystem.js
├── .sequential/
│   ├── apps/                (User apps)
│   └── .state/              (Component storage)
├── README.md                (Full tech reference)
├── QUICKSTART.md           (This file!)
├── .sequentialrc.json       (Config)
└── .gitignore
\`\`\`

---

## Troubleshooting

### Task won't run?
1. Check the debugger for errors
2. Verify input JSON is valid
3. Check file paths are correct

### GUI won't load?
1. Make sure port 3001 is free
2. Check browser console (F12) for errors
3. Restart: \`npx sequential-ecosystem gui\`

### Components not showing?
1. They auto-bootstrap on server startup
2. Check \`.sequential/.state/component/\` folder
3. Refresh the browser

### Need to reset everything?
\`\`\`bash
rm -rf tasks/*/runs .sequential/.state
npx sequential-ecosystem gui
\`\`\`

---

## Command Reference

| Command | What It Does |
|---------|-------------|
| \`npx sequential-ecosystem gui\` | Launch visual desktop (recommended) |
| \`npx sequential-ecosystem server\` | Start API server only (port 3000) |
| \`npx sequential-ecosystem create-task <name>\` | New task from template |
| \`npx sequential-ecosystem run <task> --input '{}'\` | Run from terminal |
| \`npx sequential-ecosystem list\` | Show all tasks |
| \`npx sequential-ecosystem history <task>\` | View past runs |

---

## What Makes Sequential Special?

1. **No timeouts** - HTTP calls pause execution, resume when response arrives
2. **Composable tasks** - Tasks can call other tasks (\`__callHostTool__('task', ...)\`)
3. **Reusable tools** - Tasks can call tools (\`__callHostTool__('tool', ...)\`)
4. **Auto-saved** - Complete state persisted, survives server restarts
5. **Visual debugging** - See every pause, every state change, every error
6. **No build step** - Edit and run immediately
7. **Full JavaScript** - Write normal code, framework handles pausing/resuming
8. **Component system** - Drag-drop UI, stored in database, live-synced
9. **Multi-backend** - Folder, SQLite, PostgreSQL/Supabase support

---

## Real-World Examples (in GUI)

### Build a data pipeline
1. Open **example-batch-processing**
2. Modify to call your API
3. Run with 10,000 items
4. Watch progress in debugger
5. It automatically checkpoints every 100 items

### Build a payment system
1. Open **example-payment-flow**
2. Shows order validation → charge card → send confirmation
3. Error paths included (refund if send fails)
4. Copy and customize for your business logic

### Build a dashboard
1. Click **Component Builder**
2. Drag Card, Button, Badge components
3. Arrange in grid
4. Add task that fetches metrics
5. See metrics update in real-time

---

## Join the Community

- **Issues & Bugs**: [GitHub Issues](https://github.com/anthropics/sequential-ecosystem)
- **Discussions**: GitHub Discussions
- **Docs**: Full API reference in README.md

---

## You're Ready! 🎉

That's it. You have:
- ✅ 11 example tasks (5 basic + 5 integration patterns + 1 sequential-os)
- ✅ 3 example flows demonstrating orchestration
- ✅ 3 example tools for database, API, and filesystem operations
- ✅ 3 functional example apps (Dashboard, Flow Visualizer, Task Explorer)
- ✅ 7 pre-built components in the visual builder
- ✅ Visual editor for tasks, flows, and components
- ✅ Debugger for real-time execution monitoring
- ✅ Component builder for drag-drop UI creation

**Next step**: \`npx sequential-ecosystem gui\`

Open http://localhost:3001 and start exploring!

---

*Sequential Ecosystem v1.7.2+ - Infinite-length task execution with auto suspend/resume*
`;
}
