import { detectEnvironment } from './env.js';
import { detectInitializationPattern, resolveConfig, validateConfig } from './auto-detect.js';

async function dynamicRequire(moduleName) {
  if (typeof require === 'undefined') {
    const moduleImport = await import('node:module');
    const require = moduleImport.createRequire(import.meta.url);
    return require(moduleName);
  }
  return require(moduleName);
}

function isClass(fn) {
  const str = fn.toString();
  return /^class\s/.test(str) || /^class\s+\w+/.test(str);
}

export async function initializeModule(config) {
  const moduleName = config.module;

  if (!moduleName) {
    return {};
  }

  let loadedModule;
  const env = detectEnvironment();

  if (env === 'node') {
    loadedModule = await dynamicRequire(moduleName);
  } else if (env === 'deno') {
    loadedModule = await import(moduleName);
  } else {
    throw new Error('Unsupported runtime environment');
  }

  const resolvedConfig = await resolveConfig(config, loadedModule);

  const validation = validateConfig(resolvedConfig, loadedModule);
  if (!validation.valid) {
    throw new Error(`Configuration invalid: ${validation.errors.join(', ')}`);
  }

  const pattern = detectInitializationPattern(loadedModule);

  if (resolvedConfig.factory && typeof loadedModule[resolvedConfig.factory] === 'function') {
    const args = resolvedConfig.args || [];
    if (pattern.isAsync) {
      return await loadedModule[resolvedConfig.factory](...args);
    } else {
      return loadedModule[resolvedConfig.factory](...args);
    }
  }

  if (resolvedConfig.factory === 'default') {
    if (typeof loadedModule.default === 'function') {
      if (pattern.isClass) {
        return new loadedModule.default(resolvedConfig.options || {});
      } else if (pattern.isAsync) {
        return await loadedModule.default(resolvedConfig.options || {});
      } else {
        return loadedModule.default(resolvedConfig.options || {});
      }
    }
    return loadedModule.default;
  }

  if (pattern.factory) {
    const fn = loadedModule[pattern.factory];
    const args = resolvedConfig.args || [];
    if (pattern.isAsync) {
      return await fn(...args);
    } else {
      return fn(...args);
    }
  }

  if (typeof loadedModule.default === 'function') {
    if (isClass(loadedModule.default)) {
      return new loadedModule.default(resolvedConfig.options || {});
    } else {
      return await loadedModule.default(resolvedConfig.options || {});
    }
  }

  return loadedModule;
}
