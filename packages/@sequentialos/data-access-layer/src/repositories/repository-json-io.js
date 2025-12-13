import logger from '@sequentialos/sequential-logging';
import {
  readJsonFile as readJsonFileUtil,
  readJsonFileOptional as readJsonFileOptionalUtil,
  writeFileAtomicJson
} from '@sequentialos/file-operations';

/**
 * repository-json-io.js
 *
 * JSON file I/O operations with consistent error handling
 */

export function createJsonIO(entityName = 'Entity') {
  return {
    /**
     * readJsonFile - Safely read and parse JSON files
     *
     * @param {string} filePath - Full path to JSON file
     * @param {string} context - Error context for logging (e.g., "config", "graph")
     * @returns {object} - Parsed JSON object
     * @throws {Error} - 404 if file doesn't exist, or parse error
     */
    async readJsonFile(filePath, context = 'file') {
      try {
        return await readJsonFileUtil(filePath);
      } catch (e) {
        if (e.code === 'ENOENT') {
          const err = new Error(`${entityName} ${context} not found`);
          err.status = 404;
          err.code = 'NOT_FOUND';
          throw err;
        }
        throw new Error(`Invalid ${entityName.toLowerCase()} ${context}: ${e.message}`);
      }
    },

    /**
     * readJsonFileOptional - Safely read JSON file if it exists
     *
     * Returns null if file doesn't exist (no error)
     * Useful for optional config files
     *
     * @param {string} filePath - Full path to JSON file
     * @returns {object|null} - Parsed JSON or null
     */
    async readJsonFileOptional(filePath) {
      try {
        return await readJsonFileOptionalUtil(filePath);
      } catch (e) {
        if (process.env.DEBUG) {
          logger.warn(`Failed to parse ${filePath}: ${e.message}`);
        }
        return null;
      }
    },

    /**
     * writeJsonFile - Safely write JSON files with atomic operation
     *
     * Uses atomic write (temp file + rename) for crash safety
     * Ensures parent directory exists before writing
     *
     * @param {string} filePath - Full path to JSON file
     * @param {object} data - Object to serialize
     * @throws {Error} - Write error
     */
    async writeJsonFile(filePath, data) {
      try {
        await writeFileAtomicJson(filePath, data);
      } catch (e) {
        const err = new Error(`Failed to write ${entityName.toLowerCase()}: ${e.message}`);
        err.status = 500;
        err.code = 'WRITE_ERROR';
        throw err;
      }
    },

    /**
     * writeJsonFileAsync - Alias for writeJsonFile (now always async)
     *
     * @param {string} filePath - Full path to JSON file
     * @param {object} data - Object to serialize
     * @throws {Error} - Write error
     */
    async writeJsonFileAsync(filePath, data) {
      return this.writeJsonFile(filePath, data);
    }
  };
}
