/**
 * directory-operations.js - Directory creation, listing, and watching
 *
 * Create, list, and watch directory operations
 */

import fs from 'fs';
import path from 'path';
import { nowISO } from '@sequentialos/timestamp-utilities';

export async function createDirectory(dirpath, fullPath) {
  await fs.promises.mkdir(fullPath, { recursive: true });

  return {
    path: dirpath,
    timestamp: nowISO()
  };
}

export async function listDirectory(dirpath, fullPath) {
  if (!fs.existsSync(fullPath)) {
    return {
      path: dirpath,
      files: [],
      directories: [],
      total: 0
    };
  }

  const entries = await fs.promises.readdir(fullPath, { withFileTypes: true });
  const files = [];
  const directories = [];

  for (const entry of entries) {
    const entryPath = path.join(dirpath, entry.name);
    const entryFullPath = path.join(fullPath, entry.name);
    const stat = await fs.promises.stat(entryFullPath);

    const item = {
      name: entry.name,
      path: entryPath,
      size: stat.size,
      modified: stat.mtime,
      created: stat.birthtime,
      extension: path.extname(entry.name)
    };

    if (entry.isDirectory()) {
      directories.push(item);
    } else {
      files.push(item);
    }
  }

  return {
    path: dirpath,
    files,
    directories,
    total: files.length + directories.length
  };
}

export function watchFile(filepath, fullPath, callback) {
  if (!fs.existsSync(fullPath)) {
    throw new Error(`Cannot watch non-existent path: ${filepath}`);
  }

  const watcher = fs.watch(fullPath, { recursive: false }, (eventType, filename) => {
    const event = {
      event: eventType,
      filename,
      path: filepath,
      timestamp: nowISO()
    };
    callback(event);
  });

  return {
    close: () => {
      watcher.close();
    }
  };
}
