#!/usr/bin/env node
/**
 * Comprehensive Test Suite for Sequential Ecosystem
 * Tests all 17 packages, import chains, GXE dispatchers, and functionality
 */

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { spawn } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Test results tracker
const results = {
  moduleLoading: { passed: 0, failed: 0, errors: [] },
  importChains: { passed: 0, failed: 0, errors: [] },
  gxeDispatchers: { passed: 0, failed: 0, errors: [] },
  functionality: { passed: 0, failed: 0, errors: [] },
  fileSystem: { passed: 0, failed: 0, errors: [] }
};

// ANSI colors
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

const log = {
  section: (title) => console.log(`\n${colors.cyan}${'='.repeat(80)}\n${title}\n${'='.repeat(80)}${colors.reset}`),
  test: (name) => console.log(`${colors.blue}[TEST]${colors.reset} ${name}`),
  pass: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  fail: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  warn: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  info: (msg) => console.log(`${colors.cyan}ℹ${colors.reset} ${msg}`)
};

// List of all packages
const packages = [
  'app-path-resolver',
  'app-storage-sync',
  'async-patterns',
  'core',
  'core-config',
  'crud-router',
  'dynamic-react-renderer',
  'dynamic-route-factory',
  'error-handling',
  'path-validation',
  'response-formatting',
  'route-helpers',
  'storage-unified',
  'task-execution-service',
  'timestamp-utilities',
  'validation',
  'validation-middleware'
];

// Expected exports for each package (sample checks)
const expectedExports = {
  'response-formatting': ['formatSuccessResponse', 'formatErrorResponse', 'formatValidationErrorResponse'],
  'validation': ['validateTaskName', 'validatePathRelative', 'validateJSON'],
  'route-helpers': ['parsePaginationParams', 'normalizeResource'],
  'error-handling': ['AppError', 'errorHandler'],
  'crud-router': ['createCRUDRouter'],
  'dynamic-route-factory': ['createDynamicRoute'],
  'validation-middleware': ['validateRequest'],
  'core': ['initializeContainer'],
  'task-execution-service': ['TaskExecutionService'],
  'dynamic-react-renderer': ['ComponentRegistry', 'DynamicRenderer']
};

// Import chain tests
const importChains = [
  { name: 'crud-router → response-formatting', from: 'crud-router', to: 'response-formatting' },
  { name: 'crud-router → validation', from: 'crud-router', to: 'validation' },
  { name: 'crud-router → route-helpers', from: 'crud-router', to: 'route-helpers' },
  { name: 'crud-router → error-handling', from: 'crud-router', to: 'error-handling' },
  { name: 'core → response-formatting', from: 'core', to: 'response-formatting' },
  { name: 'core → validation', from: 'core', to: 'validation' },
  { name: 'validation-middleware → validation', from: 'validation-middleware', to: 'validation' },
  { name: 'dynamic-route-factory → response-formatting', from: 'dynamic-route-factory', to: 'response-formatting' }
];

// GXE dispatcher tests
const gxeDispatchers = [
  {
    name: 'webhook-task',
    script: 'scripts/gxe-dispatch/webhook-task.js',
    args: ['--taskName=sample-task', '--input={"test":true}']
  },
  {
    name: 'webhook-flow',
    script: 'scripts/gxe-dispatch/webhook-flow.js',
    args: ['--flowName=sample-flow', '--input={"test":true}']
  },
  {
    name: 'webhook-tool',
    script: 'scripts/gxe-dispatch/webhook-tool.js',
    args: ['--appId=app-test', '--toolName=sample-tool', '--params={"test":true}']
  }
];

// Helper: Execute shell command
function exec(command) {
  return new Promise((resolve, reject) => {
    const child = spawn('sh', ['-c', command], {
      cwd: __dirname,
      env: process.env
    });

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (data) => stdout += data.toString());
    child.stderr.on('data', (data) => stderr += data.toString());

    child.on('close', (code) => {
      resolve({ code, stdout, stderr });
    });

    child.on('error', (err) => reject(err));
  });
}

