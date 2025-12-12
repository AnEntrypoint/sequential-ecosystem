/**
 * file-transform-handlers.js - File transform operation handlers
 *
 * Handles file rename and copy operations
 */

import path from 'path';
import fs from 'fs-extra';
import { createTimer } from '@sequentialos/server-utilities';
import { validate, validatePath } from '@sequentialos/validation';
import { validateFileName } from '@sequentialos/core';
import { formatResponse } from '@sequentialos/response-formatting';
import { handleFileError, broadcastFileEvent } from './file-operations-handlers.js';

export function createTransformHandlers(logger) {
  return {
    rename: async (req, res) => {
      const { path: filePath, newName } = req.body;
      const timer = createTimer();
      validate().required('filePath', filePath).required('newName', newName).execute();
      try {
        validateFileName(newName);
        const realPath = validatePath(filePath);
        const dir = path.dirname(realPath);
        const newPath = path.join(dir, newName);
        validatePath(newPath);
        await fs.rename(realPath, newPath);
        const newRelativePath = filePath.substring(0, filePath.lastIndexOf('/') + 1) + newName;
        logger.fileSuccess('rename', filePath, timer.elapsed(), { newName });
        broadcastFileEvent('file-renamed', filePath, { newPath: newRelativePath });
        res.json(formatResponse({ oldPath: realPath, newPath: newPath, success: true }));
      } catch (error) {
        handleFileError('rename', filePath, error, res);
      }
    },

    copy: async (req, res) => {
      const { path: filePath, newPath: destPath } = req.body;
      const timer = createTimer();
      validate().required('filePath', filePath).required('destPath', destPath).type('filePath', filePath, 'string').type('destPath', destPath, 'string').execute();
      try {
        const realPath = validatePath(filePath);
        const realDest = validatePath(destPath);
        await fs.ensureDir(path.dirname(realDest));
        await fs.copy(realPath, realDest);
        logger.fileSuccess('copy', filePath, timer.elapsed(), { destination: destPath });
        broadcastFileEvent('file-copied', filePath, { destPath: destPath });
        res.json(formatResponse({ sourcePath: realPath, destPath: realDest, success: true }));
      } catch (error) {
        handleFileError('copy', filePath, error, res);
      }
    }
  };
}
