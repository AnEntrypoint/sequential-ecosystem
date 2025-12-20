# Sequential Ecosystem - GXE Dispatch System

This document describes the GXE-based centralized dispatch system for Sequential Ecosystem.

## Overview

Sequential Ecosystem uses **GXE (Git Execution)** as a centralized entry point for all callable components:
- Desktop Server (API + WebSocket broker)
- Task Execution (webhook-style triggers)
- Flow Execution (state machine orchestration)
- Tool Execution (app-based tools)

**No NPM publishing required** - GXE clones/caches this repository and dispatches to the appropriate handler scripts.

## Installation & Usage

### Via GXE (Recommended)

GXE enables execution directly from the Git repository with caching:

```bash
# Install gxe globally
npm install -g gxe

# Start the desktop server
gxe AnEntrypoint/sequential-ecosystem desktop-server
gxe . desktop-server  # Local development

# Trigger tasks via webhook
gxe . webhook:task --taskName=myTask --input='{"key":"value"}'

# Trigger flows
gxe . webhook:flow --flowName=myFlow --input='{"key":"value"}'

# Trigger tools
gxe . webhook:tool --appId=app-myapp --toolName=myTool --params='{"param":"value"}'
```

### Via NPM Scripts

Alternatively, use npm scripts:

```bash
npm run server              # Start desktop server
npm run gxe:task          # Trigger task
npm run gxe:flow          # Trigger flow
npm run gxe:tool          # Trigger tool
```

### Environment Variables

All dispatchers support environment variable configuration:

**Desktop Server:**
```bash
PORT=8003 HOST=localhost node scripts/gxe-dispatch.js desktop-server
```

**Task Execution:**
```bash
TASK_NAME=myTask TASK_INPUT='{"data":"value"}' TASK_ID=run-123 \
  node scripts/gxe-dispatch.js webhook:task
```

**Flow Execution:**
```bash
FLOW_NAME=myFlow FLOW_INPUT='{"data":"value"}' FLOW_ID=flow-123 \
  node scripts/gxe-dispatch.js webhook:flow
```

**Tool Execution:**
```bash
APP_ID=app-myapp TOOL_NAME=myTool TOOL_PARAMS='{"param":"value"}' \
  node scripts/gxe-dispatch.js webhook:tool
```

## Architecture

### Dispatcher Scripts

Located in `scripts/gxe-dispatch/`:

| Script | Purpose | Invoked By |
|--------|---------|-----------|
| `desktop-server.js` | Starts Express API server on port 8003 | `gxe . desktop-server` |
| `webhook-task.js` | Executes tasks via TaskService | `gxe . webhook:task` |
| `webhook-flow.js` | Executes flows via FlowService | `gxe . webhook:flow` |
| `webhook-tool.js` | Executes tools via ToolRegistry | `gxe . webhook:tool` |

### Main Router

`scripts/gxe-dispatch.js` - Routes GXE commands to appropriate dispatcher:

```bash
gxe . <command> [args...]
```

Supported commands:
- `desktop-server` - Start server
- `webhook:task` - Execute task
- `webhook:flow` - Execute flow
- `webhook:tool` - Execute tool
- `cli` - Interactive CLI (future)

## Webhook Integration

Each webhook dispatcher returns JSON-structured responses:

### Task Webhook

**Request:**
```bash
gxe . webhook:task --taskName=myTask --input='{"step":"1"}'
```

**Response:**
```json
{
  "success": true,
  "runId": "run-abc123",
  "taskName": "myTask",
  "output": { "result": "success" },
  "duration": 1234
}
```

### Flow Webhook

**Request:**
```bash
gxe . webhook:flow --flowName=myFlow --input='{"start":"nodeId"}'
```

**Response:**
```json
{
  "success": true,
  "flowId": "flow-xyz789",
  "flowName": "myFlow",
  "finalState": "complete",
  "output": { "result": "done" },
  "duration": 2456
}
```

### Tool Webhook

**Request:**
```bash
gxe . webhook:tool --appId=app-myapp --toolName=myTool --params='{"a":1}'
```

**Response:**
```json
{
  "success": true,
  "appId": "app-myapp",
  "toolName": "myTool",
  "result": { "output": "data" },
  "duration": 345
}
```

## Integration Examples

### Backend Process Triggers

Use from CI/CD, webhooks, or external systems:

```bash
#!/bin/bash
# Trigger a task from an external system
curl https://myapp.com/execute-workflow \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "command": "gxe AnEntrypoint/sequential-ecosystem webhook:task",
    "args": ["--taskName=process-data", "--input={\"file\":\"data.csv\"}"]
  }'
```

