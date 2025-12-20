# Sequential Ecosystem - Monorepo Migration & GXE Integration

## Executive Summary

The Sequential Ecosystem has been successfully migrated from a **git submodule-based, npm-published architecture** to a **unified monorepo distributed via GXE**.

**Key Changes:**
- ✅ Removed 50+ git submodules
- ✅ All packages inlined into monorepo (`packages/@sequentialos/*`)
- ✅ Removed npm publishing infrastructure
- ✅ Implemented GXE-based centralized dispatch system
- ✅ Added webhook-style integration for external systems
- ✅ Fresh git history with clean commits

**Result:** Single, unified repository with centralized entry points via GXE.

---

## Architecture Overview

### Before Migration

```
sequential-ecosystem (main repo)
├── .gitmodules (50+ submodules)
└── Publishes to npm:
    - @sequentialos/sequential-runner
    - @sequentialos/sequential-flow
    - @sequentialos/desktop-server
    - ... (40+ packages)
```

**Problems:**
- Complex submodule management
- Distributed across multiple GitHub repos
- Version synchronization overhead
- Publishing/authentication complexity

### After Migration

```
sequential-ecosystem (monorepo)
├── packages/@sequentialos/ (40+ packages)
├── scripts/gxe-dispatch/ (dispatcher scripts)
├── cli.js, package.json, etc.
└── No npm publishing

Distributed via GXE:
- gxe . desktop-server
- gxe . webhook:task
- gxe . webhook:flow
- gxe . webhook:tool
```

**Benefits:**
- Single git repository
- No submodule complexity
- No npm publishing needed
- GXE caching for fast execution
- Webhook-style API for external systems

---

## GXE Dispatcher System

### Architecture

```
┌─────────────────┐
│ gxe (CLI tool)  │
└────────┬────────┘
         │
         │ gxe . <command> [args...]
         ▼
┌──────────────────────────┐
│ scripts/gxe-dispatch.js  │ (main router)
└────────┬─────────────────┘
         │
         ├─── desktop-server ──→ scripts/gxe-dispatch/desktop-server.js
         │
         ├─── webhook:task ────→ scripts/gxe-dispatch/webhook-task.js
         │
         ├─── webhook:flow ────→ scripts/gxe-dispatch/webhook-flow.js
         │
         └─── webhook:tool ────→ scripts/gxe-dispatch/webhook-tool.js
```

### Available Commands

| Command | Purpose | Example |
|---------|---------|---------|
| `desktop-server` | Start API server | `gxe . desktop-server --port=8003` |
| `webhook:task` | Execute task | `gxe . webhook:task --taskName=foo` |
| `webhook:flow` | Execute flow | `gxe . webhook:flow --flowName=bar` |
| `webhook:tool` | Execute tool | `gxe . webhook:tool --appId=app-x --toolName=fn` |

---

## Monorepo Structure

```
sequential-ecosystem/
├── packages/
│   └── @sequentialos/
│       ├── sequential-runner/          (core executor)
│       ├── sequential-flow/             (state machine orchestrator)
│       ├── sequential-fetch/            (fetch VM)
│       ├── sequential-adaptor/          (storage abstraction)
│       ├── desktop-server/              (API + WebSocket server)
│       ├── task-execution-service/      (task orchestration)
│       ├── server-utilities/            (server infrastructure)
│       ├── error-handling/              (error utilities)
│       ├── response-formatting/         (API response helpers)
│       ├── dependency-injection/        (DI container)
│       ├── core/                        (core utilities)
│       └── ... (40+ total packages)
│
├── scripts/
│   ├── gxe-dispatch.js                 (main router)
│   └── gxe-dispatch/
│       ├── desktop-server.js
│       ├── webhook-task.js
│       ├── webhook-flow.js
│       └── webhook-tool.js
│
├── flows/                              (flow definitions)
├── tools/                              (tool definitions)
├── cli.js                              (CLI entry)
├── package.json                        (root config)
├── GXE_DISPATCH.md                     (GXE guide)
└── MONOREPO_MIGRATION.md              (this file)
```

### Key Points

- **No external npm dependencies** on `@sequentialos/*` packages
- All packages available immediately in monorepo
- Single version source (root `package.json`)
- Shared workspaces configuration

---

## Usage

### Via GXE (Recommended)

```bash
# Install gxe globally (one-time)
npm install -g gxe

# Start server
gxe AnEntrypoint/sequential-ecosystem desktop-server
gxe . desktop-server  # From repo directory

# Trigger task
gxe . webhook:task --taskName=myTask --input='{"key":"value"}'

# Trigger flow
gxe . webhook:flow --flowName=myFlow --input='{"key":"value"}'

# Trigger tool
gxe . webhook:tool --appId=app-myapp --toolName=myTool --params='{"x":1}'
```

### Via npm scripts

```bash
npm run server              # Start desktop server
npm run gxe:task           # Trigger task
npm run gxe:flow           # Trigger flow
npm run gxe:tool           # Trigger tool
```

### Via environment variables

```bash
TASK_NAME=myTask TASK_INPUT='{"data":"value"}' \
  node scripts/gxe-dispatch.js webhook:task

PORT=8003 node scripts/gxe-dispatch.js desktop-server
```

---

## Integration Examples

### Webhook from CI/CD Pipeline

