# Sequential Ecosystem - Individual Package Repository Migration

## Overview
Convert 96 @sequentialos packages from a monorepo structure to individual GitHub repositories, all linked as git submodules in the main sequential-ecosystem repo.

## Current State
- 96 packages in `packages/@sequentialos/`
- 32 already have individual repos (as submodules)
- 64 need to be extracted to separate repos

## Execution Plan

### Phase 1: Create GitHub Repositories (64 new repos)
Using GitHub CLI (gh), create a repository for each package:

```bash
# These 64 packages need repos created:
gh repo create AnEntrypoint/agent-backend --public --source=none
gh repo create AnEntrypoint/alert-engine --public --source=none
gh repo create AnEntrypoint/app-demo-chat --public --source=none
gh repo create AnEntrypoint/app-editor --public --source=none
gh repo create AnEntrypoint/app-manager --public --source=none
gh repo create AnEntrypoint/app-mcp --public --source=none
gh repo create AnEntrypoint/app-path-resolver --public --source=none
gh repo create AnEntrypoint/app-sdk --public --source=none
gh repo create AnEntrypoint/async-patterns --public --source=none
gh repo create AnEntrypoint/chat-component --public --source=none
gh repo create AnEntrypoint/cli-commands --public --source=none
gh repo create AnEntrypoint/cli-handler --public --source=none
gh repo create AnEntrypoint/command-palette --public --source=none
gh repo create AnEntrypoint/config-management --public --source=none
gh repo create AnEntrypoint/core --public --source=none
gh repo create AnEntrypoint/core-config --public --source=none
gh repo create AnEntrypoint/crud-router --public --source=none
gh repo create AnEntrypoint/custom-metrics --public --source=none
gh repo create AnEntrypoint/data-access-layer --public --source=none
gh repo create AnEntrypoint/dependency-injection --public --source=none
gh repo create AnEntrypoint/dependency-middleware --public --source=none
gh repo create AnEntrypoint/dynamic-components --public --source=none
gh repo create AnEntrypoint/editor-debug --public --source=none
gh repo create AnEntrypoint/editor-features --public --source=none
gh repo create AnEntrypoint/editor-find-replace --public --source=none
gh repo create AnEntrypoint/editor-snippets --public --source=none
gh repo create AnEntrypoint/editor-tool-autocomplete --public --source=none
gh repo create AnEntrypoint/editor-validation-hints --public --source=none
gh repo create AnEntrypoint/error-handling --public --source=none
gh repo create AnEntrypoint/event-broadcaster --public --source=none
gh repo create AnEntrypoint/execution-context --public --source=none
gh repo create AnEntrypoint/execution-tracer --public --source=none
gh repo create AnEntrypoint/factory-wrappers --public --source=none
gh repo create AnEntrypoint/file-operation-handler --public --source=none
gh repo create AnEntrypoint/file-operations --public --source=none
gh repo create AnEntrypoint/flow-validation --public --source=none
gh repo create AnEntrypoint/function-introspection --public --source=none
gh repo create AnEntrypoint/handler-wrappers --public --source=none
gh repo create AnEntrypoint/input-sanitization --public --source=none
gh repo create AnEntrypoint/observability-utils --public --source=none
gh repo create AnEntrypoint/operation-logger --public --source=none
gh repo create AnEntrypoint/path-validation --public --source=none
gh repo create AnEntrypoint/pattern-core --public --source=none
gh repo create AnEntrypoint/pattern-editor --public --source=none
gh repo create AnEntrypoint/persistent-state --public --source=none
gh repo create AnEntrypoint/query-parser --public --source=none
gh repo create AnEntrypoint/rate-limiter --public --source=none
gh repo create AnEntrypoint/realtime-sync --public --source=none
gh repo create AnEntrypoint/request-validator --public --source=none
gh repo create AnEntrypoint/resource-controller-factory --public --source=none
gh repo create AnEntrypoint/response-formatting --public --source=none
gh repo create AnEntrypoint/route-helpers --public --source=none
gh repo create AnEntrypoint/sequential-machine --public --source=none
gh repo create AnEntrypoint/sequential-os-http --public --source=none
gh repo create AnEntrypoint/server-utilities --public --source=none
gh repo create AnEntrypoint/service-factory --public --source=none
gh repo create AnEntrypoint/state-transition-logger --public --source=none
gh repo create AnEntrypoint/storage-query-tracer --public --source=none
gh repo create AnEntrypoint/task-execution-service --public --source=none
gh repo create AnEntrypoint/text-encoding --public --source=none
gh repo create AnEntrypoint/timestamp-utilities --public --source=none
gh repo create AnEntrypoint/tool-call-tracer --public --source=none
gh repo create AnEntrypoint/tool-registry --public --source=none
gh repo create AnEntrypoint/ui-components --public --source=none
gh repo create AnEntrypoint/validation --public --source=none
gh repo create AnEntrypoint/websocket-broadcaster --public --source=none
gh repo create AnEntrypoint/websocket-factory --public --source=none
```

