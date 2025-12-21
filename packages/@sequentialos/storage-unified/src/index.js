/**
 * @sequentialos/storage-unified
 *
 * Unified file storage operations with atomic writes and path validation
 */

import { validateSecurePath } from '@sequentialos/path-validation';
import { readFile, writeFileAtomic, deleteFile, exists, appendFile, copyFile, getStats } from './fileOperations.js';
import { readJson, writeJson } from './jsonOperations.js';
import { mkdir, list } from './directoryOperations.js';

/**
 * Unified storage API
 */
export const storage = {
  read: readFile,
  write: writeFileAtomic,
  delete: deleteFile,
  list,
  exists,
  mkdir,
  readJson,
  writeJson,
  append: appendFile,
  copy: copyFile,
  stats: getStats,
  validatePath: validateSecurePath
};

// Re-export individual functions for direct imports
export { validateSecurePath };
export { readFile, writeFileAtomic, deleteFile, exists, appendFile, copyFile, getStats };
export { readJson, writeJson };
export { mkdir, list };
