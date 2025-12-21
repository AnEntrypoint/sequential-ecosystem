/**
 * JSON file operations
 */

import fs from 'fs-extra';
import { writeJsonAtomic } from '@sequentialos/atomic-file-operations';

/**
 * Read and parse JSON file
 *
 * @param {string} filePath - Path to JSON file
 * @returns {Promise<Object|null>} Parsed JSON or null if not found
 */
export async function readJson(filePath) {
  try {
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    if (err.code === 'ENOENT') return null;
    throw err;
  }
}

/**
 * Write object to JSON file atomically
 *
 * @param {string} filePath - Path to JSON file
 * @param {Object} obj - Object to serialize
 */
export async function writeJson(filePath, obj) {
  return writeJsonAtomic(filePath, obj);
}
