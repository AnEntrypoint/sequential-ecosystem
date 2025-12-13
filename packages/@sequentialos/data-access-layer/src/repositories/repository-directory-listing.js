import path from 'path';
import fs from 'fs-extra';
import logger from '@sequentialos/sequential-logging';
import {
  readJsonFileOptional as readJsonFileOptionalUtil,
  listFiles
} from '@sequentialos/file-operations';

/**
 * repository-directory-listing.js
 *
 * Directory and file listing with metadata loading
 */

export function createDirectoryListing(entityName = 'Entity') {
  return {
    /**
     * getAll - List all entities in baseDir with config metadata
     *
     * Scans baseDir for directories, loads config.json from each
     * Merges config data into entity object
     * Gracefully skips directories without config.json
     *
     * @param {string} baseDir - Base directory path
     * @returns {array} - Array of entities with metadata
     */
    async getAll(baseDir) {
      if (!await fs.pathExists(baseDir)) {
        return [];
      }

      try {
        const entries = await fs.readdir(baseDir, { withFileTypes: true });
        const dirs = entries.filter(e => e.isDirectory()).map(e => e.name);

        const results = [];
        for (const name of dirs) {
          let result = { name, id: name };
          const configPath = path.join(baseDir, name, 'config.json');
          const configData = await readJsonFileOptionalUtil(configPath);
          if (configData) {
            result = { ...result, ...configData };
          }
          results.push(result);
        }
        return results;
      } catch (err) {
        if (process.env.DEBUG) {
          logger.error(`Error reading ${entityName.toLowerCase()} directory: ${err.message}`);
        }
        return [];
      }
    },

    /**
     * getAllFiles - List all .json files in baseDir
     *
     * Different from getAll() - reads flat .json files instead of directories
     * Used by ToolRepository and similar flat-file repositories
     *
     * @param {string} baseDir - Base directory path
     * @returns {array} - Array of parsed JSON objects
     */
    async getAllFiles(baseDir) {
      if (!await fs.pathExists(baseDir)) {
        return [];
      }

      try {
        const files = await listFiles(baseDir, {
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
          logger.error(`Error reading ${entityName.toLowerCase()} files: ${err.message}`);
        }
        return [];
      }
    }
  };
}
