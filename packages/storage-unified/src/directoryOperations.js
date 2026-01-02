/**
 * Directory operations
 */

import fs from 'fs-extra';

/**
 * Create a directory (including parent directories)
 *
 * @param {string} dirPath - Path to directory
 */
export async function mkdir(dirPath) {
  return fs.ensureDir(dirPath);
}

/**
 * List directory contents
 *
 * @param {string} dirPath - Path to directory
 * @param {Object} options - List options
 * @param {boolean} options.filesOnly - Return only files
 * @param {boolean} options.dirsOnly - Return only directories
 * @returns {Promise<Array>} Directory entries
 */
export async function list(dirPath, options = {}) {
  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });

    if (options.filesOnly) {
      return entries.filter(e => e.isFile()).map(e => e.name);
    }
    if (options.dirsOnly) {
      return entries.filter(e => e.isDirectory()).map(e => e.name);
    }

    return entries.map(e => ({
      name: e.name,
      isDirectory: e.isDirectory(),
      isFile: e.isFile()
    }));
  } catch (err) {
    if (err.code === 'ENOENT') return [];
    throw err;
  }
}
