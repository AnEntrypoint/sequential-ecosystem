/**
 * Basic file operations
 */

import fs from 'fs-extra';
import path from 'path';
import { randomUUID } from 'crypto';

/**
 * Read a file
 *
 * @param {string} filePath - Path to file
 * @param {string} encoding - File encoding (default: utf8)
 * @returns {Promise<string>} File contents
 */
export async function readFile(filePath, encoding = 'utf8') {
  return fs.readFile(filePath, encoding);
}

/**
 * Write file atomically (prevents partial writes)
 *
 * @param {string} filePath - Path to file
 * @param {string} data - Data to write
 * @param {string} encoding - File encoding (default: utf8)
 */
export async function writeFileAtomic(filePath, data, encoding = 'utf8') {
  const dir = path.dirname(filePath);
  await fs.ensureDir(dir);

  const tempFile = path.join(dir, `.tmp-${randomUUID()}`);

  try {
    await fs.writeFile(tempFile, data, encoding);
    await fs.move(tempFile, filePath, { overwrite: true });
  } catch (err) {
    try {
      await fs.remove(tempFile);
    } catch {}
    throw err;
  }
}

/**
 * Delete a file or directory
 *
 * @param {string} filePath - Path to delete
 */
export async function deleteFile(filePath) {
  await fs.remove(filePath);
}

/**
 * Check if a file or directory exists
 *
 * @param {string} filePath - Path to check
 * @returns {Promise<boolean>} True if exists
 */
export async function exists(filePath) {
  return fs.pathExists(filePath);
}

/**
 * Append data to a file
 *
 * @param {string} filePath - Path to file
 * @param {string} data - Data to append
 */
export async function appendFile(filePath, data) {
  const dir = path.dirname(filePath);
  await fs.ensureDir(dir);
  return fs.appendFile(filePath, data, 'utf8');
}

/**
 * Copy a file or directory
 *
 * @param {string} src - Source path
 * @param {string} dest - Destination path
 */
export async function copyFile(src, dest) {
  const dir = path.dirname(dest);
  await fs.ensureDir(dir);
  return fs.copy(src, dest);
}

/**
 * Get file or directory stats
 *
 * @param {string} filePath - Path to check
 * @returns {Promise<Object|null>} Stats object or null if not found
 */
export async function getStats(filePath) {
  try {
    return await fs.stat(filePath);
  } catch (err) {
    if (err.code === 'ENOENT') return null;
    throw err;
  }
}
