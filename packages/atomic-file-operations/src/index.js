/**
 * Atomic File Operations
 *
 * Provides atomic file write operations to prevent partial writes and race conditions.
 * Uses temp file + atomic move pattern to ensure writes are all-or-nothing.
 */

import fs from 'fs-extra';
import path from 'path';
import { randomUUID } from 'crypto';

/**
 * Write data to file atomically
 *
 * Creates a temporary file, writes data to it, then atomically moves it to the target path.
 * This ensures the file is never left in a partially written state.
 *
 * @param {string} filePath - Target file path
 * @param {string|Buffer} content - Content to write
 * @param {Object} options - Write options
 * @param {string} options.encoding - File encoding (default: 'utf8')
 * @param {number} options.mode - File mode (permissions)
 * @param {string} options.flag - File system flag
 * @returns {Promise<void>}
 *
 * @example
 * await writeAtomic('/path/to/file.txt', 'Hello World');
 * await writeAtomic('/path/to/file.bin', buffer, { encoding: null });
 */
export async function writeAtomic(filePath, content, options = {}) {
  const { encoding = 'utf8', mode, flag } = options;
  const dir = path.dirname(filePath);

  // Ensure parent directory exists
  await fs.ensureDir(dir);

  // Create temporary file in same directory
  const tempFile = path.join(dir, `.tmp-${randomUUID()}`);

  try {
    // Write to temp file
    await fs.writeFile(tempFile, content, { encoding, mode, flag });

    // Atomically move temp file to target (overwrites if exists)
    await fs.move(tempFile, filePath, { overwrite: true });
  } catch (err) {
    // Clean up temp file on error
    try {
      await fs.remove(tempFile);
    } catch {
      // Ignore cleanup errors
    }
    throw err;
  }
}

/**
 * Write JSON data to file atomically
 *
 * Serializes an object to JSON and writes it atomically.
 *
 * @param {string} filePath - Target file path
 * @param {*} data - Data to serialize as JSON
 * @param {Object} options - Write options
 * @param {string} options.encoding - File encoding (default: 'utf8')
 * @param {number} options.indent - JSON indentation spaces (default: 2)
 * @param {number} options.mode - File mode (permissions)
 * @param {string} options.flag - File system flag
 * @param {Function} options.replacer - JSON.stringify replacer function
 * @returns {Promise<void>}
 *
 * @example
 * await writeJsonAtomic('/path/to/data.json', { foo: 'bar' });
 * await writeJsonAtomic('/path/to/compact.json', data, { indent: 0 });
 */
export async function writeJsonAtomic(filePath, data, options = {}) {
  const { encoding = 'utf8', indent = 2, mode, flag, replacer } = options;

  // Serialize to JSON
  const content = JSON.stringify(data, replacer, indent);

  // Write atomically
  await writeAtomic(filePath, content, { encoding, mode, flag });
}
