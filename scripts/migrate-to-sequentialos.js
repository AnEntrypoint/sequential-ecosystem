#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PACKAGES_DIR = path.resolve(__dirname, '../packages');
const SEQUENTIALOS_DIR = path.join(PACKAGES_DIR, '@sequentialos');

function log(msg) {
  console.log(`[migrate] ${msg}`);
}

function logSuccess(msg) {
  console.log(`✓ ${msg}`);
}

function logError(msg) {
  console.error(`✗ ${msg}`);
}

// Create @sequentialos directory if it doesn't exist
if (!fs.existsSync(SEQUENTIALOS_DIR)) {
  fs.mkdirSync(SEQUENTIALOS_DIR, { recursive: true });
  logSuccess(`Created @sequentialos directory`);
}

// Find all unscoped and @sequential packages
function findPackagesToMigrate() {
  const unscoped = [];
  const sequential = [];

  // Check unscoped directories
  fs.readdirSync(PACKAGES_DIR).forEach(name => {
    if (name.startsWith('@') || name === 'node_modules') return;

    const pkgPath = path.join(PACKAGES_DIR, name, 'package.json');
    if (!fs.existsSync(pkgPath)) return;

    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
    if (pkg.name && pkg.name.startsWith('@sequentialos/')) {
      unscoped.push({ dir: name, name: pkg.name });
    }
  });

  // Check @sequential directories
  const sequentialDir = path.join(PACKAGES_DIR, '@sequential');
  if (fs.existsSync(sequentialDir)) {
    fs.readdirSync(sequentialDir).forEach(name => {
      const pkgPath = path.join(sequentialDir, name, 'package.json');
      if (!fs.existsSync(pkgPath)) return;

      const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
      if (pkg.name && pkg.name.startsWith('@sequentialos/')) {
        sequential.push({ dir: name, oldScope: '@sequential', name: pkg.name });
      }
    });
  }

  return { unscoped, sequential };
}

// Move unscoped packages to @sequentialos
function migrateUnscoped(packages) {
  log(`Migrating ${packages.length} unscoped packages to @sequentialos...`);

  packages.forEach(({ dir, name }) => {
    const src = path.join(PACKAGES_DIR, dir);
    const dest = path.join(SEQUENTIALOS_DIR, dir);

    if (fs.existsSync(dest)) {
      logError(`Destination exists: ${dest}`);
      return;
    }

    fs.renameSync(src, dest);
    logSuccess(`Moved ${dir} → @sequentialos/${dir}`);
  });
}

// Migrate @sequential packages
function migrateSequential(packages) {
  log(`Migrating ${packages.length} @sequential packages to @sequentialos...`);

  packages.forEach(({ dir, name }) => {
    const src = path.join(PACKAGES_DIR, '@sequential', dir);
    const dest = path.join(SEQUENTIALOS_DIR, dir);

    if (fs.existsSync(dest)) {
      logError(`Destination exists: ${dest}`);
      return;
    }

    fs.renameSync(src, dest);
    logSuccess(`Moved ${dir} → @sequentialos/${dir}`);
  });

  // Remove @sequential directory if empty
  const sequentialDir = path.join(PACKAGES_DIR, '@sequential');
  if (fs.existsSync(sequentialDir) && fs.readdirSync(sequentialDir).length === 0) {
    fs.rmdirSync(sequentialDir);
    logSuccess(`Removed empty @sequential directory`);
  }
}

// Update all imports and file references
function updateImports() {
  log(`Updating all imports from @sequential to @sequentialos...`);

  const files = [];
  function walkDir(dir, ext = ['.js', '.ts', '.json', '.mjs', '.cjs']) {
    try {
      fs.readdirSync(dir).forEach(name => {
        if (['node_modules', '.git', 'dist', 'build', '.next'].includes(name)) return;

        const fullPath = path.join(dir, name);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
          walkDir(fullPath, ext);
        } else if (ext.some(e => name.endsWith(e))) {
          files.push(fullPath);
        }
      });
    } catch (e) {
      // Skip permission errors
    }
  }

  walkDir(PACKAGES_DIR);

  let updated = 0;
  files.forEach(file => {
    try {
      let content = fs.readFileSync(file, 'utf8');
      const original = content;

      // Update imports
      content = content.replace(
        /from\s+['"]@sequential\//g,
        'from \'@sequentialos/'
      );
      content = content.replace(
        /require\(['"]@sequential\//g,
        'require(\'@sequentialos/'
      );
      content = content.replace(
        /import\s+.*from\s+['"]@sequential\//g,
        (match) => match.replace('@sequential/', '@sequentialos/')
      );

      // Update file: references in package.json
      if (file.endsWith('package.json')) {
        content = content.replace(
          /"file:.*?@sequential\//g,
          '"file:../../@sequentialos/'
        );
        content = content.replace(
          /"file:.*?\/packages\/@sequential\//g,
          '"file:../../@sequentialos/'
        );
      }

      if (content !== original) {
        fs.writeFileSync(file, content, 'utf8');
        updated++;
      }
    } catch (e) {
      // Skip files that can't be read/written
    }
  });

  logSuccess(`Updated ${updated} files with new import paths`);
}

// Update root package.json workspaces
function updateWorkspaces() {
  log(`Updating workspaces configuration...`);

  const rootPkg = path.join(path.dirname(PACKAGES_DIR), 'package.json');
  const pkg = JSON.parse(fs.readFileSync(rootPkg, 'utf8'));

  if (pkg.workspaces) {
    pkg.workspaces = [
      'packages/@sequentialos/*'
    ];
    fs.writeFileSync(rootPkg, JSON.stringify(pkg, null, 2) + '\n', 'utf8');
    logSuccess(`Updated root package.json workspaces`);
  }
}

// Main migration flow
async function migrate() {
  try {
    log(`Starting package migration to @sequentialos scope...`);

    const { unscoped, sequential } = findPackagesToMigrate();

    log(`Found ${unscoped.length} unscoped + ${sequential.length} @sequential packages`);

    migrateUnscoped(unscoped);
    migrateSequential(sequential);
    updateImports();
    updateWorkspaces();

    logSuccess(`Migration complete! Total packages moved: ${unscoped.length + sequential.length}`);
    logSuccess(`Run 'npm install' to reinstall dependencies`);

  } catch (error) {
    logError(`Migration failed: ${error.message}`);
    process.exit(1);
  }
}

migrate();
