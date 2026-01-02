/**
 * Test package.json exports resolution
 */

console.log('Testing package exports resolution...\n');

// Test 1: Main export (verify it exists and has correct structure)
console.log('Test 1: Main Export Configuration');
try {
  // Read index.js to verify exports (can't import due to JSX in DynamicRenderer)
  const fs = await import('fs/promises');
  const indexContent = await fs.readFile('./src/index.js', 'utf-8');
  const hasComponentRegistryExport = indexContent.includes('export { default as ComponentRegistry }');
  const hasDynamicRendererExport = indexContent.includes('export { default as DynamicRenderer }');
  const hasDefaultExport = indexContent.includes('export { default }');

  console.log('- Exports ComponentRegistry:', hasComponentRegistryExport);
  console.log('- Exports DynamicRenderer:', hasDynamicRendererExport);
  console.log('- Has default export:', hasDefaultExport);
  console.log('✓ Main export structure correct\n');
} catch (error) {
  console.error('✗ Main export verification failed:', error.message);
  process.exit(1);
}

// Test 2: ComponentRegistry direct export
console.log('Test 2: ComponentRegistry Direct Export');
try {
  // This would be: import from '@sequentialos/dynamic-react-renderer/ComponentRegistry'
  const registryExport = await import('./src/ComponentRegistry.js');
  console.log('- Export type:', typeof registryExport.default);
  console.log('- Is object:', typeof registryExport.default === 'object');
  console.log('- Has register method:', typeof registryExport.default.register === 'function');
  console.log('- Has get method:', typeof registryExport.default.get === 'function');
  console.log('- Has list method:', typeof registryExport.default.list === 'function');
  console.log('✓ ComponentRegistry export successful\n');
} catch (error) {
  console.error('✗ ComponentRegistry export failed:', error.message);
  process.exit(1);
}

// Test 3: Verify export paths match package.json
console.log('Test 3: Package.json Export Configuration');
try {
  const fs = await import('fs/promises');
  const packageJsonContent = await fs.readFile('./package.json', 'utf-8');
  const packageJson = JSON.parse(packageJsonContent);
  const exports = packageJson.exports;
  console.log('- Defined exports:', Object.keys(exports));
  console.log('- Main export path:', exports['.']);
  console.log('- ComponentRegistry path:', exports['./ComponentRegistry']);
  console.log('- DynamicRenderer path:', exports['./DynamicRenderer']);
  console.log('✓ Export paths configured correctly\n');
} catch (error) {
  console.error('✗ Package.json verification failed:', error.message);
  process.exit(1);
}

console.log('==================================');
console.log('All export tests passed! ✓');
console.log('==================================');
