#!/bin/bash

# Verification script for sequential-ecosystem setup

set -e

echo "╔════════════════════════════════════════════════════════════════════════════╗"
echo "║          SEQUENTIAL ECOSYSTEM - SETUP VERIFICATION SCRIPT                   ║"
echo "╚════════════════════════════════════════════════════════════════════════════╝"
echo ""

PASSED=0
FAILED=0

# Helper functions
check_file() {
  if [ -f "$1" ]; then
    echo "✅ $1"
    ((PASSED++))
  else
    echo "❌ $1 (missing)"
    ((FAILED++))
  fi
}

check_dir() {
  if [ -d "$1" ]; then
    echo "✅ $1/"
    ((PASSED++))
  else
    echo "❌ $1/ (missing)"
    ((FAILED++))
  fi
}

check_git_remote() {
  if git -C "$1" remote -v | grep -q "$2"; then
    echo "✅ $1 remote: $2"
    ((PASSED++))
  else
    echo "❌ $1 remote not found"
    ((FAILED++))
  fi
}

# Start verification
echo "📋 CHECKING MAIN ECOSYSTEM REPOSITORY"
echo "────────────────────────────────────────────────────────────────────────────"
check_file "CLAUDE.md"
check_file "SUBMODULE_SETUP.md"
check_file "GITHUB_PUSH_INSTRUCTIONS.md"
check_file "SETUP_COMPLETE_SUMMARY.md"
check_file ".gitmodules"
echo ""

echo "📦 CHECKING TASKER PACKAGES"
echo "────────────────────────────────────────────────────────────────────────────"
check_dir "packages/tasker-sequential"
check_dir "packages/tasker-adaptor"
check_dir "packages/tasker-adaptor-supabase"
check_dir "packages/tasker-adaptor-sqlite"
echo ""

echo "🔍 CHECKING TASKER-SEQUENTIAL (no Supabase imports)"
echo "────────────────────────────────────────────────────────────────────────────"
if grep -r "@supabase" packages/tasker-sequential 2>/dev/null | grep -v node_modules; then
  echo "❌ Found @supabase imports in tasker-sequential"
  ((FAILED++))
else
  echo "✅ No @supabase imports in tasker-sequential"
  ((PASSED++))
fi
echo ""

echo "🔧 CHECKING .GITMODULES CONFIGURATION"
echo "────────────────────────────────────────────────────────────────────────────"
if grep -q "tasker-wrapped-services" .gitmodules; then
  echo "✅ tasker-wrapped-services in .gitmodules"
  ((PASSED++))
else
  echo "❌ tasker-wrapped-services not in .gitmodules"
  ((FAILED++))
fi
echo ""

echo "📂 CHECKING STANDALONE REPOSITORY"
echo "────────────────────────────────────────────────────────────────────────────"
if [ -d "/tmp/tasker-wrapped-services-standalone" ]; then
  echo "✅ /tmp/tasker-wrapped-services-standalone/ exists"
  ((PASSED++))

  echo "  Checking git repository..."
  if [ -d "/tmp/tasker-wrapped-services-standalone/.git" ]; then
    echo "  ✅ .git directory exists"
    ((PASSED++))

    COMMITS=$(cd /tmp/tasker-wrapped-services-standalone && git log --oneline | wc -l)
    echo "  ✅ Git commits: $COMMITS"
    ((PASSED++))
  else
    echo "  ❌ .git directory not found"
    ((FAILED++))
  fi

  echo "  Checking services..."
  SERVICES=0
  for service in deno-executor simple-stack-processor task-executor gapi keystore supabase openai websearch admin-debug; do
    if [ -d "/tmp/tasker-wrapped-services-standalone/services/$service" ]; then
      ((SERVICES++))
    fi
  done
  echo "  ✅ Services found: $SERVICES/9"
  if [ $SERVICES -eq 9 ]; then
    ((PASSED++))
  else
    ((FAILED++))
  fi
else
  echo "❌ /tmp/tasker-wrapped-services-standalone/ not found"
  ((FAILED++))
fi
echo ""

echo "📝 CHECKING DOCUMENTATION"
echo "────────────────────────────────────────────────────────────────────────────"
check_file "/tmp/tasker-wrapped-services-standalone/README.md"
check_file "/tmp/tasker-wrapped-services-standalone/CLAUDE.md"
check_file "/tmp/tasker-wrapped-services-standalone/package.json"
echo ""

echo "🎯 CHECKING GIT HISTORY"
echo "────────────────────────────────────────────────────────────────────────────"
echo "Recent commits:"
git log --oneline | head -10
echo ""

# Summary
echo "════════════════════════════════════════════════════════════════════════════"
echo "SUMMARY"
echo "════════════════════════════════════════════════════════════════════════════"
TOTAL=$((PASSED + FAILED))
echo "✅ Passed: $PASSED"
echo "❌ Failed: $FAILED"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Total:  $TOTAL"
echo ""

if [ $FAILED -eq 0 ]; then
  echo "✨ ALL CHECKS PASSED!"
  echo ""
  echo "Next steps:"
  echo "1. Create GitHub repo: https://github.com/organizations/AnEntrypoint/repositories/new"
  echo "   Name: tasker-wrapped-services"
  echo ""
  echo "2. Push: cd /tmp/tasker-wrapped-services-standalone && git push -u origin main"
  echo ""
  echo "3. Init submodule: cd $(pwd) && git submodule update --init --recursive packages/tasker-wrapped-services"
  echo ""
  exit 0
else
  echo "⚠️  Some checks failed. Review the output above."
  exit 1
fi
