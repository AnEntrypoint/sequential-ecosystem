/**
 * read-operations.js - File read and stat operations
 *
 * Read file content and retrieve file statistics
 */

import fs from 'fs';
import { nowISO } from '@sequentialos/timestamp-utilities';

export async function readFileContent(fullPath, options = {}) {
  const encoding = options.encoding || 'utf8';
  const content = await fs.promises.readFile(fullPath, encoding);
  const stat = await fs.promises.stat(fullPath);

  return {
    content,
    size: stat.size,
    modified: stat.mtime,
    timestamp: nowISO(),
    stat
  };
}

export function fileExists(fullPath) {
  return fs.existsSync(fullPath);
}

export async function getFileStat(filepath, fullPath) {
  if (!fs.existsSync(fullPath)) {
    throw new Error(`File not found: ${filepath}`);
  }

  const stat = await fs.promises.stat(fullPath);

  return {
    path: filepath,
    size: stat.size,
    modified: stat.mtime,
    created: stat.birthtime,
    accessed: stat.atime,
    isDirectory: stat.isDirectory(),
    isFile: stat.isFile(),
    timestamp: nowISO(),
    stat
  };
}