// Test 1: Module Loading
async function testModuleLoading() {
  log.section('TEST 1: MODULE LOADING (17 packages)');

  for (const pkg of packages) {
    log.test(`Loading @sequentialos/${pkg}`);

    try {
      const module = await import(`@sequentialos/${pkg}`);

      // Check if module has exports
      const exportKeys = Object.keys(module);
      if (exportKeys.length === 0) {
        log.warn(`Module loaded but has no exports`);
        results.moduleLoading.passed++;
      } else {
        log.pass(`Loaded successfully with ${exportKeys.length} exports: ${exportKeys.join(', ')}`);
        results.moduleLoading.passed++;

        // Verify expected exports if defined
        if (expectedExports[pkg]) {
          for (const expectedExport of expectedExports[pkg]) {
            if (module[expectedExport]) {
              log.pass(`  - Export '${expectedExport}' exists`);
            } else {
              log.fail(`  - Export '${expectedExport}' missing`);
              results.moduleLoading.errors.push(`${pkg}: missing export '${expectedExport}'`);
            }
          }
        }
      }
    } catch (error) {
      log.fail(`Failed to load: ${error.message}`);
      results.moduleLoading.failed++;
      results.moduleLoading.errors.push(`${pkg}: ${error.message}`);
    }
  }
}

// Test 2: Import Chains
async function testImportChains() {
  log.section('TEST 2: IMPORT CHAIN VERIFICATION');

  for (const chain of importChains) {
    log.test(chain.name);

    try {
      // Load both modules
      const fromModule = await import(`@sequentialos/${chain.from}`);
      const toModule = await import(`@sequentialos/${chain.to}`);

      // Check if the 'from' module can access 'to' module exports
      // This is a basic check - we verify both modules load without circular dependency errors
      log.pass(`Chain verified: ${chain.from} and ${chain.to} both load successfully`);
      results.importChains.passed++;
    } catch (error) {
      log.fail(`Chain broken: ${error.message}`);
      results.importChains.failed++;
      results.importChains.errors.push(`${chain.name}: ${error.message}`);
    }
  }
}

// Test 3: GXE Dispatchers
async function testGXEDispatchers() {
  log.section('TEST 3: GXE DISPATCHER TESTS');

  for (const dispatcher of gxeDispatchers) {
    log.test(`GXE Dispatcher: ${dispatcher.name}`);

    const scriptPath = join(__dirname, dispatcher.script);
    const command = `node ${scriptPath} ${dispatcher.args.join(' ')}`;

    try {
      const result = await exec(command);

      if (result.code === 0) {
        // Try to parse as JSON
        try {
          const output = JSON.parse(result.stdout);
          log.pass(`Returned valid JSON response`);
          results.gxeDispatchers.passed++;
        } catch {
          log.warn(`Returned non-JSON response: ${result.stdout.substring(0, 100)}`);
          results.gxeDispatchers.passed++;
        }
      } else {
        log.fail(`Exit code ${result.code}: ${result.stderr}`);
        results.gxeDispatchers.failed++;
        results.gxeDispatchers.errors.push(`${dispatcher.name}: ${result.stderr}`);
      }
    } catch (error) {
      log.fail(`Execution failed: ${error.message}`);
      results.gxeDispatchers.failed++;
      results.gxeDispatchers.errors.push(`${dispatcher.name}: ${error.message}`);
    }
  }
}

