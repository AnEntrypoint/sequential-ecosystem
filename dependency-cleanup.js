#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PACKAGES_DIR = path.join(__dirname, 'packages');
const BACKUP_DIR = path.join(__dirname, '.dependency-cleanup-backup');
const DRY_RUN = process.argv.includes('--dry-run');
const PHASE = process.argv.find(arg => arg.startsWith('--phase'))?.split('=')[1];

const CHANGES = {
  removed: [],
  added: [],
  updated: [],
  errors: []
};

function log(message, level = 'info') {
  const prefix = {
    info: '📝',
    success: '✅',
    warning: '⚠️',
    error: '❌',
    dry: '🔍'
  }[level];
  console.log(`${prefix} ${message}`);
}

function backupPackageJson(pkgName) {
  if (DRY_RUN) return;

  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
  }

  const srcPath = path.join(PACKAGES_DIR, pkgName, 'package.json');
  const backupPath = path.join(BACKUP_DIR, `${pkgName}-package.json`);

  try {
    fs.copyFileSync(srcPath, backupPath);
    log(`Backed up ${pkgName}/package.json`, 'info');
  } catch (err) {
    log(`Failed to backup ${pkgName}: ${err.message}`, 'error');
  }
}

function readPackageJson(pkgName) {
  const pkgPath = path.join(PACKAGES_DIR, pkgName, 'package.json');
  try {
    return JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  } catch (err) {
    log(`Error reading ${pkgName}/package.json: ${err.message}`, 'error');
    return null;
  }
}

function writePackageJson(pkgName, pkg) {
  if (DRY_RUN) {
    log(`[DRY RUN] Would update ${pkgName}/package.json`, 'dry');
    return;
  }

  const pkgPath = path.join(PACKAGES_DIR, pkgName, 'package.json');
  try {
    fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
    log(`Updated ${pkgName}/package.json`, 'success');
  } catch (err) {
    log(`Failed to write ${pkgName}/package.json: ${err.message}`, 'error');
    CHANGES.errors.push({ package: pkgName, error: err.message });
  }
}

function removeDependency(pkgName, depName) {
  backupPackageJson(pkgName);
  const pkg = readPackageJson(pkgName);
  if (!pkg) return;

  let removed = false;
  if (pkg.dependencies && pkg.dependencies[depName]) {
    delete pkg.dependencies[depName];
    removed = true;
  }
  if (pkg.devDependencies && pkg.devDependencies[depName]) {
    delete pkg.devDependencies[depName];
    removed = true;
  }

  if (removed) {
    writePackageJson(pkgName, pkg);
    CHANGES.removed.push({ package: pkgName, dependency: depName });
    log(`Removed ${depName} from ${pkgName}`, 'success');
  }
}

function addDependency(pkgName, depName, version) {
  backupPackageJson(pkgName);
  const pkg = readPackageJson(pkgName);
  if (!pkg) return;

  if (!pkg.dependencies) pkg.dependencies = {};
  pkg.dependencies[depName] = version;

  writePackageJson(pkgName, pkg);
  CHANGES.added.push({ package: pkgName, dependency: depName, version });
  log(`Added ${depName}@${version} to ${pkgName}`, 'success');
}

function updateDependencyVersion(pkgName, depName, newVersion) {
  backupPackageJson(pkgName);
  const pkg = readPackageJson(pkgName);
  if (!pkg) return;

  let updated = false;
  if (pkg.dependencies && pkg.dependencies[depName]) {
    pkg.dependencies[depName] = newVersion;
    updated = true;
  }
  if (pkg.devDependencies && pkg.devDependencies[depName]) {
    pkg.devDependencies[depName] = newVersion;
    updated = true;
  }

  if (updated) {
    writePackageJson(pkgName, pkg);
    CHANGES.updated.push({ package: pkgName, dependency: depName, version: newVersion });
    log(`Updated ${depName} to ${newVersion} in ${pkgName}`, 'success');
  }
}

function moveDependencyToDevDeps(pkgName, depName) {
  backupPackageJson(pkgName);
  const pkg = readPackageJson(pkgName);
  if (!pkg) return;

  if (pkg.dependencies && pkg.dependencies[depName]) {
    const version = pkg.dependencies[depName];
    delete pkg.dependencies[depName];

    if (!pkg.devDependencies) pkg.devDependencies = {};
    pkg.devDependencies[depName] = version;

    writePackageJson(pkgName, pkg);
    CHANGES.updated.push({ package: pkgName, dependency: depName, change: 'moved to devDependencies' });
    log(`Moved ${depName} to devDependencies in ${pkgName}`, 'success');
  }
}

// ============================================================================
// PHASE 1: QUICK WINS
// ============================================================================

