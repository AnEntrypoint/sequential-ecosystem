/**
 * JSON file operations
 */

import fs from 'fs-extra';
import path from 'path';
import { randomUUID } from 'crypto';

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
  const dir = path.dirname(filePath);
  await fs.ensureDir(dir);

  const data = JSON.stringify(obj, null, 2);
  const tempFile = path.join(dir, `.tmp-${randomUUID()}`);

  try {
    await fs.writeFile(tempFile, data, 'utf8');
    await fs.move(tempFile, filePath, { overwrite: true });
  } catch (err) {
    try {
      await fs.remove(tempFile);
    } catch {}
    throw err;
  }
}
