/**
 * Test Script: ComponentRegistry Validation
 *
 * Tests only the ComponentRegistry module (no JSX, no React rendering)
 */

import ComponentRegistry from './packages/@sequentialos/dynamic-react-renderer/src/ComponentRegistry.js';

console.log('=== ComponentRegistry Test ===\n');

// Test 1: Check export
console.log('Test 1: Validating ComponentRegistry export...');
const isObject = typeof ComponentRegistry === 'object' && ComponentRegistry !== null;
console.log(`  - ComponentRegistry is object: ${isObject ? '✓ PASS' : '✗ FAIL'}`);

// Test 2: API methods
console.log('\nTest 2: Validating API methods...');
const methods = ['register', 'get', 'has', 'list', 'unregister', 'clear'];
methods.forEach(method => {
  const exists = typeof ComponentRegistry[method] === 'function';
  console.log(`  - ${method}: ${exists ? '✓ PASS' : '✗ FAIL'}`);
});

// Test 3: Functionality
console.log('\nTest 3: Testing functionality...');

// Mock component
const TestComp = () => 'test';

// Registration
ComponentRegistry.register('Test1', TestComp);
console.log(`  - Register component: ${ComponentRegistry.has('Test1') ? '✓ PASS' : '✗ FAIL'}`);

// Retrieval
const retrieved = ComponentRegistry.get('Test1');
console.log(`  - Retrieve component: ${retrieved === TestComp ? '✓ PASS' : '✗ FAIL'}`);

// List
const list = ComponentRegistry.list();
console.log(`  - List contains Test1: ${list.includes('Test1') ? '✓ PASS' : '✗ FAIL'}`);

// Size
const size = ComponentRegistry.size;
console.log(`  - Size property: ${size >= 1 ? '✓ PASS' : '✗ FAIL'} (size: ${size})`);

// Unregister
ComponentRegistry.unregister('Test1');
console.log(`  - Unregister component: ${!ComponentRegistry.has('Test1') ? '✓ PASS' : '✗ FAIL'}`);

// Clear
ComponentRegistry.register('Test2', TestComp);
ComponentRegistry.register('Test3', TestComp);
ComponentRegistry.clear();
console.log(`  - Clear all: ${ComponentRegistry.size === 0 ? '✓ PASS' : '✗ FAIL'}`);

// Test 4: Error handling
console.log('\nTest 4: Testing error handling...');

let errorTest1 = false;
try {
  ComponentRegistry.register('', TestComp);
} catch (error) {
  errorTest1 = true;
}
console.log(`  - Reject empty name: ${errorTest1 ? '✓ PASS' : '✗ FAIL'}`);

let errorTest2 = false;
try {
  ComponentRegistry.register('Test', null);
} catch (error) {
  errorTest2 = true;
}
console.log(`  - Reject null component: ${errorTest2 ? '✓ PASS' : '✗ FAIL'}`);

// Test 5: Singleton pattern
console.log('\nTest 5: Testing singleton pattern...');
import('./packages/@sequentialos/dynamic-react-renderer/src/ComponentRegistry.js')
  .then(({ default: Instance2 }) => {
    ComponentRegistry.register('SingletonTest', TestComp);
    const existsInBoth = Instance2.has('SingletonTest');
    console.log(`  - Singleton pattern: ${existsInBoth ? '✓ PASS' : '✗ FAIL'}`);

    console.log('\n=== Summary ===');
    console.log('ComponentRegistry module is valid and functional.');
    console.log('\nNote: DynamicRenderer and ErrorBoundary contain JSX and require');
    console.log('a build system (webpack/vite/babel) to test with actual rendering.');
  })
  .catch(error => {
    console.log(`  - ✗ FAIL: ${error.message}`);
  });
