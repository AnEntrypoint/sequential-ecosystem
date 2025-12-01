#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PACKAGES_DIR = path.join(__dirname, 'packages');
const RESULTS = {
  packages: [],
  unusedDeps: [],
  versionMismatches: {},
  missingDeps: [],
  sharedDeps: {},
  summary: {}
};

function getPackageDirs() {
  return fs.readdirSync(PACKAGES_DIR)
    .filter(name => {
      const pkgPath = path.join(PACKAGES_DIR, name);
      return fs.statSync(pkgPath).isDirectory() &&
             fs.existsSync(path.join(pkgPath, 'package.json'));
    })
    .sort();
}

function readPackageJson(pkgName) {
  const pkgPath = path.join(PACKAGES_DIR, pkgName, 'package.json');
  try {
    return JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  } catch (err) {
    console.error(`Error reading ${pkgPath}: ${err.message}`);
    return null;
  }
}

function getAllDeps(pkg) {
  const deps = {};
  if (pkg.dependencies) Object.assign(deps, pkg.dependencies);
  if (pkg.devDependencies) Object.assign(deps, pkg.devDependencies);
  return deps;
}

function findImportsInCode(pkgName) {
  const pkgPath = path.join(PACKAGES_DIR, pkgName);
  const imports = new Set();

  try {
    // Find all .js files
    const jsFiles = execSync(
      `find "${pkgPath}" -name "*.js" -not -path "*/node_modules/*" -not -path "*/dist/*" 2>/dev/null || true`,
      { encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 }
    ).trim().split('\n').filter(Boolean);

    for (const file of jsFiles) {
      try {
        const content = fs.readFileSync(file, 'utf8');

        // Match require('package') and import from 'package'
        const requireMatches = content.matchAll(/require\s*\(\s*['"]([^'"]+)['"]\s*\)/g);
        const importMatches = content.matchAll(/(?:import|export).*?from\s*['"]([^'"]+)['"]/g);

        for (const match of requireMatches) {
          const pkg = match[1];
          if (!pkg.startsWith('.') && !pkg.startsWith('/')) {
            // Extract package name (handle @scope/package)
            const pkgName = pkg.startsWith('@') ? pkg.split('/').slice(0, 2).join('/') : pkg.split('/')[0];
            imports.add(pkgName);
          }
        }

        for (const match of importMatches) {
          const pkg = match[1];
          if (!pkg.startsWith('.') && !pkg.startsWith('/')) {
            const pkgName = pkg.startsWith('@') ? pkg.split('/').slice(0, 2).join('/') : pkg.split('/')[0];
            imports.add(pkgName);
          }
        }
      } catch (err) {
        // Skip files with read errors
      }
    }
  } catch (err) {
    console.error(`Error scanning ${pkgName}: ${err.message}`);
  }

  return Array.from(imports).sort();
}

function analyzePackage(pkgName) {
  const pkg = readPackageJson(pkgName);
  if (!pkg) return null;

  const declaredDeps = getAllDeps(pkg);
  const declaredDepNames = Object.keys(declaredDeps).sort();
  const usedDeps = findImportsInCode(pkgName);

  const unusedDeps = declaredDepNames.filter(dep => !usedDeps.includes(dep));
  const missingDeps = usedDeps.filter(dep => !declaredDepNames.includes(dep));

  return {
    name: pkgName,
    version: pkg.version,
    declaredDeps,
    declaredDepNames,
    usedDeps,
    unusedDeps,
    missingDeps,
    cleanupNeeded: unusedDeps.length > 0 || missingDeps.length > 0
  };
}

function trackSharedDeps(analysis) {
  for (const [dep, version] of Object.entries(analysis.declaredDeps)) {
    if (!RESULTS.sharedDeps[dep]) {
      RESULTS.sharedDeps[dep] = {};
    }
    if (!RESULTS.sharedDeps[dep][version]) {
      RESULTS.sharedDeps[dep][version] = [];
    }
    RESULTS.sharedDeps[dep][version].push(analysis.name);
  }
}

function identifyVersionMismatches() {
  for (const [dep, versions] of Object.entries(RESULTS.sharedDeps)) {
    const versionList = Object.keys(versions);
    if (versionList.length > 1) {
      RESULTS.versionMismatches[dep] = {
        versions: versionList,
        packages: versions,
        usageCount: Object.values(versions).reduce((sum, pkgs) => sum + pkgs.length, 0)
      };
    }
  }
}

function generateSummary() {
  const totalPackages = RESULTS.packages.length;
  const packagesWithUnused = RESULTS.packages.filter(p => p.unusedDeps.length > 0).length;
  const packagesWithMissing = RESULTS.packages.filter(p => p.missingDeps.length > 0).length;
  const totalUnused = RESULTS.packages.reduce((sum, p) => sum + p.unusedDeps.length, 0);
  const totalMissing = RESULTS.packages.reduce((sum, p) => sum + p.missingDeps.length, 0);
  const totalVersionMismatches = Object.keys(RESULTS.versionMismatches).length;

  // Find most shared deps (used in 3+ packages)
  const sharedDeps = Object.entries(RESULTS.sharedDeps)
    .map(([dep, versions]) => ({
      dep,
      packageCount: Object.values(versions).reduce((sum, pkgs) => sum + pkgs.length, 0),
      versionCount: Object.keys(versions).length
    }))
    .filter(d => d.packageCount >= 3)
    .sort((a, b) => b.packageCount - a.packageCount);

  RESULTS.summary = {
    totalPackages,
    packagesWithUnused,
    packagesWithMissing,
    totalUnused,
    totalMissing,
    totalVersionMismatches,
    sharedDepsCount: sharedDeps.length,
    top20SharedDeps: sharedDeps.slice(0, 20)
  };
}

