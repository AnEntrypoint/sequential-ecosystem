export function detectInitializationPattern(module) {
  if (!module) return null;

  const factoryNames = ['createClient', 'create', 'init', 'initialize', 'setup'];
  for (const name of factoryNames) {
    if (typeof module[name] === 'function') {
      return {
        type: 'factory',
        factory: name,
        isAsync: isAsyncFunction(module[name]),
        confidence: 0.95
      };
    }
  }

  if (module.default) {
    if (typeof module.default === 'function') {
      if (isClass(module.default)) {
        return {
          type: 'constructor',
          factory: 'default',
          isAsync: false,
          confidence: 0.9
        };
      }
      if (isAsyncFunction(module.default)) {
        return {
          type: 'factory',
          factory: 'default',
          isAsync: true,
          confidence: 0.85
        };
      }
      return {
        type: 'function',
        factory: 'default',
        isAsync: false,
        confidence: 0.8
      };
    } else {
      return {
        type: 'instance',
        factory: 'default',
        isAsync: false,
        confidence: 0.95
      };
    }
  }

  const entries = Object.entries(module);
  for (const [name, value] of entries) {
    if (typeof value === 'function' && /^[A-Z]/.test(name) && !name.includes('Error')) {
      return {
        type: 'constructor',
        factory: name,
        isAsync: false,
        confidence: 0.85
      };
    }
  }

  return {
    type: 'instance',
    factory: null,
    isAsync: false,
    confidence: 0.3
  };
}

function isAsyncFunction(fn) {
  return fn && fn.constructor.name === 'AsyncFunction';
}

function isClass(fn) {
  const str = fn.toString();
  return /^class\s/.test(str) || /^class\s+\w+/.test(str);
}