```yaml
# GitHub Actions
- name: Trigger Sequential Task
  run: |
    npx gxe AnEntrypoint/sequential-ecosystem webhook:task \
      --taskName=deploy-service \
      --input='{"version":"${{ github.ref }}"}'
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
        command:
          - npx
          - gxe
          - AnEntrypoint/sequential-ecosystem
          - webhook:task
        env:
          - name: TASK_NAME
            value: "process-data"
          - name: TASK_INPUT
            value: '{"file":"input.csv"}'
```

### Docker Container

```dockerfile
FROM node:18-alpine

RUN npm install -g gxe

EXPOSE 8003

ENTRYPOINT ["gxe", "AnEntrypoint/sequential-ecosystem", "desktop-server"]
```

### Direct HTTP Request (via desktop server)

```bash
# Start the server
gxe . desktop-server &

# Make HTTP request (existing API unchanged)
curl http://localhost:8003/api/tasks/myTask/run \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"data":"value"}'
```

---

## Migration Path for Users

### Previous npm-based usage:

```bash
# Install package
npm install -g sequential-ecosystem

# Run task
npx sequential-ecosystem run myTask

# Install specific package
npm install @sequentialos/sequential-runner
const { TaskRunner } = require('@sequentialos/sequential-runner');
```

### New GXE-based usage:

```bash
# Install gxe
npm install -g gxe

# Run task via webhook dispatcher
gxe AnEntrypoint/sequential-ecosystem webhook:task --taskName=myTask

# Or clone repo for local development
git clone https://github.com/AnEntrypoint/sequential-ecosystem.git
cd sequential-ecosystem
npm run server
npm run gxe:task -- --taskName=myTask
```

---

## Git Changes

### New commits:

```
0d13986 fix: Convert all GXE dispatcher scripts to ES modules
1aa7614 fix: Convert GXE dispatcher scripts to ES modules
0acf577 docs: Add NPM publishing removal summary
c6e827b feat: Implement GXE-based centralized dispatch system
8de6910 feat: Inline all package content into monorepo
b4cef9a chore: Clean monorepo structure with inlined packages
d3c86cd chore: Convert from git submodules to unified monorepo
```

### Files changed:

- **Created:** `scripts/gxe-dispatch.js`, `scripts/gxe-dispatch/*.js`, `GXE_DISPATCH.md`, `NPM_PUBLISHING_REMOVAL.md`
- **Modified:** `package.json` (updated scripts and bin entries)
- **Removed:** `.gitmodules` (submodule configuration)
- **Inlined:** 50+ packages from git submodules

---

## GXE Caching

GXE automatically caches repositories in `~/.gxe/` for fast execution:

```bash
# First run: clones from GitHub (slower, ~5 seconds)
gxe AnEntrypoint/sequential-ecosystem desktop-server

# Subsequent runs: uses cache with git pull (faster, <1 second)
gxe AnEntrypoint/sequential-ecosystem desktop-server

# Clear cache if needed
rm -rf ~/.gxe/<hash-for-sequential-ecosystem>
```

---

## Benefits of This Architecture

| Aspect | Before | After |
|--------|--------|-------|
| **Repository Structure** | 50+ submodules spread across GitHub | Single unified monorepo |
| **Publishing** | npm @sequentialos scope | GXE distribution (no npm) |
| **Distribution** | npm install + version management | git clone + GXE caching |
| **Integration** | npm API or direct imports | Webhook-style dispatcher |
| **External Systems** | Difficult (npm dependency hell) | Easy (one gxe command) |
| **Version Control** | Multiple version numbers | Single source of truth |
| **CI/CD Integration** | Complex (many repos) | Simple (one repo) |
| **Cold Start** | npm install (~10+ seconds) | GXE cache (<1 second) |

---

## Future Enhancements

- [ ] GXE environment variable passing improvements
- [ ] Task/flow/tool discovery endpoint (`/gxe/available-commands`)
- [ ] Output capture modes (JSON, streaming, progress)
- [ ] WebSocket support for real-time task updates via GXE
- [ ] Multi-instance load balancing
- [ ] Helm charts for Kubernetes deployment

---

## Troubleshooting

### GXE not found

```bash
# Install globally
npm install -g gxe --latest

# Verify installation
gxe --version
```

### Task execution fails

```bash
# Check environment
node scripts/gxe-dispatch.js webhook:task --help

# Verify TaskService import path
ls packages/@sequentialos/task-execution-service/src/
```

### Port already in use

```bash
# Use custom port
PORT=8004 node scripts/gxe-dispatch.js desktop-server

# Or kill existing process
lsof -i :8003 | grep node | awk '{print $2}' | xargs kill -9
```

---

## References

- [GXE Repository](https://github.com/AnEntrypoint/gxe)
- [GXE_DISPATCH.md](./GXE_DISPATCH.md) - Detailed GXE usage guide
- [NPM_PUBLISHING_REMOVAL.md](./NPM_PUBLISHING_REMOVAL.md) - Migration notes
- [CLAUDE.md](./CLAUDE.md) - Architecture and constraints
- [README.md](./README.md) - Project overview

---

## Questions?

For issues or questions about this migration:
1. Check [GXE_DISPATCH.md](./GXE_DISPATCH.md) for GXE-specific questions
2. Check [NPM_PUBLISHING_REMOVAL.md](./NPM_PUBLISHING_REMOVAL.md) for migration questions
3. Review [CLAUDE.md](./CLAUDE.md) for architecture questions
4. Open an issue on GitHub: https://github.com/AnEntrypoint/sequential-ecosystem/issues
