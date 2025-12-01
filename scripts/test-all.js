#!/usr/bin/env node

import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const packagesDir = path.join(__dirname, '..', 'packages');
const packages = fs.readdirSync(packagesDir).filter(pkg => {
  const pkgPath = path.join(packagesDir, pkg);
  return fs.statSync(pkgPath).isDirectory();
});

const packagesWithTests = [
  'sequential-validators',
  'sequential-storage-utils',
  'sequential-adaptor',
  'sequential-adaptor-sqlite',
  'sequential-utils',
  'sequential-logging'
];

const results = {
  passed: [],
  failed: [],
  skipped: [],
  total: 0
};

async function runTest(packageName) {
  return new Promise((resolve) => {
    const pkgPath = path.join(packagesDir, packageName);
    const packageJsonPath = path.join(pkgPath, 'package.json');

    if (!fs.existsSync(packageJsonPath)) {
      console.log(`\n⊘ ${packageName}: No package.json found`);
      results.skipped.push(packageName);
      resolve(false);
      return;
    }

    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    if (!packageJson.scripts || !packageJson.scripts.test) {
      console.log(`\n⊘ ${packageName}: No test script defined`);
      results.skipped.push(packageName);
      resolve(false);
      return;
    }

    console.log(`\n▶ Running tests for ${packageName}...`);
    const testProcess = spawn('npm', ['test'], {
      cwd: pkgPath,
      stdio: 'inherit',
      shell: true
    });

    testProcess.on('close', (code) => {
      if (code === 0) {
        console.log(`✓ ${packageName}: Tests passed`);
        results.passed.push(packageName);
        resolve(true);
      } else {
        console.log(`✗ ${packageName}: Tests failed with code ${code}`);
        results.failed.push(packageName);
        resolve(false);
      }
    });

    testProcess.on('error', (err) => {
      console.error(`✗ ${packageName}: Error running tests:`, err.message);
      results.failed.push(packageName);
      resolve(false);
    });
  });
}

async function main() {
  console.log('='.repeat(60));
  console.log('Sequential Ecosystem Test Runner');
  console.log('='.repeat(60));
  console.log(`Found ${packages.length} packages`);
  console.log(`Packages with test suites: ${packagesWithTests.length}`);
  console.log('='.repeat(60));

  for (const pkg of packagesWithTests) {
    await runTest(pkg);
    results.total++;
  }

  console.log('\n' + '='.repeat(60));
  console.log('Test Summary');
  console.log('='.repeat(60));
  console.log(`Total packages: ${packages.length}`);
  console.log(`Packages tested: ${results.total}`);
  console.log(`Passed: ${results.passed.length}`);
  console.log(`Failed: ${results.failed.length}`);
  console.log(`Skipped: ${results.skipped.length}`);

  if (results.passed.length > 0) {
    console.log('\n✓ Passed:');
    results.passed.forEach(pkg => console.log(`  - ${pkg}`));
  }

  if (results.failed.length > 0) {
    console.log('\n✗ Failed:');
    results.failed.forEach(pkg => console.log(`  - ${pkg}`));
  }

  if (results.skipped.length > 0) {
    console.log('\n⊘ Skipped (no tests):');
    results.skipped.forEach(pkg => console.log(`  - ${pkg}`));
  }

  console.log('='.repeat(60));

  process.exit(results.failed.length > 0 ? 1 : 0);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
