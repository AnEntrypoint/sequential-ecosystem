/**
 * Path Extractor
 * Extracts data from objects using dot notation paths
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

export function createPathExtractor() {
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
    }
  };
}
