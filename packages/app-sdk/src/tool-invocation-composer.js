import { createToolComposerCache } from './tool-composer-cache.js';
import { createToolComposerSearch } from './tool-composer-search.js';
import { createToolComposerGenerator } from './tool-composer-generator.js';

export function createToolInvocationComposer() {
  const cache = createToolComposerCache();
  const search = createToolComposerSearch(cache);
  const generator = createToolComposerGenerator(search);

  return {
    cacheTools: cache.cacheTools.bind(cache),
    find: search.find.bind(search),
    preview: search.preview.bind(search),
    generateExamples: generator.generateExamples.bind(generator),
    getCommonErrors: generator.getCommonErrors.bind(generator),
    compose: generator.compose.bind(generator),
    validate: generator.validate.bind(generator),
    getCacheStats: cache.getCacheStats.bind(cache),
    clearCache: cache.clearCache.bind(cache)
  };
}