### Docker / Container Execution

```dockerfile
FROM node:18-alpine

RUN npm install -g gxe

WORKDIR /app
ENTRYPOINT ["gxe", "AnEntrypoint/sequential-ecosystem", "desktop-server"]
```

### Kubernetes Job

```yaml
apiVersion: batch/v1
kind: Job
metadata:
  name: sequential-task
spec:
  template:
    spec:
      containers:
      - name: task-executor
        image: node:18-alpine
        command: ["npx", "gxe", "AnEntrypoint/sequential-ecosystem", "webhook:task"]
        env:
        - name: TASK_NAME
          value: "my-task"
        - name: TASK_INPUT
          value: '{"data":"value"}'
```

### GitHub Actions

```yaml
- name: Trigger Sequential Task
  run: |
    npx gxe AnEntrypoint/sequential-ecosystem webhook:task \
      --taskName=deploy-service \
      --input='{"version":"1.0.0","env":"prod"}'
```

## GXE Caching

GXE caches repositories in `~/.gxe/` for fast repeated execution:

```bash
# First run: clones from GitHub
gxe AnEntrypoint/sequential-ecosystem desktop-server  # ~5 seconds

# Subsequent runs: uses cache (git pull to update)
gxe AnEntrypoint/sequential-ecosystem desktop-server  # <1 second

# Force refresh
rm -rf ~/.gxe/<cached-repo> && gxe ...
```

## Local Development

For development with GXE against a local repository:

```bash
# Use local path instead of GitHub repo
gxe ~/projects/sequential-ecosystem desktop-server
gxe . desktop-server  # From within the repo directory
```

## Monorepo Structure

All packages are now inline in the monorepo:

```
sequential-ecosystem/
├── packages/
│   └── @sequentialos/
│       ├── sequential-runner/
│       ├── sequential-flow/
│       ├── sequential-fetch/
│       ├── desktop-server/
│       ├── task-execution-service/
│       ├── error-handling/
│       └── ... (40+ packages)
├── scripts/
│   ├── gxe-dispatch.js           # Main router
│   └── gxe-dispatch/
│       ├── desktop-server.js
│       ├── webhook-task.js
│       ├── webhook-flow.js
│       └── webhook-tool.js
├── cli.js
└── package.json
```

**No external npm dependencies** on `@sequentialos/*` packages - all are bundled in-tree.

## Comparison: Old vs New

### Before (Git Submodules + NPM)

```
npm install -g sequential-ecosystem
sequential-ecosystem run myTask --input '{}'

# Or via published packages
npm install @sequentialos/task-execution-service
const { TaskService } = require('@sequentialos/task-execution-service');
```

**Issues:**
- 50+ git submodules to manage
- Published to npm (@sequentialos scope)
- Complex version synchronization
- Distributed across multiple repos

### After (GXE + Monorepo)

```
# Via GXE
gxe . webhook:task --taskName=myTask --input '{}'

# Via local npm
npm run gxe:task -- --taskName=myTask --input '{}'
```

**Benefits:**
- No submodules - monorepo structure
- No npm publishing - GXE dispatch
- Single version source
- Centralized entry points
- Webhook-style integration
- External system compatibility

## Future Enhancements

- [ ] GXE support for environment variable passing (planned for gxe)
- [ ] Task/flow/tool discovery via `/gxe/available-commands`
- [ ] Output capture modes (JSON, text, streaming)
- [ ] Progress/status streaming for long-running tasks
- [ ] WebSocket support for real-time updates via GXE
- [ ] Multi-instance load balancing

## Troubleshooting

### GXE Can't Find Repository

```bash
# Ensure GXE is installed
npm install -g gxe --latest

# Test basic functionality
gxe AnEntrypoint/gxe  # Should show gxe help
```

### Task Execution Fails

Check environment variables and input JSON:

```bash
# Verbose execution
DEBUG=1 gxe . webhook:task --taskName=test --input='{"test":"value"}'

# Check TaskService logs
tail -f ~/.sequential/logs/tasks.log
```

### Port Already in Use

```bash
# Use custom port
PORT=8004 gxe . desktop-server

# Or kill existing process
lsof -i :8003 | grep node | awk '{print $2}' | xargs kill -9
```

## See Also

- [GXE Repository](https://github.com/AnEntrypoint/gxe)
- [Sequential Ecosystem README](./README.md)
- [CLAUDE.md](./CLAUDE.md) - Architecture and constraints
