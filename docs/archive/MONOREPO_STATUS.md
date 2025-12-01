# Sequential Ecosystem - Monorepo Status

## All Repositories Online and Updated

### Main Repository
- **sequential-ecosystem**: https://github.com/AnEntrypoint/sequential-ecosystem
  - Latest commit: Update GUI submodule with standalone launcher
  - Status: ✓ Live and up to date

### Submodules (All Live)

#### Core Execution
1. **sequential-fetch**: https://github.com/AnEntrypoint/sequential-fetch
   - Implicit xstate VM (auto-pause on fetch)
   
2. **sequential-flow**: https://github.com/AnEntrypoint/sequential-flow
   - Explicit xstate VM (state graph execution)
   
3. **sequential-runner**: https://github.com/AnEntrypoint/sequential-runner
   - Task execution engine

#### Storage
4. **sequential-adaptor**: https://github.com/AnEntrypoint/sequential-adaptor
   - Storage interface contract
   
5. **sequential-adaptor-sqlite**: https://github.com/AnEntrypoint/sequential-adaptor-sqlite
   - SQLite implementation
   
6. **sequential-adaptor-supabase**: https://github.com/AnEntrypoint/sequential-adaptor-supabase
   - PostgreSQL/Supabase implementation

#### Utilities
7. **sequential-http-utils**: https://github.com/AnEntrypoint/sequential-http-utils
   - HTTP client with retry logic
   
8. **sequential-logging**: https://github.com/AnEntrypoint/sequential-logging
   - Logging utilities
   
9. **sequential-storage-utils**: https://github.com/AnEntrypoint/sequential-storage-utils
   - Storage helper functions
   
10. **sequential-utils**: https://github.com/AnEntrypoint/sequential-utils
    - General utilities
    
11. **sequential-validators**: https://github.com/AnEntrypoint/sequential-validators
    - Input validation

#### Services
12. **sequential-wrapped-services**: https://github.com/AnEntrypoint/sequential-wrapped-services
    - Pre-wrapped APIs (Google, OpenAI, Supabase)
    
13. **sequential-wrapper**: https://github.com/AnEntrypoint/sequential-wrapper
    - SDK wrapping utilities

#### GUI
14. **sequential-gui**: https://github.com/AnEntrypoint/sequential-gui
    - Admin GUI for task management
    - NPX accessible: `npx sequential-ecosystem gui`
    
15. **osjs-webdesktop**: https://github.com/AnEntrypoint/osjs-webdesktop
    - Full-featured OS.js web desktop
    - NPX accessible: `npx sequential-ecosystem gui --desktop`

## NPX Access

### Main CLI
```bash
npx sequential-ecosystem <command>
```

### Available Commands
- `init` - Initialize sequential-ecosystem
- `create-task <name>` - Create new task
- `run <taskName>` - Execute task
- `list` - List all tasks
- `describe <taskName>` - Show task details
- `history <taskName>` - View execution history
- `sync-tasks` - Sync tasks to storage
- `config <action>` - Manage configuration
- `gui` - Launch admin GUI (sequential-gui)
- `gui --desktop` - Launch OS.js desktop interface

### GUI Access
```bash
# Launch React-based admin GUI
npx sequential-ecosystem gui

# Launch OS.js desktop interface
npx sequential-ecosystem gui --desktop

# Custom port
npx sequential-ecosystem gui --port 8080
```

## Verification

All submodules checked on main branch:
```bash
git submodule status
```

All repositories are:
- ✓ Online and accessible
- ✓ Up to date with latest commits
- ✓ Properly linked as submodules
- ✓ Ready for development
