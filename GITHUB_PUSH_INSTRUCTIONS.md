# Push tasker-wrapped-services to GitHub

The standalone `tasker-wrapped-services` repository is ready at `/tmp/tasker-wrapped-services-standalone/`

## Prerequisites

- GitHub account with access to AnEntrypoint organization
- Git configured with credentials

## Step 1: Create Repository on GitHub

1. Go to https://github.com/organizations/AnEntrypoint/repositories/new
2. Fill in:
   - **Repository name**: `tasker-wrapped-services`
   - **Description**: Runtime-agnostic HTTP service implementations for tasker-sequential
   - **Visibility**: Public
   - **Initialize repository**: ☐ (leave unchecked - we'll push existing repo)
3. Click "Create repository"

You'll get a message with instructions. The URL will be:
```
https://github.com/AnEntrypoint/tasker-wrapped-services.git
```

## Step 2: Push Repository to GitHub

```bash
cd /tmp/tasker-wrapped-services-standalone

# Add GitHub remote
git remote add origin https://github.com/AnEntrypoint/tasker-wrapped-services.git

# Verify remote is set
git remote -v
# Should show:
# origin  https://github.com/AnEntrypoint/tasker-wrapped-services.git (fetch)
# origin  https://github.com/AnEntrypoint/tasker-wrapped-services.git (push)

# Push to GitHub
git branch -M main
git push -u origin main

# Verify push was successful
git log --oneline
```

## Step 3: Add Submodule to Ecosystem

Once pushed to GitHub, initialize the submodule in the main ecosystem:

```bash
cd /mnt/c/dev/sequential-ecosystem

# Initialize the submodule
git submodule update --init --recursive packages/tasker-wrapped-services

# Verify it's initialized
ls packages/tasker-wrapped-services/
# Should show: CLAUDE.md, README.md, cli.js, package.json, services/, shared/

# Check submodule status
git submodule status
```

## Step 4: Verify Submodule Configuration

```bash
# Check .gitmodules
cat .gitmodules | grep -A3 "tasker-wrapped-services"

# Should show:
# [submodule "packages/tasker-wrapped-services"]
#     path = packages/tasker-wrapped-services
#     url = https://github.com/AnEntrypoint/tasker-wrapped-services.git
#     branch = main
```

## Step 5: Test Everything

```bash
# Verify all files are present
cd packages/tasker-wrapped-services
ls services/
# Should list: admin-debug, deno-executor, gapi, keystore, openai, simple-stack-processor, supabase, task-executor, websearch

# Check we can start services
npm install
npm start -- --help

# Verify package.json exists
cat package.json | head -10
```

## Step 6: Commit to Main Ecosystem

```bash
cd /mnt/c/dev/sequential-ecosystem

# Add the submodule reference
git add .gitmodules packages/tasker-wrapped-services

# Check what will be committed
git status

# Commit
git commit -m "Initialize tasker-wrapped-services submodule

Updates .gitmodules to track:
https://github.com/AnEntrypoint/tasker-wrapped-services.git

Contains runtime-agnostic HTTP services:
- deno-executor: Task execution runtime
- simple-stack-processor: Stack processor
- task-executor: Task submission
- gapi: Google APIs wrapper
- keystore: Credential storage
- supabase: Database operations
- openai: OpenAI API wrapper
- websearch: Web search integration
- admin-debug: Debugging utilities

Service discovery and dynamic startup via npm start"

# Push to GitHub
git push origin main
```

## Step 7: Verify Complete Setup

```bash
# From ecosystem root
git submodule status
# Should show: 169869b packages/tasker-wrapped-services (Add comprehensive README with quick start and deployment guide)

# Check that cloning works with submodules
cd /tmp
git clone --recurse-submodules https://github.com/AnEntrypoint/sequential-ecosystem.git ecosystem-test
cd ecosystem-test
ls packages/tasker-wrapped-services/services/
# Should list all services
```

## Troubleshooting

### "fatal: could not create work tree dir"

If you get permission errors, the directory might have wrong ownership. Rebuild:

```bash
rm -rf packages/tasker-wrapped-services
git submodule update --init --recursive packages/tasker-wrapped-services
```

### Submodule stuck at old commit

```bash
cd packages/tasker-wrapped-services
git fetch origin main
git checkout origin/main
cd ..
git add packages/tasker-wrapped-services
git commit -m "Update wrapped-services to latest"
```

### Want to make changes to wrapped-services

```bash
# Changes go to the submodule repository
cd packages/tasker-wrapped-services
git checkout main  # Make sure on main branch
# Make your changes
git add .
git commit -m "Your change"
git push origin main

# Then update the reference in the main repo
cd ../..
git add packages/tasker-wrapped-services
git commit -m "Update wrapped-services submodule"
git push origin main
```

## Next Steps

After setup is complete:

1. ✅ Repository created on GitHub
2. ✅ Pushed to GitHub
3. ✅ Submodule initialized locally
4. ✅ Committed to ecosystem repo
5. 🔄 **Create additional repositories**:
   - tasker-sequential (if not already created)
   - tasker-adaptor (if not already created)
   - tasker-adaptor-supabase (if not already created)
   - tasker-adaptor-sqlite (if not already created)

## References

- [Git Submodules Documentation](https://git-scm.com/book/en/v2/Git-Tools-Submodules)
- [tasker-wrapped-services CLAUDE.md](packages/tasker-wrapped-services/CLAUDE.md)
- [tasker-wrapped-services README](packages/tasker-wrapped-services/README.md)
