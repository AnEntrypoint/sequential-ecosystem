/**
 * preview-path-utils.js - Path extraction and manipulation utilities
 *
 * Handle nested object path operations
 */

export class PathExtractor {
  extractAllPaths(obj, prefix = '') {
    const paths = [];

    if (!obj || typeof obj !== 'object') return paths;

    Object.keys(obj).forEach(key => {
      const fullPath = prefix ? `${prefix}.${key}` : key;
      paths.push(fullPath);

      if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
        paths.push(...this.extractAllPaths(obj[key], fullPath));
      }
    });

    return paths;
  }
}

export class PathAccessor {
  setNestedValue(obj, path, value) {
    const keys = path.split('.');
    let current = obj;

    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      if (!(key in current)) {
        current[key] = {};
      }
      current = current[key];
    }

    current[keys[keys.length - 1]] = value;
  }

  getNestedValue(obj, path) {
    const keys = path.split('.');
    let current = obj;

    for (const key of keys) {
      if (current == null) return undefined;
      current = current[key];
    }

    return current;
  }
}
