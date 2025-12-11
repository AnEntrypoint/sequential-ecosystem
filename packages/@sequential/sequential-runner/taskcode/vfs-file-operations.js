import fs from 'fs';
import path from 'path';
import { nowISO } from '@sequentialos/timestamp-utilities';

/**
 * Write file with optional append and JSON serialization
 */
export async function writeFile(filepath, content, fullPath, options = {}) {
  const dir = path.dirname(fullPath);

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const encoding = options.encoding || 'utf8';

  if (typeof content === 'object' && !Buffer.isBuffer(content)) {
    content = JSON.stringify(content, null, 2);
  }

  if (options.append && fs.existsSync(fullPath)) {
    const existing = await fs.promises.readFile(fullPath, encoding);
    content = existing + content;
  }

  await fs.promises.writeFile(fullPath, content, encoding);
  const stat = await fs.promises.stat(fullPath);

  return {
    path: filepath,
    size: stat.size,
    timestamp: nowISO(),
    stat
  };
}

/**
 * Read file with scope fallback support (for 'auto' scope)
 */
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

/**
 * Delete file or directory
 */
export async function deleteFile(filepath, fullPath) {
  const stat = await fs.promises.stat(fullPath);

  if (stat.isDirectory()) {
    await fs.promises.rm(fullPath, { recursive: true, force: true });
  } else {
    await fs.promises.unlink(fullPath);
  }

  return {
    path: filepath,
    timestamp: nowISO()
  };
}

/**
 * Check if file/directory exists
 */
export function fileExists(fullPath) {
  return fs.existsSync(fullPath);
}

/**
 * Get file/directory statistics
 */
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

/**
 * Create directory
 */
export async function createDirectory(dirpath, fullPath) {
  await fs.promises.mkdir(fullPath, { recursive: true });

  return {
    path: dirpath,
    timestamp: nowISO()
  };
}

/**
 * List directory contents with file/directory separation
 */
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

/**
 * Watch file for changes
 */
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
