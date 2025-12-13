/**
 * file-write-handlers.js - File write operation handlers
 *
 * Handles file save, write, mkdir, delete operations
 */

import path from 'path';
import fs from 'fs-extra';
import { createTimer } from '@sequentialos/server-utilities';
import { writeFileAtomicString } from '@sequentialos/file-operations';
import { validate, validatePath } from '@sequentialos/validation';
import { formatResponse } from '@sequentialos/response-formatting';
import { handleFileError, broadcastFileEvent } from './file-operations-handlers.js';

export function createWriteHandlers(logger) {
  return {
    saveFile: async (req, res) => {
      const { path: filePath, content } = req.body;
      const timer = createTimer();
      validate().required('path', filePath).required('content', content).type('content', content, 'string').execute();
      try {
        const realPath = validatePath(filePath);
        await writeFileAtomicString(realPath, content);
        logger.fileSuccess('save', filePath, timer.elapsed(), { size: content.length });
        res.json(formatResponse({ path: realPath, success: true }));
      } catch (error) {
        handleFileError('save', filePath, error, res);
      }
    },

    writeFile: async (req, res) => {
      const { path: filePath, content } = req.body;
      const timer = createTimer();
      validate().required('filePath', filePath).required('content', content).type('content', content, 'string').execute();
      try {
        const realPath = validatePath(filePath);
        const isNew = !(await fs.pathExists(realPath));
        await fs.ensureDir(path.dirname(realPath));
        await writeFileAtomicString(realPath, content);
        logger.fileSuccess('write', filePath, timer.elapsed(), { size: content.length, isNew });
        broadcastFileEvent(isNew ? 'file-created' : 'file-modified', filePath);
        res.json(formatResponse({ path: realPath, size: content.length, success: true }));
      } catch (error) {
        handleFileError('write', filePath, error, res);
      }
    },

    mkdir: async (req, res) => {
      const { path: dirPath } = req.body;
      const timer = createTimer();
      validate().required('dirPath', dirPath).type('dirPath', dirPath, 'string').execute();
      try {
        const realPath = validatePath(dirPath);
        await fs.ensureDir(realPath);
        logger.fileSuccess('mkdir', dirPath, timer.elapsed());
        broadcastFileEvent('directory-created', dirPath);
        res.json(formatResponse({ path: realPath, success: true }));
      } catch (error) {
        handleFileError('mkdir', dirPath, error, res);
      }
    },

    delete: async (req, res) => {
      const filePath = req.query.path || req.body?.path;
      const timer = createTimer();
      validate().required('filePath', filePath).type('filePath', filePath, 'string').execute();
      try {
        const realPath = validatePath(filePath);
        await fs.remove(realPath);
        logger.fileSuccess('delete', filePath, timer.elapsed());
        broadcastFileEvent('file-deleted', filePath);
        res.json(formatResponse({ path: realPath, success: true }));
      } catch (error) {
        handleFileError('delete', filePath, error, res);
      }
    }
  };
}
