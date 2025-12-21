/**
 * Test Script: DynamicRenderer Integration Test
 *
 * This script validates that the DynamicRenderer package can be imported
 * and that its exports are correct. It does NOT test actual React rendering
 * (which would require a React runtime environment), but it validates the
 * module structure and API surface.
 */

import { ComponentRegistry, DynamicRenderer, ErrorBoundary } from './packages/@sequentialos/dynamic-react-renderer/src/index.js';

console.log('=== DynamicRenderer Integration Test ===\n');

// Test 1: Check exports exist
console.log('Test 1: Validating exports...');
const hasComponentRegistry = typeof ComponentRegistry === 'object' && ComponentRegistry !== null;
const hasDynamicRenderer = typeof DynamicRenderer === 'function';
const hasErrorBoundary = typeof ErrorBoundary === 'function';

console.log(`  - ComponentRegistry: ${hasComponentRegistry ? '✓ PASS' : '✗ FAIL'}`);
console.log(`  - DynamicRenderer: ${hasDynamicRenderer ? '✓ PASS' : '✗ FAIL'}`);
console.log(`  - ErrorBoundary: ${hasErrorBoundary ? '✓ PASS' : '✗ FAIL'}`);

// Test 2: ComponentRegistry API
console.log('\nTest 2: Validating ComponentRegistry API...');
const registryMethods = ['register', 'get', 'has', 'list', 'unregister', 'clear'];
const hasAllMethods = registryMethods.every(method => typeof ComponentRegistry[method] === 'function');
console.log(`  - All methods present: ${hasAllMethods ? '✓ PASS' : '✗ FAIL'}`);

// Test 3: ComponentRegistry functionality
console.log('\nTest 3: Testing ComponentRegistry functionality...');

// Mock component (just a function)
const MockComponent = (props) => props;

try {
  // Test registration
  ComponentRegistry.register('TestComponent', MockComponent);
  const registered = ComponentRegistry.has('TestComponent');
  console.log(`  - Component registration: ${registered ? '✓ PASS' : '✗ FAIL'}`);

  // Test retrieval
  const retrieved = ComponentRegistry.get('TestComponent');
  const correctlyRetrieved = retrieved === MockComponent;
  console.log(`  - Component retrieval: ${correctlyRetrieved ? '✓ PASS' : '✗ FAIL'}`);

  // Test list
  const list = ComponentRegistry.list();
  const inList = list.includes('TestComponent');
  console.log(`  - Component in list: ${inList ? '✓ PASS' : '✗ FAIL'}`);

  // Test size
  const size = ComponentRegistry.size;
  console.log(`  - Registry size: ${size > 0 ? '✓ PASS' : '✗ FAIL'} (size: ${size})`);

  // Test unregister
  ComponentRegistry.unregister('TestComponent');
  const stillExists = ComponentRegistry.has('TestComponent');
  console.log(`  - Component unregistration: ${!stillExists ? '✓ PASS' : '✗ FAIL'}`);

  // Test clear
  ComponentRegistry.register('TestComponent', MockComponent);
  ComponentRegistry.clear();
  const clearedSize = ComponentRegistry.size;
  console.log(`  - Registry clear: ${clearedSize === 0 ? '✓ PASS' : '✗ FAIL'}`);
} catch (error) {
  console.log(`  - ✗ FAIL: ${error.message}`);
}

// Test 4: Error handling
console.log('\nTest 4: Testing error handling...');
try {
  ComponentRegistry.register('', MockComponent);
  console.log('  - Empty name validation: ✗ FAIL (should throw error)');
} catch (error) {
  console.log('  - Empty name validation: ✓ PASS (correctly throws error)');
}

try {
  ComponentRegistry.register('Test', null);
  console.log('  - Null component validation: ✗ FAIL (should throw error)');
} catch (error) {
  console.log('  - Null component validation: ✓ PASS (correctly throws error)');
}

// Test 5: Singleton behavior
console.log('\nTest 5: Testing singleton behavior...');
import('./packages/@sequentialos/dynamic-react-renderer/src/ComponentRegistry.js')
  .then(({ default: SecondInstance }) => {
    ComponentRegistry.register('SingletonTest', MockComponent);
    const existsInSecondInstance = SecondInstance.has('SingletonTest');
    console.log(`  - Singleton pattern: ${existsInSecondInstance ? '✓ PASS' : '✗ FAIL'}`);
    ComponentRegistry.clear();

    // Summary
    console.log('\n=== Test Summary ===');
    console.log('All core functionality tests completed.');
    console.log('\nNote: Actual React rendering tests require a React runtime environment.');
    console.log('This test validates the module structure and ComponentRegistry API only.');
  })
  .catch(error => {
    console.log(`  - ✗ FAIL: ${error.message}`);
  });
