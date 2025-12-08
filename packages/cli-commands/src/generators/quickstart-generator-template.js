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
