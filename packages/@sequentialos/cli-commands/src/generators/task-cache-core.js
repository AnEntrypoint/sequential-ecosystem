import { createTaskCacheManager } from './task-cache-manager.js';
import { defaultKeyGenerator, createCachePolicies } from './task-cache-policies.js';
import { generateCachedTaskTemplate } from './task-cache-templates.js';
import { validateCacheConfig } from './task-cache-validation.js';

export function createTaskCache(options = {}) {
  const keyGen = options.keyGenerator || defaultKeyGenerator;
  return createTaskCacheManager(options, keyGen);
}

export { createCachePolicies, defaultKeyGenerator };
export { generateCachedTaskTemplate };
export { validateCacheConfig };