function printReport() {
  console.log('='.repeat(80));
  console.log('SEQUENTIAL ECOSYSTEM - DEPENDENCY AUDIT REPORT');
  console.log('='.repeat(80));
  console.log();

  console.log('EXECUTIVE SUMMARY');
  console.log('-'.repeat(80));
  console.log(`Total Packages: ${RESULTS.summary.totalPackages}`);
  console.log(`Packages with Unused Dependencies: ${RESULTS.summary.packagesWithUnused}`);
  console.log(`Packages with Missing Dependencies: ${RESULTS.summary.packagesWithMissing}`);
  console.log(`Total Unused Dependencies: ${RESULTS.summary.totalUnused}`);
  console.log(`Total Missing Dependencies: ${RESULTS.summary.totalMissing}`);
  console.log(`Dependencies with Version Mismatches: ${RESULTS.summary.totalVersionMismatches}`);
  console.log(`Shared Dependencies (used in 3+ packages): ${RESULTS.summary.sharedDepsCount}`);
  console.log();

  console.log('TOP 20 SHARED DEPENDENCIES');
  console.log('-'.repeat(80));
  console.log('Rank | Dependency | Used In | Versions');
  console.log('-'.repeat(80));
  RESULTS.summary.top20SharedDeps.forEach((d, i) => {
    console.log(`${(i+1).toString().padStart(4)} | ${d.dep.padEnd(30)} | ${d.packageCount.toString().padStart(7)} | ${d.versionCount}`);
  });
  console.log();

  console.log('PACKAGES WITH UNUSED DEPENDENCIES');
  console.log('-'.repeat(80));
  const withUnused = RESULTS.packages.filter(p => p.unusedDeps.length > 0);
  if (withUnused.length === 0) {
    console.log('✅ No unused dependencies found!');
  } else {
    console.log(`Found ${withUnused.length} packages with unused dependencies:\n`);
    withUnused.forEach(p => {
      console.log(`📦 ${p.name} (${p.unusedDeps.length} unused):`);
      p.unusedDeps.forEach(dep => console.log(`   - ${dep}`));
      console.log();
    });
  }
  console.log();

  console.log('PACKAGES WITH MISSING DEPENDENCIES');
  console.log('-'.repeat(80));
  const withMissing = RESULTS.packages.filter(p => p.missingDeps.length > 0);
  if (withMissing.length === 0) {
    console.log('✅ No missing dependencies found!');
  } else {
    console.log(`Found ${withMissing.length} packages with missing dependencies:\n`);
    withMissing.forEach(p => {
      console.log(`📦 ${p.name} (${p.missingDeps.length} missing):`);
      p.missingDeps.forEach(dep => console.log(`   - ${dep}`));
      console.log();
    });
  }
  console.log();

  console.log('VERSION MISMATCHES');
  console.log('-'.repeat(80));
  if (Object.keys(RESULTS.versionMismatches).length === 0) {
    console.log('✅ No version mismatches found!');
  } else {
    Object.entries(RESULTS.versionMismatches)
      .sort((a, b) => b[1].usageCount - a[1].usageCount)
      .forEach(([dep, data]) => {
        console.log(`📦 ${dep} (used in ${data.usageCount} packages):`);
        data.versions.forEach(version => {
          console.log(`   ${version}: ${data.packages[version].join(', ')}`);
        });
        console.log();
      });
  }
  console.log();

  console.log('DETAILED PACKAGE INVENTORY');
  console.log('-'.repeat(80));
  console.log('Package | Declared | Used | Unused | Missing | Status');
  console.log('-'.repeat(80));
  RESULTS.packages.forEach(p => {
    const status = p.cleanupNeeded ? '⚠️  NEEDS CLEANUP' : '✅ OK';
    console.log(`${p.name.padEnd(35)} | ${p.declaredDepNames.length.toString().padStart(8)} | ${p.usedDeps.length.toString().padStart(4)} | ${p.unusedDeps.length.toString().padStart(6)} | ${p.missingDeps.length.toString().padStart(7)} | ${status}`);
  });
  console.log();
}

function saveJsonReport() {
  const reportPath = path.join(__dirname, 'dependency-audit-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(RESULTS, null, 2));
  console.log(`📄 Full report saved to: ${reportPath}`);
}

function main() {
  console.log('🔍 Starting dependency audit...\n');

  const packages = getPackageDirs();
  console.log(`Found ${packages.length} packages\n`);

  for (const pkgName of packages) {
    process.stdout.write(`Analyzing ${pkgName}...`);
    const analysis = analyzePackage(pkgName);
    if (analysis) {
      RESULTS.packages.push(analysis);
      trackSharedDeps(analysis);
      process.stdout.write(` ✓\n`);
    } else {
      process.stdout.write(` ✗ (skipped)\n`);
    }
  }

  console.log('\n🔍 Identifying version mismatches...');
  identifyVersionMismatches();

  console.log('📊 Generating summary...\n');
  generateSummary();

  printReport();
  saveJsonReport();
}

main();
