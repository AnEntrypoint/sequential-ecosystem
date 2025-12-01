import path from 'path';
import fs from 'fs-extra';

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
    const fullPath = path.join(this.baseDir, id);
    const baseReal = fs.realpathSync(path.resolve(this.baseDir));

    let realPath;
    try {
      realPath = fs.realpathSync(path.resolve(fullPath));
    } catch (err) {
      if (err.code === 'ENOENT') {
        const parentDir = path.dirname(fullPath);
        try {
          const realParent = fs.realpathSync(path.resolve(parentDir));
          realPath = path.join(realParent, path.basename(fullPath));
        } catch (parentErr) {
          realPath = path.resolve(fullPath);
        }
      } else {
        const error = new Error(`Access to ${this.entityName.toLowerCase()} '${id}' denied`);
        error.status = 403;
        error.code = 'FORBIDDEN';
        throw error;
      }
    }

    if (!realPath.startsWith(baseReal + path.sep) && realPath !== baseReal) {
      const err = new Error(`Access to ${this.entityName.toLowerCase()} '${id}' denied`);
      err.status = 403;
      err.code = 'FORBIDDEN';
      throw err;
    }

    return fullPath;
  }

  /**
   * readJsonFile - Safely read and parse JSON files
   *
   * @param {string} filePath - Full path to JSON file
   * @param {string} context - Error context for logging (e.g., "config", "graph")
   * @returns {object} - Parsed JSON object
   * @throws {Error} - 404 if file doesn't exist, or parse error
   */
  readJsonFile(filePath, context = 'file') {
    if (!fs.existsSync(filePath)) {
      const err = new Error(`${this.entityName} ${context} not found`);
      err.status = 404;
      err.code = 'NOT_FOUND';
      throw err;
    }

    try {
      return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch (e) {
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
  readJsonFileOptional(filePath) {
    if (!fs.existsSync(filePath)) {
      return null;
    }

    try {
      return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch (e) {
      if (process.env.DEBUG) {
        console.warn(`Failed to parse ${filePath}: ${e.message}`);
      }
      return null;
    }
  }

  /**
   * writeJsonFile - Safely write JSON files
   *
   * Ensures parent directory exists before writing
   *
   * @param {string} filePath - Full path to JSON file
   * @param {object} data - Object to serialize
   * @throws {Error} - Write error
   */
  writeJsonFile(filePath, data) {
    try {
      fs.ensureDirSync(path.dirname(filePath));
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    } catch (e) {
      const err = new Error(`Failed to write ${this.entityName.toLowerCase()}: ${e.message}`);
      err.status = 500;
      err.code = 'WRITE_ERROR';
      throw err;
    }
  }

  /**
   * writeJsonFileAsync - Async version of writeJsonFile
   *
   * @param {string} filePath - Full path to JSON file
   * @param {object} data - Object to serialize
   * @throws {Error} - Write error
   */
  async writeJsonFileAsync(filePath, data) {
    try {
      await fs.ensureDir(path.dirname(filePath));
      await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
    } catch (e) {
      const err = new Error(`Failed to write ${this.entityName.toLowerCase()}: ${e.message}`);
      err.status = 500;
      err.code = 'WRITE_ERROR';
      throw err;
    }
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
  getAll() {
    if (!fs.existsSync(this.baseDir)) {
      return [];
    }

    try {
      return fs.readdirSync(this.baseDir)
        .filter(f => fs.statSync(path.join(this.baseDir, f)).isDirectory())
        .map(name => {
          let result = { name, id: name };
          const configPath = path.join(this.baseDir, name, 'config.json');
          const configData = this.readJsonFileOptional(configPath);
          if (configData) {
            result = { ...result, ...configData };
          }
          return result;
        });
    } catch (err) {
      if (process.env.DEBUG) {
        console.error(`Error reading ${this.entityName.toLowerCase()} directory: ${err.message}`);
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
  getAllFiles() {
    if (!fs.existsSync(this.baseDir)) {
      return [];
    }

    try {
      const files = fs.readdirSync(this.baseDir)
        .filter(f => f.endsWith('.json'));

      return files.map(f => {
        try {
          return JSON.parse(fs.readFileSync(path.join(this.baseDir, f), 'utf8'));
        } catch (e) {
          if (process.env.DEBUG) {
            console.warn(`Failed to parse ${f}: ${e.message}`);
          }
          return null;
        }
      }).filter(Boolean);
    } catch (err) {
      if (process.env.DEBUG) {
        console.error(`Error reading ${this.entityName.toLowerCase()} files: ${err.message}`);
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
