// Babel JSX transformation with caching
import * as BabelStandalone from '@babel/standalone';

const transformCache = new Map();
const MAX_CACHE_SIZE = 256;

export function babelTransform(code, maxCacheSize = MAX_CACHE_SIZE) {
  const cached = transformCache.get(code);
  if (cached) return cached;

  try {
    const transformed = BabelStandalone.transform(code, {
      presets: ['react'],
      filename: 'dynamic-component.js'
    });

    if (transformCache.size >= maxCacheSize) {
      const firstKey = transformCache.keys().next().value;
      transformCache.delete(firstKey);
    }

    transformCache.set(code, transformed.code);
    return transformed.code;
  } catch (err) {
    console.error('Babel transform error:', err);
    throw new Error(`Failed to transform JSX: ${err.message}`);
  }
}

export function clearTransformCache() {
  transformCache.clear();
}
