# Sequential Ecosystem - Packages Index

Complete reference guide to all 45 packages in the Sequential Ecosystem.

## Navigation

- [Desktop Applications](#desktop-applications) (10)
- [Core & Infrastructure](#core--infrastructure) (8)
- [Data Access & Storage](#data-access--storage) (6)
- [Sequential Core](#sequential-core) (8)
- [Services & Utilities](#services--utilities) (5)

---

## Desktop Applications

Full-featured interactive applications for Sequential Desktop.

### 📟 Terminal & Shell

| Package | Description |
|---------|-------------|
| [app-terminal](packages/app-terminal) | Sequential-OS CLI with multi-tab sessions, layer management, and branch control |

### 💻 Code & Content

| Package | Description |
|---------|-------------|
| [app-code-editor](packages/app-code-editor) | Multi-tab code editor with syntax highlighting and file tree navigation |
| [app-file-browser](packages/app-file-browser) | File system browser with directory tree and real-time collaboration |

### 🔍 Debugging & Analysis

| Package | Description |
|---------|-------------|
| [app-debugger](packages/app-debugger) | Filesystem layer inspector with history tracking and content comparison |
| [app-task-debugger](packages/app-task-debugger) | Task execution debugger with run history and test environment |
| [app-flow-debugger](packages/app-flow-debugger) | State machine debugger with step-through control and visualization |

### 📊 Monitoring & Metrics

| Package | Description |
|---------|-------------|
| [app-run-observer](packages/app-run-observer) | Real-time execution monitoring dashboard with metrics and timeline views |

### ✏️ Editors & Configuration

| Package | Description |
|---------|-------------|
| [app-task-editor](packages/app-task-editor) | Task development with multiple runner support (Sequential-JS, FlowState, Sequential-OS) |
| [app-flow-editor](packages/app-flow-editor) | Visual xstate workflow builder with drag-drop and export/import |
| [app-tool-editor](packages/app-tool-editor) | Tool development environment with parameter definition and schema generation |
| [chat-component](packages/chat-component) | Reusable agentic chat interface with message history and LLM integration |

---

## Core & Infrastructure

Core platform components and desktop infrastructure.

### Desktop Environment

| Package | Description |
|---------|-------------|
| [desktop-shell](packages/desktop-shell) | Window manager and desktop UI with dynamic app loading |
| [desktop-server](packages/desktop-server) | Express server with app registry, plugin system, and API endpoints |
| [desktop-api-client](packages/desktop-api-client) | HTTP client for Sequential-OS operations |

### Theming & Components

| Package | Description |
|---------|-------------|
| [desktop-theme](packages/desktop-theme) | Design tokens and CSS variables for consistent styling |
| [desktop-ui-components](packages/desktop-ui-components) | Reusable UI components for Sequential Desktop apps |

### Dependency & Error Management

| Package | Description |
|---------|-------------|
| [dependency-injection](packages/dependency-injection) | DI container with singleton pattern and circular dependency detection |
| [error-handling](packages/error-handling) | Centralized error handling with AppError class and logging |
| [core](packages/core) | Core utilities and helpers for the ecosystem |

---

## Data Access & Storage

Repository pattern implementations and storage utilities.

### Repositories

| Package | Description |
|---------|-------------|
| [data-access-layer](packages/data-access-layer) | Repository pattern for task, flow, tool, and file operations |

### Storage & Utilities

| Package | Description |
|---------|-------------|
| [sequential-storage-utils](packages/sequential-storage-utils) | Serialization, validation, and CRUD patterns for task adapters |
| [file-operations](packages/file-operations) | Safe file operations with atomic writes and path validation |
| [server-utilities](packages/server-utilities) | Cache management, task executor, logging, and config helpers |
| [osjs-webdesktop](packages/osjs-webdesktop) | Legacy desktop environment (separate from modular desktop) |

---

## Sequential Core

Core execution engines and runtime infrastructure.

### Execution Engines

| Package | Description |
|---------|-------------|
| [sequential-fetch](packages/sequential-fetch) | Implicit xstate VM with auto-pause on fetch() calls |
| [sequential-flow](packages/sequential-flow) | Explicit xstate VM for state graph execution |
| [sequential-runner](packages/sequential-runner) | Task runner engine with __callHostTool__() support |
| [sequential-machine](packages/sequential-machine) | State machine utilities and helpers |

### Storage Adapters

| Package | Description |
|---------|-------------|
| [sequential-adaptor](packages/sequential-adaptor) | Storage adapter interface and plugin registry |
| [sequential-adaptor-sqlite](packages/sequential-adaptor-sqlite) | SQLite storage implementation |
| [sequential-adaptor-supabase](packages/sequential-adaptor-supabase) | PostgreSQL/Supabase storage implementation |

### Utilities

| Package | Description |
|---------|-------------|
| [sequential-wrapped-services](packages/sequential-wrapped-services) | Pre-wrapped service APIs for common integrations |

---

## Services & Utilities

Business logic services and helper utilities.

### Services

| Package | Description |
|---------|-------------|
| [task-execution-service](packages/task-execution-service) | Task execution with validation, orchestration, and state |

### Middleware

| Package | Description |
|---------|-------------|
| [param-validation](packages/param-validation) | Parameter validation middleware with validation chains |
| [input-sanitization](packages/input-sanitization) | XSS and injection protection utilities |
| [response-formatting](packages/response-formatting) | HTTP response formatting with standardized envelopes |

### HTTP & WebSocket

| Package | Description |
|---------|-------------|
| [sequential-http-utils](packages/sequential-http-utils) | HTTP utilities with retry logic and response parsing |
| [websocket-broadcaster](packages/websocket-broadcaster) | WebSocket message broadcasting and subscriptions |
| [websocket-factory](packages/websocket-factory) | WebSocket connection factory pattern |

### Validators

| Package | Description |
|---------|-------------|
| [sequential-utils](packages/sequential-utils) | Common utilities (timestamps, errors, type checking) |
| [sequential-validators](packages/sequential-validators) | Field validators for Sequential tasks |

### Collaboration

| Package | Description |
|---------|-------------|
| [zellous](packages/zellous) | WebRTC collaboration framework |
| [zellous-client-sdk](packages/zellous-client-sdk) | WebRTC client SDK for real-time features |

### Wrappers

| Package | Description |
|---------|-------------|
| [sequential-wrapper](packages/sequential-wrapper) | Wrapper utilities for extending functionality |

---

## Package Dependencies

### Commonly Used Together

**Desktop Development**
- desktop-shell → desktop-server, desktop-ui-components, desktop-theme
- app-* → desktop-ui-components, desktop-api-client
- chat-component → zellous-client-sdk, desktop-ui-components

**Data Operations**
- data-access-layer → sequential-storage-utils, file-operations
- sequential-runner → sequential-adaptor, sequential-flow, sequential-fetch

**Server Development**
- desktop-server → data-access-layer, task-execution-service, error-handling
- task-execution-service → error-handling, sequential-validators

**Utilities**
- error-handling, sequential-utils, sequential-validators (widely used)

---

## Quick Access by Use Case

### I want to build a desktop app
1. Check [desktop-shell](packages/desktop-shell)
2. Review [desktop-ui-components](packages/desktop-ui-components)
3. Study [app-code-editor](packages/app-code-editor) or similar
4. Use [chat-component](packages/chat-component) for chat features

### I want to work with tasks
1. Review [task-execution-service](packages/task-execution-service)
2. Check [data-access-layer](packages/data-access-layer)
3. Use [sequential-validators](packages/sequential-validators) for validation
4. Reference [app-task-editor](packages/app-task-editor) for UI examples

### I want to work with state machines
1. Review [sequential-flow](packages/sequential-flow) (explicit) or [sequential-fetch](packages/sequential-fetch) (implicit)
2. Check [sequential-machine](packages/sequential-machine) for utilities
3. Use [app-flow-editor](packages/app-flow-editor) for visual editing

### I want to work with storage
1. Start with [sequential-adaptor](packages/sequential-adaptor)
2. Choose implementation: [sequential-adaptor-sqlite](packages/sequential-adaptor-sqlite) or [sequential-adaptor-supabase](packages/sequential-adaptor-supabase)
3. Use [sequential-storage-utils](packages/sequential-storage-utils) for patterns
4. Reference [data-access-layer](packages/data-access-layer) for repository pattern

### I want to work with HTTP/WebSocket
1. Review [sequential-http-utils](packages/sequential-http-utils)
2. Check [websocket-broadcaster](packages/websocket-broadcaster) and [websocket-factory](packages/websocket-factory)
3. For collaboration: [zellous](packages/zellous), [zellous-client-sdk](packages/zellous-client-sdk)

### I want to add error handling
1. Use [error-handling](packages/error-handling)
2. For input: [param-validation](packages/param-validation), [input-sanitization](packages/input-sanitization)
3. For output: [response-formatting](packages/response-formatting)

---

## Package Statistics

- **Total Packages**: 45
- **With README**: 45 (100%)
- **Desktop Apps**: 10
- **Libraries**: 35
- **Total Dependencies**: ~150 npm packages

### Supported Node Versions
- Minimum: Node.js 18.0.0
- Tested: Node.js 18.x, 20.x

### Package Types
- ES Modules (default)
- CommonJS compatible through build
- TypeScript definitions (some packages)

---

## Documentation Files

### Getting Started
- **[CLAUDE.md](CLAUDE.md)** - Project architecture and guidelines
- **[TEMPLATE_README.md](TEMPLATE_README.md)** - Template guide for new packages
- **[README_GENERATION_REPORT.md](README_GENERATION_REPORT.md)** - Detailed generation report

### Per-Package
- **README.md** - Each package has comprehensive documentation
- **package.json** - Metadata and dependencies
- **src/** - Source code with inline documentation

---

## Contributing

When creating new packages:

1. Choose appropriate template from [TEMPLATE_README.md](TEMPLATE_README.md)
2. Create `README.md` following the template
3. Update this index with new package entry
4. Ensure consistent naming: `@sequential/package-name`
5. Add proper exports in `package.json`

---

## Support

For questions about specific packages:
1. Check the package's README.md
2. Review source code in `packages/package-name/src`
3. Check [CLAUDE.md](CLAUDE.md) for architecture notes
4. Review similar packages for patterns

---

**Last Updated**: December 1, 2025
**Total Documentation**: 45 README files + guides
**Status**: Complete and ready for use