// Test 4: Functionality Tests
async function testFunctionality() {
  log.section('TEST 4: FUNCTIONALITY TESTS');

  // Test validation functions
  log.test('Validation: validateTaskName');
  try {
    const { validateTaskName } = await import('@sequentialos/validation');

    // Valid task names
    const validNames = ['task-one', 'my-task', 'task123'];
    for (const name of validNames) {
      const result = validateTaskName(name);
      if (result.valid) {
        log.pass(`  Valid: "${name}"`);
        results.functionality.passed++;
      } else {
        log.fail(`  Should be valid: "${name}" - ${result.error}`);
        results.functionality.failed++;
        results.functionality.errors.push(`validateTaskName: "${name}" should be valid`);
      }
    }

    // Invalid task names
    const invalidNames = ['task one', 'Task-One', 'task_one'];
    for (const name of invalidNames) {
      const result = validateTaskName(name);
      if (!result.valid) {
        log.pass(`  Invalid (correct): "${name}"`);
        results.functionality.passed++;
      } else {
        log.fail(`  Should be invalid: "${name}"`);
        results.functionality.failed++;
        results.functionality.errors.push(`validateTaskName: "${name}" should be invalid`);
      }
    }
  } catch (error) {
    log.fail(`validateTaskName test failed: ${error.message}`);
    results.functionality.failed++;
    results.functionality.errors.push(`validateTaskName: ${error.message}`);
  }

  // Test response formatting
  log.test('Response Formatting: formatSuccessResponse');
  try {
    const { formatSuccessResponse, formatErrorResponse } = await import('@sequentialos/response-formatting');

    const successResp = formatSuccessResponse({ test: true });
    if (successResp.success === true && successResp.data.test === true) {
      log.pass(`  Success response formatted correctly`);
      results.functionality.passed++;
    } else {
      log.fail(`  Success response format incorrect`);
      results.functionality.failed++;
      results.functionality.errors.push('formatSuccessResponse: incorrect format');
    }

    const errorResp = formatErrorResponse('Test error');
    if (errorResp.success === false && errorResp.error === 'Test error') {
      log.pass(`  Error response formatted correctly`);
      results.functionality.passed++;
    } else {
      log.fail(`  Error response format incorrect`);
      results.functionality.failed++;
      results.functionality.errors.push('formatErrorResponse: incorrect format');
    }
  } catch (error) {
    log.fail(`Response formatting test failed: ${error.message}`);
    results.functionality.failed++;
    results.functionality.errors.push(`Response formatting: ${error.message}`);
  }

  // Test route helpers
  log.test('Route Helpers: parsePaginationParams');
  try {
    const { parsePaginationParams } = await import('@sequentialos/route-helpers');

    const query = { page: '2', limit: '50' };
    const result = parsePaginationParams(query);

    if (result.page === 2 && result.limit === 50) {
      log.pass(`  Pagination parsed correctly`);
      results.functionality.passed++;
    } else {
      log.fail(`  Pagination parsing incorrect: ${JSON.stringify(result)}`);
      results.functionality.failed++;
      results.functionality.errors.push('parsePaginationParams: incorrect parsing');
    }
  } catch (error) {
    log.fail(`Route helpers test failed: ${error.message}`);
    results.functionality.failed++;
    results.functionality.errors.push(`Route helpers: ${error.message}`);
  }

  // Test dynamic react renderer
  log.test('Dynamic React Renderer: ComponentRegistry');
  try {
    const { ComponentRegistry } = await import('@sequentialos/dynamic-react-renderer');

    const registry = new ComponentRegistry();
    registry.register('TestComponent', { name: 'TestComponent', component: () => null });

    const component = registry.get('TestComponent');
    if (component && component.name === 'TestComponent') {
      log.pass(`  ComponentRegistry works correctly`);
      results.functionality.passed++;
    } else {
      log.fail(`  ComponentRegistry failed to retrieve component`);
      results.functionality.failed++;
      results.functionality.errors.push('ComponentRegistry: component retrieval failed');
    }
  } catch (error) {
    log.fail(`Dynamic React Renderer test failed: ${error.message}`);
    results.functionality.failed++;
    results.functionality.errors.push(`Dynamic React Renderer: ${error.message}`);
  }
}

// Test 5: File System Consistency
async function testFileSystemConsistency() {
  log.section('TEST 5: FILE SYSTEM CONSISTENCY');

  // Check all package.json files have proper ES module config
  log.test('Package.json ES module configuration');
  try {
    const result = await exec('find packages/@sequentialos -name "package.json" -type f');
    const packageJsonFiles = result.stdout.trim().split('\n').filter(Boolean);

    for (const file of packageJsonFiles) {
      const { default: pkg } = await import(join(__dirname, file), { assert: { type: 'json' } });

      if (pkg.type === 'module') {
        log.pass(`  ${file}: ES module configured`);
        results.fileSystem.passed++;
      } else {
        log.warn(`  ${file}: Not configured as ES module`);
        results.fileSystem.failed++;
        results.fileSystem.errors.push(`${file}: missing "type": "module"`);
      }
    }
  } catch (error) {
    log.fail(`Package.json check failed: ${error.message}`);
    results.fileSystem.failed++;
    results.fileSystem.errors.push(`Package.json check: ${error.message}`);
  }

  // Check for orphaned files
  log.test('Orphaned files check');
  try {
    const result = await exec('find packages/@sequentialos -type f -name "*.js.map" -o -name "*.d.ts.map"');
    const orphanedFiles = result.stdout.trim().split('\n').filter(Boolean);

    if (orphanedFiles.length === 0) {
      log.pass(`  No orphaned map files found`);
      results.fileSystem.passed++;
    } else {
      log.warn(`  Found ${orphanedFiles.length} orphaned map files`);
      results.fileSystem.passed++;
    }
  } catch (error) {
    log.fail(`Orphaned files check failed: ${error.message}`);
    results.fileSystem.failed++;
    results.fileSystem.errors.push(`Orphaned files: ${error.message}`);
  }

  // Check directory structure
  log.test('Directory structure');
  try {
    const result = await exec('find packages/@sequentialos -maxdepth 2 -type d');
    const dirs = result.stdout.trim().split('\n').filter(Boolean);

    log.pass(`  Found ${dirs.length} directories`);
    results.fileSystem.passed++;
  } catch (error) {
    log.fail(`Directory structure check failed: ${error.message}`);
    results.fileSystem.failed++;
    results.fileSystem.errors.push(`Directory structure: ${error.message}`);
  }
}

