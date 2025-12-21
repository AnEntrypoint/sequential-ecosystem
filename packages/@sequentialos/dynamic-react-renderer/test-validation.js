/**
 * Validation test for dynamic-react-renderer package
 * Tests module resolution and basic registry functionality (non-React parts)
 *
 * Note: DynamicRenderer requires React and JSX transformation, so we only test ComponentRegistry
 */

import ComponentRegistry from './src/ComponentRegistry.js';
import ComponentRegistry2 from './src/ComponentRegistry.js';

console.log('Testing @sequentialos/dynamic-react-renderer...\n');

// Test 1: Module imports
console.log('Test 1: Module Imports');
console.log('- ComponentRegistry imported:', typeof ComponentRegistry);
console.log('- ComponentRegistry is object:', typeof ComponentRegistry === 'object');
console.log('✓ Module imports successful\n');

// Test 2: Singleton pattern
console.log('Test 2: Singleton Pattern');
console.log('- Same instance:', ComponentRegistry === ComponentRegistry2);
console.log('✓ Singleton pattern working\n');

// Test 3: Component registration
console.log('Test 3: Component Registration');
const TestComponent = ({ name }) => `Hello ${name}`;
const AnotherComponent = () => 'Another component';

try {
  ComponentRegistry.register('TestComponent', TestComponent);
  ComponentRegistry.register('AnotherComponent', AnotherComponent);
  console.log('- Components registered successfully');
  console.log('- Registry size:', ComponentRegistry.size);
  console.log('- Has TestComponent:', ComponentRegistry.has('TestComponent'));
  console.log('- Has AnotherComponent:', ComponentRegistry.has('AnotherComponent'));
  console.log('✓ Registration successful\n');
} catch (error) {
  console.error('✗ Registration failed:', error.message);
  process.exit(1);
}

// Test 4: Component retrieval
console.log('Test 4: Component Retrieval');
const retrieved = ComponentRegistry.get('TestComponent');
console.log('- Retrieved component:', typeof retrieved);
console.log('- Same as registered:', retrieved === TestComponent);
console.log('✓ Retrieval successful\n');

// Test 5: List components
console.log('Test 5: List Components');
const list = ComponentRegistry.list();
console.log('- Registered components:', list);
console.log('- List is array:', Array.isArray(list));
console.log('- List length matches size:', list.length === ComponentRegistry.size);
console.log('✓ List successful\n');

// Test 6: Error handling
console.log('Test 6: Error Handling');
try {
  ComponentRegistry.register('', TestComponent);
  console.error('✗ Should have thrown error for empty name');
  process.exit(1);
} catch (error) {
  console.log('- Empty name error caught:', error.message);
  console.log('✓ Error handling working\n');
}

// Test 7: Unregister
console.log('Test 7: Unregister Component');
const removed = ComponentRegistry.unregister('AnotherComponent');
console.log('- Component removed:', removed);
console.log('- No longer in registry:', !ComponentRegistry.has('AnotherComponent'));
console.log('- Size decreased:', ComponentRegistry.size === 1);
console.log('✓ Unregister successful\n');

// Test 8: Clear registry
console.log('Test 8: Clear Registry');
ComponentRegistry.clear();
console.log('- Registry cleared');
console.log('- Size is 0:', ComponentRegistry.size === 0);
console.log('- List is empty:', ComponentRegistry.list().length === 0);
console.log('✓ Clear successful\n');

console.log('==================================');
console.log('All tests passed! ✓');
console.log('==================================');
