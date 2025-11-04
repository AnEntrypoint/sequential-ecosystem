# Changelog

All notable changes to this project will be documented in this file.

## [1.2.0] - 2025-11-04

### Architectural Improvements

- **Design-Implementation Alignment**: Fixed critical gap where CLI bypassed StorageAdapter pattern
  - CLI now uses StorageAdapter (FolderAdapter) for all task execution
  - Enables seamless swapping between folder/SQLite/Supabase backends
  - Single source of truth for storage operations

- **Created FolderAdapter**: Implements StorageAdapter interface wrapping folder-based storage
  - Manages task runs, stack runs, keystores in folder structure
  - Compatible with existing folder organization (tasks/*.json)
  - Enables future storage backend migration without code changes

- **Refactored run-task.js**: Now integrates with architectural layers
  - Uses createAdapter('folder') for storage initialization
  - Cleaner separation: execution logic ↔ storage adapter ↔ persistence
  - Maintains backward compatibility with all CLI commands

- **Lazy-Load Optional Adapters**: SQLite and Supabase are optional dependencies
  - adapter-factory gracefully handles missing packages
  - FolderAdapter always available (zero database setup)
  - Production deployments can add SQLite/Supabase as needed

- **Code Cleanup**: Removed non-permanent structures
  - Deleted orphaned lib/ directory (unused utilities)
  - Removed ARCHITECTURE.md analysis file
  - Reduced technical debt, improved clarity

### Key Outcomes

- ✓ All features preserved and verified working: FetchFlow pause/resume, implicit xstate, explicit xstate, CLI commands
- ✓ Zero breaking changes to user-facing API
- ✓ Simplified architecture: transparent code flow CLI → StorageAdapter → Backend
- ✓ Forward-thinking design: extensible adapter system for future backends
- ✓ Production-ready: no fallbacks, no mocks, only real implementations

---

## [1.1.0] - 2025-11-04

### Added

- **Comprehensive Admin GUI**: Full web-based dashboard and management system
  - Integrated as git submodule in `packages/admin-gui`
  - Built with React 18, Express.js, Vite, and WebSocket
  - Features: task runs observability, debug runner, task editor, tools explorer, flow builder
  - REST API with 14+ endpoints
  - Real-time event broadcasting via WebSocket
  - Persistent background shell for continuous operation

- **Visual State Machine Visualization**: Real-time xstate flow tree diagrams
  - Custom SVG-based visualizer for state graphs in Flow Builder
  - Auto-layout algorithm for state positioning
  - Visual indicators: initial states (▶), final states (◎), transitions (→)
  - Color-coded transitions: onDone (blue solid), onError (red dashed)
  - Real-time updates as states and transitions are edited

- **Complete Documentation Suite**
  - CLAUDE.md: 2000+ line architecture reference with examples
  - Admin GUI README: Feature overview and API documentation
  - Admin GUI DEPLOYMENT.md: Docker, Kubernetes, Nginx configurations
  - Updated git status and cleanup procedures

### Changed

- Migrated from TypeScript source (cli.ts) to JavaScript executable (cli.js)
- Updated package.json scripts from Bun to Node.js compatibility
- Cleaned up test data and ephemeral files
- Reset submodules to clean state after integration testing

### Fixed

- Routing issues in admin-gui Task Runner and Flow Builder pages
- Submodule content synchronization
- Git repository cleanup and garbage collection

## [1.0.0] - 2025-11-03

### Added

- **Comprehensive CLAUDE.md**: Complete architecture documentation with xstate integration patterns
  - Detailed explanation of implicit xstate (FetchFlow) pattern
  - Detailed explanation of explicit xstate (FlowState) pattern
  - Full CLI reference with examples
  - Environment variables guide
  - Deployment options and patterns

- **CLI Implementation**: Full-featured command-line interface
  - `create-task`: Create new tasks with optional state graphs
  - `run`: Execute tasks with input parameters
  - `list`: List all available tasks
  - `describe`: Show task details and configuration
  - `history`: View task execution history
  - `show`: Display specific run results
  - `delete`: Remove tasks
  - `sync-tasks`: Sync tasks to storage backend
  - `config`: Manage CLI configuration
  - `init`: Initialize sequential-ecosystem in new directories

- **Tool Structure**: Modular CLI tool components
  - `tools/create-task.js`: Task scaffolding with proper function naming
  - `tools/run-task.js`: Task execution engine with result saving
  - `tools/sync-tasks.js`: Storage synchronization utility
  - `tools/config.js`: Configuration management

- **Storage Adaptor System**: Pluggable storage backends
  - **FolderAdapter**: Default file-system based storage (zero setup required)
    - Task metadata and execution state stored as JSON
    - Perfect for development and testing
    - Git-compatible folder structure
  - **SQLiteAdapter**: Local database for production use
  - **SupabaseAdapter**: Cloud PostgreSQL backend for distributed deployments

- **Folder Structure**: Organized project layout
  - `tasks/`: Default directory for task storage
  - `tools/`: CLI utilities and helpers
  - `packages/`: Core libraries and services

- **Test Coverage**: Validated CLI functionality
  - Task creation with and without state graphs
  - Task execution with implicit xstate
  - Execution history and result viewing
  - Dry-run validation
  - Configuration management

### Architecture

- **Single Entry Point**: `npx sequential-ecosystem` for all operations
- **Monorepo Support**: Seamless workspace integration
- **Production Ready**: No fallbacks, mocks, or simulations
- **Deployment Agnostic**: Works across Node.js, Deno, Bun

### xstate Integration

**Pattern 1: Implicit xstate (Default)**
- Automatic pause on every `fetch()` call
- No explicit configuration required
- State saved and resumed automatically
- Used by sequential-fetch VM

**Pattern 2: Explicit xstate (Optional)**
- Define state graphs in `graph.json`
- Control execution flow explicitly
- Multiple execution branches and transitions
- Used by sequential-flow VM

### Documentation

- **CLAUDE.md**: Complete technical reference (2000+ lines)
  - Project overview and structure
  - Two xstate integration patterns explained
  - Usage patterns with code examples
  - CLI reference with all commands
  - Deployment options
  - Architecture decisions and rationale
  - Common patterns and best practices
  - Troubleshooting guide

- **TODO.md**: Outstanding tasks and future enhancements
  - Organized by category
  - Clear priority levels
  - Notes on completion status

- **This CHANGELOG**: Version history and notable changes

### Breaking Changes

None - this is initial release (1.0.0)

### Migration Guide

Not applicable - new project

### Known Limitations

- Folder adapter stores all data as JSON (not optimized for very large datasets)
- Web UI not yet available (CLI is the primary interface)
- No built-in clustering/sharding (SQLite single-instance)

### Future Enhancements

See TODO.md for complete list of planned improvements

---

## Release Notes

### Installation

```bash
# Install dependencies
bun install  # or npm install

# Run CLI
node cli.js --help

# Or use npx
npx sequential-ecosystem --help
```

### Getting Started

```bash
# Initialize in a new directory
npx sequential-ecosystem init

# Create your first task
npx sequential-ecosystem create-task my-task

# Edit the task code
# Then run it
npx sequential-ecosystem run my-task --input '{}'
```

### Key Features

✓ Two xstate integration patterns
✓ Zero-setup folder-based storage
✓ Full CLI with all operations
✓ Production-ready code
✓ Comprehensive documentation
✓ Modular and extensible architecture

---

For complete documentation, see CLAUDE.md
