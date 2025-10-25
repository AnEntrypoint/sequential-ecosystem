#!/bin/bash

# Simple npm link setup - just create the links without complex dependency management

set -e

echo "🔗 Setting up npm links (simple approach)..."
echo ""

PACKAGES=(
  "packages/sequential-fetch"
  "packages/sequential-flow"
  "packages/sdk-http-wrapper"
  "packages/tasker-adaptor"
  "packages/tasker-adaptor-sqlite"
  "packages/tasker-adaptor-supabase"
  "packages/tasker-sequential"
)

# Create links for each package
for package in "${PACKAGES[@]}"; do
  if [ -d "$package" ]; then
    cd "$package"
    package_name=$(grep '"name"' package.json | head -1 | sed 's/.*"\([^"]*\)".*/\1/')

    echo "📦 npm link $package_name"
    npm link 2>&1 | grep -E "added|up to date" || true

    cd - > /dev/null
  fi
done

echo ""
echo "✅ All packages linked globally!"
echo ""
echo "Now go to root and run:"
echo "  npm link tasker-adaptor"
echo "  npm link tasker-adaptor-sqlite"
echo "  npm link tasker-adaptor-supabase"
echo "  npm link sequential-flow"
echo "  npm link sdk-http-wrapper"
