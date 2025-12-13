/**
 * file-read-handlers.js - File read operation handlers
 *
 * Handles file read, directory listing, current path
 */

import path from 'path';
import fs from 'fs-extra';
import { createTimer } from '@sequentialos/server-utilities';
import { validatePath } from '@sequentialos/validation';
import { formatResponse, formatError } from '@sequentialos/response-formatting';
import { handleFileError } from './file-operations-handlers.js';

export function createReadHandlers(logger) {
  return {
    getCurrentPath: (req, res) => {
      res.json(formatResponse({ path: process.cwd() }));
    },

    listFiles: async (req, res) => {
      const dir = req.query.dir || process.cwd();
      const realPath = validatePath(dir);
      const files = await fs.readdir(realPath, { withFileTypes: true });
      const items = await Promise.all(files.map(async (file) => {
        const filePath = path.join(realPath, file.name);
        const stat = await fs.stat(filePath);
        return {
          name: file.name,
          type: file.isDirectory() ? 'dir' : 'file',
          size: stat.size,
          modified: stat.mtime,
          isDirectory: file.isDirectory()
        };
      }));
      res.json(formatResponse({ directory: realPath, files: items.sort((a, b) => a.name.localeCompare(b.name)) }));
    },

    readFile: async (req, res) => {
      const filePath = req.query.path;
      const timer = createTimer();
      try {
        const realPath = validatePath(filePath);
        const stat = await fs.stat(realPath);
        if (stat.isDirectory()) {
          return res.status(400).json(formatError(400, { code: 'INVALID_OPERATION', message: 'Cannot read directory' }));
        }
        if (stat.size > 52428800) { // 50MB default
          const error = new Error('File too large (max 50MB)');
          error.code = 'FILE_TOO_LARGE';
          return res.status(400).json(formatError(400, { code: error.code, message: error.message }));
        }
        const content = await fs.readFile(realPath, 'utf8');
        logger.fileSuccess('read', filePath, timer.elapsed(), { size: stat.size });
        res.json(formatResponse({ path: realPath, size: stat.size, content, modified: stat.mtime }));
      } catch (error) {
        handleFileError('read', filePath, error, res);
      }
    }
  };
}
