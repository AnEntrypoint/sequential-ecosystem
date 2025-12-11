import { DataResult } from './data-result.js';

/**
 * data-extractors.js
 *
 * Data extraction: paths, fields, properties
 */

function extractPath(obj, path) {
  if (!path || path === '') return obj;

  const parts = path.split('.');
  let current = obj;

  for (const part of parts) {
    if (current === null || current === undefined) return null;

    const arrayMatch = part.match(/(\w+)\[(\d+)\]/);
    if (arrayMatch) {
      const [, key, index] = arrayMatch;
      current = current[key]?.[parseInt(index)];
    } else {
      current = current[part];
    }
  }

  return current;
}

export function createDataExtractors() {
  return {
    extract(result, path) {
      if (result.isError) return result;
      return result.map(value => extractPath(value, path));
    },

    extractMultiple(result, paths) {
      if (result.isError) return result;
      return result.map(value => {
        const extracted = {};
        for (const path of paths) {
          extracted[path] = extractPath(value, path);
        }
        return extracted;
      });
    },

    select(result, fields) {
      if (result.isError) return result;
      return result.map(value => {
        const selected = {};
        for (const field of fields) {
          if (field in value) {
            selected[field] = value[field];
          }
        }
        return selected;
      });
    },

    reject(result, fields) {
      if (result.isError) return result;
      return result.map(value => {
        const rejected = { ...value };
        for (const field of fields) {
          delete rejected[field];
        }
        return rejected;
      });
    }
  };
}