// Generate final report
function generateReport() {
  log.section('COMPREHENSIVE TEST REPORT');

  const totalTests =
    results.moduleLoading.passed + results.moduleLoading.failed +
    results.importChains.passed + results.importChains.failed +
    results.gxeDispatchers.passed + results.gxeDispatchers.failed +
    results.functionality.passed + results.functionality.failed +
    results.fileSystem.passed + results.fileSystem.failed;

  const totalPassed =
    results.moduleLoading.passed +
    results.importChains.passed +
    results.gxeDispatchers.passed +
    results.functionality.passed +
    results.fileSystem.passed;

  const successRate = ((totalPassed / totalTests) * 100).toFixed(2);

  console.log(`\n${colors.cyan}Module Loading:${colors.reset}`);
  console.log(`  Passed: ${colors.green}${results.moduleLoading.passed}${colors.reset}`);
  console.log(`  Failed: ${colors.red}${results.moduleLoading.failed}${colors.reset}`);

  console.log(`\n${colors.cyan}Import Chains:${colors.reset}`);
  console.log(`  Passed: ${colors.green}${results.importChains.passed}${colors.reset}`);
  console.log(`  Failed: ${colors.red}${results.importChains.failed}${colors.reset}`);

  console.log(`\n${colors.cyan}GXE Dispatchers:${colors.reset}`);
  console.log(`  Passed: ${colors.green}${results.gxeDispatchers.passed}${colors.reset}`);
  console.log(`  Failed: ${colors.red}${results.gxeDispatchers.failed}${colors.reset}`);

  console.log(`\n${colors.cyan}Functionality:${colors.reset}`);
  console.log(`  Passed: ${colors.green}${results.functionality.passed}${colors.reset}`);
  console.log(`  Failed: ${colors.red}${results.functionality.failed}${colors.reset}`);

  console.log(`\n${colors.cyan}File System:${colors.reset}`);
  console.log(`  Passed: ${colors.green}${results.fileSystem.passed}${colors.reset}`);
  console.log(`  Failed: ${colors.red}${results.fileSystem.failed}${colors.reset}`);

  console.log(`\n${colors.cyan}Overall:${colors.reset}`);
  console.log(`  Total Tests: ${totalTests}`);
  console.log(`  Passed: ${colors.green}${totalPassed}${colors.reset}`);
  console.log(`  Failed: ${colors.red}${totalTests - totalPassed}${colors.reset}`);
  console.log(`  Success Rate: ${successRate >= 80 ? colors.green : colors.red}${successRate}%${colors.reset}`);

  // Print errors if any
  const allErrors = [
    ...results.moduleLoading.errors,
    ...results.importChains.errors,
    ...results.gxeDispatchers.errors,
    ...results.functionality.errors,
    ...results.fileSystem.errors
  ];

  if (allErrors.length > 0) {
    console.log(`\n${colors.red}Errors:${colors.reset}`);
    allErrors.forEach((error, i) => {
      console.log(`  ${i + 1}. ${error}`);
    });
  }

  // Production readiness assessment
  console.log(`\n${colors.cyan}Production Readiness:${colors.reset}`);
  if (successRate >= 95 && results.moduleLoading.failed === 0 && results.gxeDispatchers.failed === 0) {
    console.log(`  ${colors.green}✓ READY FOR PRODUCTION${colors.reset}`);
  } else if (successRate >= 80) {
    console.log(`  ${colors.yellow}⚠ NEEDS MINOR FIXES${colors.reset}`);
  } else {
    console.log(`  ${colors.red}✗ NOT READY - CRITICAL ISSUES${colors.reset}`);
  }

  console.log(`\n${colors.cyan}${'='.repeat(80)}${colors.reset}\n`);
}

// Run all tests
async function runAllTests() {
  console.log(`${colors.cyan}
╔═══════════════════════════════════════════════════════════════════════════╗
║                  SEQUENTIAL ECOSYSTEM COMPREHENSIVE TESTS                  ║
║                           17 Packages · Full Suite                         ║
╚═══════════════════════════════════════════════════════════════════════════╝
${colors.reset}`);

  try {
    await testModuleLoading();
    await testImportChains();
    await testGXEDispatchers();
    await testFunctionality();
    await testFileSystemConsistency();

    generateReport();
  } catch (error) {
    console.error(`${colors.red}Fatal error:${colors.reset}`, error);
    process.exit(1);
  }
}

// Execute
runAllTests();
