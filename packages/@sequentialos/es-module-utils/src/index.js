/**
 * ES Module Utilities
 *
 * Provides utilities for ES modules to replace CommonJS __dirname and __filename.
 * Compatible with Node.js 18+ which includes URL API support.
 */

import { fileURLToPath } from 'url';
import path from 'path';

/**
 * Get directory name from import.meta.url
 *
 * Replaces CommonJS __dirname for ES modules.
 *
 * @param {string} importMetaUrl - The import.meta.url from the calling module
 * @returns {string} Directory path of the module
 *
 * @example
 * import { getDirname } from '@sequentialos/es-module-utils';
 * const __dirname = getDirname(import.meta.url);
 */
export function getDirname(importMetaUrl) {
  const __filename = fileURLToPath(importMetaUrl);
  return path.dirname(__filename);
}

/**
 * Get filename from import.meta.url
 *
 * Replaces CommonJS __filename for ES modules.
 *
 * @param {string} importMetaUrl - The import.meta.url from the calling module
 * @returns {string} File path of the module
 *
 * @example
 * import { getFilename } from '@sequentialos/es-module-utils';
 * const __filename = getFilename(import.meta.url);
 */
export function getFilename(importMetaUrl) {
  return fileURLToPath(importMetaUrl);
}

/**
 * Get both dirname and filename from import.meta.url
 *
 * Convenience function that returns both values.
 *
 * @param {string} importMetaUrl - The import.meta.url from the calling module
 * @returns {Object} Object with __dirname and __filename properties
 *
 * @example
 * import { getModulePaths } from '@sequentialos/es-module-utils';
 * const { __dirname, __filename } = getModulePaths(import.meta.url);
 */
export function getModulePaths(importMetaUrl) {
  const __filename = fileURLToPath(importMetaUrl);
  const __dirname = path.dirname(__filename);
  return { __dirname, __filename };
}
