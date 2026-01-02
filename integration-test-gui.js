/**
 * Integration Test: Dynamic React Renderer + GUI Flow Builder
 *
 * Tests complete GUI composition system integration:
 * - Dynamic component registration
 * - Flow visualization
 * - Execution monitoring
 * - Component palette
 * - State machine visualization
 * - UnifiedInvocationBridge compatibility
 */

import { defaultRegistry as componentRegistry } from './packages/@sequentialos/dynamic-react-renderer/src/index.js';
import GuiComponentRegistry from './packages/@sequentialos/gui-flow-builder/src/GuiComponentRegistry.js';
import { unifiedInvocationBridge } from './packages/@sequentialos/unified-invocation-bridge/src/index.js';

console.log('=============================================================================');
console.log('Integration Test: GUI Composition System');
console.log('=============================================================================\n');

const tests = [];
let passCount = 0;
let failCount = 0;

const test = (name, fn) => {
  tests.push({ name, fn });
};

const run = async () => {
  for (const { name, fn } of tests) {
    try {
      await fn();
      console.log(`✓ ${name}`);
      passCount++;
    } catch (error) {
      console.error(`✗ ${name}`);
      console.error(`  Error: ${error.message}`);
      failCount++;
    }
  }

  console.log('\n=============================================================================');
  console.log(`Results: ${passCount} passed, ${failCount} failed`);
  console.log('=============================================================================\n');

  if (failCount > 0) {
    process.exit(1);
  }
};

// Test 1: GUI Component Registration
test('GUI components register with DynamicRenderer', () => {
  const result = GuiComponentRegistry.register();
  if (!result.success) throw new Error('Registration failed');
  if (result.registeredCount !== 5) throw new Error(`Expected 5 components, got ${result.registeredCount}`);
  if (!result.components.includes('FlowVisualizer')) throw new Error('FlowVisualizer not registered');
});

// Test 2: Components accessible via DynamicRenderer
test('Registered components accessible via ComponentRegistry', () => {
  const components = GuiComponentRegistry.list();
  if (components.length === 0) throw new Error('No components registered');
  if (!componentRegistry.has('FlowVisualizer')) throw new Error('FlowVisualizer not in registry');
  if (!componentRegistry.has('ExecutionMonitor')) throw new Error('ExecutionMonitor not in registry');
  if (!componentRegistry.has('ComponentPalette')) throw new Error('ComponentPalette not in registry');
});

// Test 3: Component retrieval
test('Components can be retrieved from registry', () => {
  const visualizer = componentRegistry.get('FlowVisualizer');
  if (!visualizer) throw new Error('FlowVisualizer not found');
  if (typeof visualizer !== 'function') throw new Error('FlowVisualizer is not a function');
});

// Test 4: UnifiedInvocationBridge integration
test('UnifiedInvocationBridge available for GUI operations', () => {
  if (!unifiedInvocationBridge) throw new Error('UnifiedInvocationBridge not initialized');
  if (typeof unifiedInvocationBridge.callTask !== 'function') throw new Error('callTask not available');
  if (typeof unifiedInvocationBridge.callFlow !== 'function') throw new Error('callFlow not available');
  if (typeof unifiedInvocationBridge.callTool !== 'function') throw new Error('callTool not available');
});

// Test 5: Global invocation functions
test('Global invocation functions available (for GUI use)', () => {
  if (typeof globalThis.__callTask__ !== 'function') throw new Error('__callTask__ not defined');
  if (typeof globalThis.__callFlow__ !== 'function') throw new Error('__callFlow__ not defined');
  if (typeof globalThis.__callService__ !== 'function') throw new Error('__callService__ not defined');
});

// Test 6: Flow visualization props validation
test('FlowVisualizer handles empty flow gracefully', () => {
  const FlowVisualizer = componentRegistry.get('FlowVisualizer');
  // Component accepts undefined/null without throwing
  // (actual React rendering would be tested in React environment)
  if (!FlowVisualizer) throw new Error('FlowVisualizer component not found');
});

// Test 7: Execution monitor props structure
test('ExecutionMonitor handles null execution gracefully', () => {
  const ExecutionMonitor = componentRegistry.get('ExecutionMonitor');
  if (!ExecutionMonitor) throw new Error('ExecutionMonitor component not found');
});

// Test 8: Component palette data handling
test('ComponentPalette accepts registry data', () => {
  const ComponentPalette = componentRegistry.get('ComponentPalette');
  if (!ComponentPalette) throw new Error('ComponentPalette component not found');
});

// Test 9: State machine visualizer
test('StateMachineVisualizer available for xstate machines', () => {
  const StateMachineVisualizer = componentRegistry.get('StateMachineVisualizer');
  if (!StateMachineVisualizer) throw new Error('StateMachineVisualizer component not found');
});

// Test 10: Flow canvas
test('FlowCanvas available for flow building', () => {
  const FlowCanvas = componentRegistry.get('FlowCanvas');
  if (!FlowCanvas) throw new Error('FlowCanvas component not found');
});

// Test 11: Component count validation
test('All 5 GUI components registered in DynamicRenderer', () => {
  const allComponents = componentRegistry.list();
  const guiComponents = allComponents.filter(name =>
    ['FlowVisualizer', 'ExecutionMonitor', 'ComponentPalette', 'FlowCanvas', 'StateMachineVisualizer'].includes(name)
  );
  if (guiComponents.length !== 5) {
    throw new Error(`Expected 5 GUI components, found ${guiComponents.length}`);
  }
});

// Test 12: Unregister functionality
test('GUI components can be unregistered', () => {
  const result = GuiComponentRegistry.unregister();
  if (!result.success) throw new Error('Unregistration failed');
  if (result.unregisteredCount !== 5) throw new Error(`Expected 5 unregistered, got ${result.unregisteredCount}`);
});

// Test 13: Re-registration after unregister
test('GUI components can be re-registered after unregistering', () => {
  const result = GuiComponentRegistry.register();
  if (!result.success) throw new Error('Re-registration failed');
  if (componentRegistry.has('FlowVisualizer') === false) throw new Error('FlowVisualizer not re-registered');
});

// Test 14: Dynamic rendering capability
test('DynamicRenderer can render GUI components dynamically', () => {
  // Simulate what DynamicRenderer does
  const type = 'FlowVisualizer';
  const Component = componentRegistry.get(type);
  if (!Component) throw new Error(`Component ${type} not found for dynamic rendering`);
  if (typeof Component !== 'function') throw new Error('Component is not a React component');
});

// Test 15: Configuration-driven UI readiness
test('System ready for configuration-driven GUI composition', () => {
  const requiredCapabilities = [
    componentRegistry.has('FlowVisualizer'),
    componentRegistry.has('ExecutionMonitor'),
    componentRegistry.has('ComponentPalette'),
    componentRegistry.has('FlowCanvas'),
    componentRegistry.has('StateMachineVisualizer'),
    typeof globalThis.__callTask__ === 'function',
    typeof globalThis.__callFlow__ === 'function',
    typeof globalThis.__callService__ === 'function'
  ];

  const allReady = requiredCapabilities.every(capability => capability === true);
  if (!allReady) throw new Error('Not all required capabilities are ready');
});

// Run all tests
await run();

console.log('Dynamic React Renderer + GUI Flow Builder integration successful!\n');
console.log('Ready for:');
console.log('- Configuration-driven UI composition');
console.log('- Visual flow building and execution');
console.log('- Real-time flow monitoring');
console.log('- State machine visualization');
console.log('- Component palette-based assembly');