function phase1_removeUnusedZellousSDK() {
  log('\n=== Phase 1.1: Remove Unused Zellous SDK ===', 'info');

  const packages = [
    'app-code-editor',
    'app-file-browser',
    'app-flow-editor',
    'app-run-observer',
    'app-task-editor',
    'app-tool-editor'
  ];

  packages.forEach(pkg => {
    removeDependency(pkg, '@sequential/zellous-client-sdk');
  });
}

function phase1_fixVersionMismatches() {
  log('\n=== Phase 1.2: Fix Version Mismatches ===', 'info');

  // Standardize dotenv to ^16.4.7
  updateDependencyVersion('sequential-wrapper', 'dotenv', '^16.4.7');

  // Move nodemon to devDependencies and standardize to ^3.1.11
  moveDependencyToDevDeps('sequential-wrapper', 'nodemon');
  updateDependencyVersion('sequential-wrapper', 'nodemon', '^3.1.11');

  moveDependencyToDevDeps('zellous', 'nodemon');
  updateDependencyVersion('zellous', 'nodemon', '^3.1.11');

  moveDependencyToDevDeps('zellous', '@playwright/test');
}

function phase1_removeClearlyUnused() {
  log('\n=== Phase 1.3: Remove Clearly Unused Dependencies ===', 'info');

  // desktop-server
  removeDependency('desktop-server', '@sequential/input-sanitization');
  removeDependency('desktop-server', '@sequential/response-formatting');
  removeDependency('desktop-server', '@sequential/websocket-factory');
  removeDependency('desktop-server', 'http-errors');

  // core
  removeDependency('core', 'fs-extra');

  // sequential-fetch
  removeDependency('sequential-fetch', '@types/node');

  // sequential-flow
  removeDependency('sequential-flow', '@sequential/sequential-fetch');
  removeDependency('sequential-flow', '@sequential/sequential-utils');

  // sequential-adaptor-sqlite
  removeDependency('sequential-adaptor-sqlite', '@sequential/sequential-validators');

  // sequential-adaptor-supabase
  removeDependency('sequential-adaptor-supabase', '@sequential/sequential-storage-utils');
  removeDependency('sequential-adaptor-supabase', '@sequential/sequential-validators');
}

function phase1_addMissingDeps() {
  log('\n=== Phase 1.4: Add Missing Dependencies ===', 'info');

  // desktop-ui-components needs hyperapp
  addDependency('desktop-ui-components', 'hyperapp', '^2.0.8');

  // file-operations needs fs-extra
  addDependency('file-operations', 'fs-extra', '^11.1.1');
}

// ============================================================================
// PHASE 2: NAME CONSOLIDATION
// ============================================================================

function phase2_fixScopedNames() {
  log('\n=== Phase 2: Fix Scoped Package Names ===', 'info');

  // sequential-adaptor: Fix old non-scoped names
  removeDependency('sequential-adaptor', 'sequential-logging');
  removeDependency('sequential-adaptor', 'sequential-storage-utils');
  removeDependency('sequential-adaptor', 'sequential-utils');
  addDependency('sequential-adaptor', '@sequential/sequential-logging', '^1.0.3');
  addDependency('sequential-adaptor', '@sequential/sequential-storage-utils', '^1.0.1');
  addDependency('sequential-adaptor', '@sequential/sequential-utils', '^1.0.0');

  // sequential-runner: Fix old non-scoped names
  removeDependency('sequential-runner', 'sequential-utils');
  addDependency('sequential-runner', '@sequential/sequential-utils', '^1.0.0');

  // sequential-machine: Fix old non-scoped names
  removeDependency('sequential-machine', 'sequential-flow');
  removeDependency('sequential-machine', 'sequential-utils');
  addDependency('sequential-machine', '@sequential/sequential-flow', '^1.0.0');
  addDependency('sequential-machine', '@sequential/sequential-utils', '^1.0.0');

  // sequential-adaptor-supabase: Add missing utils
  addDependency('sequential-adaptor-supabase', '@sequential/sequential-utils', '^1.0.0');
}

// ============================================================================
// PHASE 3: DEEP INVESTIGATION (Manual Review Required)
// ============================================================================