### Phase 2: Extract Packages as Submodules
For each package, create a standalone git repo and add as submodule:

```bash
#!/bin/bash
PACKAGES=(
  "agent-backend" "alert-engine" "app-demo-chat" "app-editor" "app-manager" 
  # ... all 64 packages
)

for pkg in "${PACKAGES[@]}"; do
  echo "Converting $pkg..."
  
  # Create temporary directory
  TEMP_DIR="/tmp/${pkg}-repo"
  mkdir -p "$TEMP_DIR"
  cd "$TEMP_DIR"
  
  # Initialize git repo from package contents
  git init
  cp -r ~/sequential-ecosystem/packages/@sequentialos/"$pkg"/* .
  
  # Create initial commit
  git add .
  git commit -m "Initial commit: Extract $pkg to standalone repository"
  
  # Add remote and push
  git remote add origin "https://github.com/AnEntrypoint/${pkg}.git"
  git branch -M main
  git push -u origin main
  
  # Remove from sequential-ecosystem monorepo
  cd ~/sequential-ecosystem
  git rm -r packages/@sequentialos/"$pkg"
  
  # Add as submodule
  git submodule add "https://github.com/AnEntrypoint/${pkg}.git" "packages/@sequentialos/${pkg}"
  git commit -m "refactor: Convert $pkg to git submodule

- Extract package to individual GitHub repository
- Link as git submodule in sequential-ecosystem
- Enable independent versioning and maintenance

🤖 Generated with Claude Code

Co-Authored-By: Claude <noreply@anthropic.com>"
  
  echo "✓ $pkg migrated"
done
```

### Phase 3: Update Monorepo Configuration
After all submodules are added:

```bash
# Update workspaces in root package.json (should already be correct)
# npm workspaces will automatically detect submodule packages

# Commit all changes
git add .gitmodules package.json
git commit -m "refactor: Complete submodule migration for all 96 packages

- All packages now have individual GitHub repositories
- All packages linked as git submodules
- Each package can be independently versioned
- Each package can be independently published to npm
- Improved separation of concerns and maintainability

🤖 Generated with Claude Code

Co-Authored-By: Claude <noreply@anthropic.com>"

# Push to origin
git push origin main
```

## Benefits
✓ Independent versioning per package (semantic versioning)
✓ Separate issue tracking per package
✓ Easier code review per package (smaller diffs)
✓ Clear package boundaries and dependencies
✓ Each package independently publishable to npm
✓ Easier for external contributors to work on specific packages
✓ Reduced monorepo size and faster clones
✓ Better CI/CD granularity (test/publish per package)

## Timeline
- Phase 1 (Create repos): ~2-5 minutes (mostly API calls)
- Phase 2 (Extract packages): ~10-20 minutes per package (~16-32 hours total, can parallelize)
- Phase 3 (Update config): ~5 minutes

## Notes
- Each package retains its original code and history
- Git submodules point to main branch of each package repo
- Can lock to specific versions if needed (git submodule <ref>)
- npm install will still work normally with npm workspaces
- Each package can have its own package.json, README, LICENSE, etc.

## Next Steps After Migration
1. Update CI/CD to publish packages independently
2. Setup automated semantic versioning per package
3. Update documentation to reference package repos
4. Setup issue templates per package
5. Consider monorepo tools like Lerna or pnpm for advanced features
