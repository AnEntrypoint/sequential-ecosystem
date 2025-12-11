/**
 * write-operations.js - File write and delete operations
 *
 * Write, append, and delete file/directory operations
 */

import fs from 'fs';
import path from 'path';
import { nowISO } from '@sequentialos/timestamp-utilities';

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