function phase3_report() {
  log('\n=== Phase 3: Deep Investigation Required ===', 'warning');
  log('The following packages need manual review:', 'warning');
  log('', 'info');

  log('1. cli-commands:', 'info');
  log('   - Check if @sequential/sequential-runner is used in CLI entry', 'info');
  log('   - Check if commander is used for arg parsing', 'info');
  log('', 'info');

  log('2. sequential-runner (5 potentially unused deps):', 'info');
  log('   - @sequential/sequential-adaptor', 'info');
  log('   - @sequential/sequential-flow', 'info');
  log('   - dotenv', 'info');
  log('   - sequential-wrapper', 'info');
  log('   - Investigate: Are these needed by runtime code not scanned?', 'info');
  log('', 'info');

  log('3. sequential-wrapped-services (4 unused + self-import):', 'info');
  log('   - Unused: @sequential/sequential-http-utils', 'info');
  log('   - Unused: @sequential/sequential-logging', 'info');
  log('   - Unused: @sequential/sequential-validators', 'info');
  log('   - Unused: dotenv', 'info');
  log('   - Self-import detected: Investigate circular dependency', 'info');
  log('', 'info');

  log('4. sequential-wrapper (5 unused + self-import):', 'info');
  log('   - Unused: cors', 'info');
  log('   - Unused: dotenv', 'info');
  log('   - Unused: express', 'info');
  log('   - Unused: node-fetch', 'info');
  log('   - Self-import detected: Investigate circular dependency', 'info');
  log('', 'info');

  log('5. zellous (1 missing dep):', 'info');
  log('   - Missing: mini-css-extract-plugin (likely webpack plugin, add to devDeps?)', 'info');
  log('', 'info');

  log('Run manual code audit before removing these dependencies.', 'warning');
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

function printSummary() {
  log('\n=== CLEANUP SUMMARY ===', 'info');
  log(`Removed: ${CHANGES.removed.length} dependencies`, 'info');
  log(`Added: ${CHANGES.added.length} dependencies`, 'info');
  log(`Updated: ${CHANGES.updated.length} dependencies`, 'info');
  log(`Errors: ${CHANGES.errors.length}`, CHANGES.errors.length > 0 ? 'error' : 'info');

  if (CHANGES.removed.length > 0) {
    log('\nRemoved dependencies:', 'info');
    CHANGES.removed.forEach(c => {
      log(`  ${c.package}: ${c.dependency}`, 'info');
    });
  }

  if (CHANGES.added.length > 0) {
    log('\nAdded dependencies:', 'info');
    CHANGES.added.forEach(c => {
      log(`  ${c.package}: ${c.dependency}@${c.version}`, 'info');
    });
  }

  if (CHANGES.updated.length > 0) {
    log('\nUpdated dependencies:', 'info');
    CHANGES.updated.forEach(c => {
      if (c.version) {
        log(`  ${c.package}: ${c.dependency}@${c.version}`, 'info');
      } else {
        log(`  ${c.package}: ${c.dependency} (${c.change})`, 'info');
      }
    });
  }

  if (CHANGES.errors.length > 0) {
    log('\nErrors:', 'error');
    CHANGES.errors.forEach(e => {
      log(`  ${e.package}: ${e.error}`, 'error');
    });
  }

  if (!DRY_RUN) {
    log(`\nBackups saved to: ${BACKUP_DIR}`, 'info');
    log('To restore: cp .dependency-cleanup-backup/* packages/*/package.json', 'info');
  }
}

function saveChangeLog() {
  if (DRY_RUN) return;

  const changelog = {
    timestamp: new Date().toISOString(),
    changes: CHANGES,
    summary: {
      removed: CHANGES.removed.length,
      added: CHANGES.added.length,
      updated: CHANGES.updated.length,
      errors: CHANGES.errors.length
    }
  };

  const logPath = path.join(__dirname, 'dependency-cleanup-changelog.json');
  fs.writeFileSync(logPath, JSON.stringify(changelog, null, 2));
  log(`\nChange log saved to: ${logPath}`, 'success');
}

function main() {
  log('🧹 Sequential Ecosystem - Dependency Cleanup', 'info');

  if (DRY_RUN) {
    log('🔍 DRY RUN MODE - No changes will be made', 'dry');
  }

  if (PHASE) {
    log(`Running Phase ${PHASE} only`, 'info');
  }

  if (!PHASE || PHASE === '1') {
    phase1_removeUnusedZellousSDK();
    phase1_fixVersionMismatches();
    phase1_removeClearlyUnused();
    phase1_addMissingDeps();
  }

  if (!PHASE || PHASE === '2') {
    phase2_fixScopedNames();
  }

  if (!PHASE || PHASE === '3') {
    phase3_report();
  }

  printSummary();
  saveChangeLog();

  if (!DRY_RUN) {
    log('\n✅ Cleanup complete!', 'success');
    log('Next steps:', 'info');
    log('1. Review changes: git diff packages/*/package.json', 'info');
    log('2. Run tests: npm test', 'info');
    log('3. Commit: git add . && git commit -m "chore: clean up unused dependencies"', 'info');
  }
}

main();
