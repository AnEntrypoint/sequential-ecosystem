import path from 'path';
import fs from 'fs-extra';
import { validatePath } from '@sequential/param-validation';
import logger from '@sequential/sequential-logging';
import {
  readJsonFile as readJsonFileUtil,
  readJsonFileOptional as readJsonFileOptionalUtil,
  writeFileAtomicJson,
  listFiles
} from '@sequential/file-operations';

/**
 * BaseRepository - Abstract base class for all repositories
 *
 * Eliminates duplication across TaskRepository, FlowRepository, ToolRepository, FileRepository
 * Provides common patterns for:
 * - Path validation with symlink protection
 * - Directory listing with config/metadata loading
 * - JSON file I/O with error handling
 * - Error creation with consistent status codes
 */
export class BaseRepository {
  constructor(baseDir, entityName = 'Entity') {
    this.baseDir = baseDir;
    this.entityName = entityName;
  }

  /**
   * validatePath - Prevents directory traversal attacks
   *
   * Resolves symlinks and verifies path stays within baseDir
   * Throws 403 Forbidden if path escapes baseDir
   *
   * @param {string} id - Entity identifier (directory name or file name)
   * @returns {string} - Validated, resolved path
   * @throws {Error} - 403 if path traversal detected
   */
  validatePath(id) {
    try {
      return validatePath(id, this.baseDir);
    } catch (err) {
      if (err.code === 'FORBIDDEN' || err.code === 'VALIDATION_ERROR') {
        const error = new Error(`Access to ${this.entityName.toLowerCase()} '${id}' denied`);
        error.status = err.status || 403;
        error.code = 'FORBIDDEN';
        throw error;
      }
      throw err;
    }
  }

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
        const err = new Error(`${this.entityName} ${context} not found`);
        err.status = 404;
        err.code = 'NOT_FOUND';
        throw err;
      }
      throw new Error(`Invalid ${this.entityName.toLowerCase()} ${context}: ${e.message}`);
    }
  }

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
  }

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
      const err = new Error(`Failed to write ${this.entityName.toLowerCase()}: ${e.message}`);
      err.status = 500;
      err.code = 'WRITE_ERROR';
      throw err;
    }
  }

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

  /**
   * getAll - List all entities in baseDir with config metadata
   *
   * Scans baseDir for directories, loads config.json from each
   * Merges config data into entity object
   * Gracefully skips directories without config.json
   *
   * @returns {array} - Array of entities with metadata
   */
  async getAll() {
    if (!await fs.pathExists(this.baseDir)) {
      return [];
    }

    try {
      const entries = await fs.readdir(this.baseDir, { withFileTypes: true });
      const dirs = entries.filter(e => e.isDirectory()).map(e => e.name);

      const results = [];
      for (const name of dirs) {
        let result = { name, id: name };
        const configPath = path.join(this.baseDir, name, 'config.json');
        const configData = await this.readJsonFileOptional(configPath);
        if (configData) {
          result = { ...result, ...configData };
        }
        results.push(result);
      }
      return results;
    } catch (err) {
      if (process.env.DEBUG) {
        logger.error(`Error reading ${this.entityName.toLowerCase()} directory: ${err.message}`);
      }
      return [];
    }
  }

  /**
   * getAllFiles - List all .json files in baseDir
   *
   * Different from getAll() - reads flat .json files instead of directories
   * Used by ToolRepository and similar flat-file repositories
   *
   * @returns {array} - Array of parsed JSON objects
   */
  async getAllFiles() {
    if (!await fs.pathExists(this.baseDir)) {
      return [];
    }

    try {
      const files = await listFiles(this.baseDir, {
        extensions: '.json',
        fullPath: true
      });

      const results = [];
      for (const filePath of files) {
        try {
          const data = await readJsonFileOptionalUtil(filePath);
          if (data) {
            results.push(data);
          }
        } catch (e) {
          if (process.env.DEBUG) {
            logger.warn(`Failed to parse ${path.basename(filePath)}: ${e.message}`);
          }
        }
      }
      return results;
    } catch (err) {
      if (process.env.DEBUG) {
        logger.error(`Error reading ${this.entityName.toLowerCase()} files: ${err.message}`);
      }
      return [];
    }
  }

  /**
   * createError - Factory for consistent error objects
   *
   * @param {string} message - Error message
   * @param {number} status - HTTP status code (default: 500)
   * @param {string} code - Error code (default: 'SERVER_ERROR')
   * @returns {Error}
   */
  createError(message, status = 500, code = 'SERVER_ERROR') {
    const err = new Error(message);
    err.status = status;
    err.code = code;
    return err;
  }
}
