# Tasker Wrapped Services - Git Submodule Setup

This guide explains how to set up `tasker-wrapped-services` as a standalone GitHub repository linked as a git submodule.

## Current Status

✅ Main sequential-ecosystem repository is configured to include tasker-wrapped-services as a submodule
❌ tasker-wrapped-services repository does not yet exist on GitHub
❌ Submodule not yet initialized locally

## Step 1: Create GitHub Repository

Create a new repository on GitHub under **AnEntrypoint**:

**Repository Details:**
- **Name**: tasker-wrapped-services
- **Owner**: AnEntrypoint
- **Type**: Public
- **Initialize**: Do NOT initialize with README or .gitignore (we'll push from command line)

**URL**: https://github.com/AnEntrypoint/tasker-wrapped-services.git

## Step 2: Initialize Wrapped Services as Standalone Repo

First, get the wrapped services files:

```bash
# The files are in a temporary location
# We'll recreate them from the ecosystem commit history
cd sequential-ecosystem
git show e48cc6e:packages/tasker-wrapped-services > /tmp/wrapped-services.tar
```

Or, restore from the last commit that had them:

```bash
cd sequential-ecosystem
git log --oneline | grep "Create tasker-wrapped-services"
# Should see: e48cc6e Create tasker-wrapped-services package...
git show e48cc6e --name-only | grep "packages/tasker-wrapped-services" | head -5
```

## Step 3: Set Up Local Wrapped Services Repo

Create a temporary directory and initialize the repo:

```bash
mkdir -p ~/tasker-wrapped-services
cd ~/tasker-wrapped-services
git init -b main
git config user.name "lanmower"
git config user.email "lanmower@users.noreply.github.com"
```

## Step 4: Restore Files from Git History

Get the files from the ecosystem repo:

```bash
cd ~/sequential-ecosystem
git show e48cc6e:packages/tasker-wrapped-services/ | tar xC ~/tasker-wrapped-services
```

Or check out the specific commit and copy:

```bash
cd ~/sequential-ecosystem
git show e48cc6e --quiet -- packages/tasker-wrapped-services > /dev/null 2>&1
# Extract files manually from git history
```

## Step 5: Commit and Push to GitHub

```bash
cd ~/tasker-wrapped-services

# Create initial commit
git add .
git commit -m "Initial commit: tasker-wrapped-services

Runtime-agnostic HTTP service implementations for tasker-sequential:
- deno-executor: Task execution runtime
- simple-stack-processor: Stack processor
- task-executor: Task submission
- gapi: Google APIs wrapper
- keystore: Credential storage
- supabase: Database operations
- openai: OpenAI API wrapper
- websearch: Web search integration
- admin-debug: Debugging utilities

Service discovery and dynamic startup via npm start

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"

# Add GitHub remote
git remote add origin https://github.com/AnEntrypoint/tasker-wrapped-services.git

# Push to GitHub
git branch -M main
git push -u origin main
```

## Step 6: Initialize Submodule in Ecosystem

```bash
cd ~/sequential-ecosystem

# Initialize the submodule
git submodule update --init --recursive packages/tasker-wrapped-services

# Verify it's initialized
git config --file=.gitmodules --get-regexp '^submodule\..*\.url$'

# You should see wrapped-services listed
```

## Step 7: Verify Setup

```bash
# Check submodule status
git submodule status

# Should show something like:
# -e48cc6e packages/tasker-wrapped-services (e48cc6e)
# (Once pushed to GitHub, the commit hash will match)

# Check that files are present
ls packages/tasker-wrapped-services/services/
# Should list: admin-debug, deno-executor, gapi, keystore, openai, simple-stack-processor, supabase, task-executor, websearch
```

## Step 8: Update Ecosystem Repository

Push the updated .gitmodules configuration:

```bash
cd ~/sequential-ecosystem
git add .gitmodules
git commit -m "Update .gitmodules to point to live tasker-wrapped-services repo"
git push origin main
```

## Ongoing Workflow

### For wrapped-services changes:

```bash
cd packages/tasker-wrapped-services
# Make changes
git add .
git commit -m "Update services"
git push origin main

# Back in main repo
cd ..
git add packages/tasker-wrapped-services
git commit -m "Update tasker-wrapped-services to latest"
git push origin main
```

### For cloning the ecosystem with submodules:

```bash
git clone --recurse-submodules https://github.com/AnEntrypoint/sequential-ecosystem.git
```

Or if already cloned:

```bash
git submodule update --init --recursive
```

## Submodule Configuration

Current `.gitmodules` configuration:

```
[submodule "packages/tasker-wrapped-services"]
	path = packages/tasker-wrapped-services
	url = https://github.com/AnEntrypoint/tasker-wrapped-services.git
	branch = main
```

This means:
- **path**: Where the submodule is located in the ecosystem
- **url**: The GitHub repository URL
- **branch**: Track the main branch for automatic updates

## Important Notes

⚠️ **File Permissions**: If you see "chmod on ... failed", this is usually a Git configuration issue with WSL/sandbox environments. You can safely ignore it.

⚠️ **Submodule Commits**: When you push changes to wrapped-services, make sure to also commit the new submodule reference in the main repo. Each repo has its own history.

⚠️ **Cloning**: Always use `--recurse-submodules` when cloning to initialize submodules automatically.

## Troubleshooting

### Submodule not initialized

```bash
git submodule update --init --recursive
```

### Submodule pointing to wrong commit

```bash
cd packages/tasker-wrapped-services
git pull origin main
cd ..
git add packages/tasker-wrapped-services
git commit -m "Update wrapped-services to latest"
```

### Remove and re-add submodule

```bash
git rm packages/tasker-wrapped-services
rm -rf .git/modules/packages/tasker-wrapped-services
git submodule add https://github.com/AnEntrypoint/tasker-wrapped-services.git packages/tasker-wrapped-services
```

## Reference

- [Git Submodules Documentation](https://git-scm.com/book/en/v2/Git-Tools-Submodules)
- [GitHub Submodule Guide](https://docs.github.com/en/repositories/working-with-submodules)
