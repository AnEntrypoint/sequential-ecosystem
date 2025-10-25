#!/bin/bash

# Setup npm links for all local packages using npm link
# This approach works better with Bun than pure `bun link`

set -e

echo "🔗 Setting up npm links for local packages (v2)..."
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

    echo "📦 Linking $package_name"
    npm link

    cd - > /dev/null
  fi
done

echo ""
echo "✅ Package links created!"
echo ""
echo "🔗 Now linking packages to each other..."
echo ""

# Link dependencies
declare -A DEPS=(
  ["tasker-adaptor-sqlite"]="tasker-adaptor"
  ["tasker-adaptor-supabase"]="tasker-adaptor"
  ["tasker-sequential"]="tasker-adaptor sequential-flow sdk-http-wrapper"
)

for package in "${!DEPS[@]}"; do
  if [ -d "packages/$package" ]; then
    cd "packages/$package"
    echo "📦 Installing dependencies for $package"

    for dep in ${DEPS[$package]}; do
      echo "  → npm link $dep"
      npm link "$dep"
    done

    # Install npm dependencies
    npm install

    cd - > /dev/null
  fi
done

echo ""
echo "✅ All npm links configured!"
echo ""
echo "Link status:"
for package in "${PACKAGES[@]}"; do
  if [ -d "$package" ]; then
    package_name=$(grep '"name"' "$package/package.json" | head -1 | sed 's/.*"\([^"]*\)".*/\1/')
    echo "  ✓ $package_name"
  fi
done
