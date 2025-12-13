import path from 'path';
import fs from 'fs-extra';
import { validateFilePath, validateFileName } from '@sequentialos/core';

export class FileRepository {
  async listDirectory(dir = process.cwd()) {
    const realPath = validateFilePath(dir);
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

    return {
      directory: realPath,
      files: items.sort((a, b) => a.name.localeCompare(b.name))
    };
  }

  async readFile(filePath, maxSizeBytes) {
    const realPath = validateFilePath(filePath);
    const stat = await fs.stat(realPath);

    if (stat.isDirectory()) {
      const err = new Error('Cannot read directory');
      err.status = 400;
      err.code = 'INVALID_OPERATION';
      throw err;
    }

    if (maxSizeBytes && stat.size > maxSizeBytes) {
      const err = new Error(`File too large (max ${Math.round(maxSizeBytes / (1024 * 1024))}MB)`);
      err.status = 400;
      err.code = 'FILE_TOO_LARGE';
      throw err;
    }

    const content = await fs.readFile(realPath, 'utf8');
    return { path: realPath, size: stat.size, content, modified: stat.mtime };
  }

  async writeFile(filePath, content) {
    const realPath = validateFilePath(filePath);
    const isNew = !fs.existsSync(realPath);

    try {
      await fs.ensureDir(path.dirname(realPath));
      await fs.writeFile(realPath, content, 'utf8');
      return { path: realPath, size: content.length, success: true, isNew };
    } catch (err) {
      const error = new Error(`Failed to write file: ${err.message}`);
      error.status = 500;
      error.code = 'WRITE_ERROR';
      throw error;
    }
  }

  async createDirectory(dirPath) {
    const realPath = validateFilePath(dirPath);
    await fs.ensureDir(realPath);
    return { path: realPath, success: true };
  }

  async deleteFile(filePath) {
    const realPath = validateFilePath(filePath);
    await fs.remove(realPath);
    return { path: realPath, success: true };
  }

  async renameFile(filePath, newName) {
    validateFileName(newName);
    const realPath = validateFilePath(filePath);
    const dir = path.dirname(realPath);
    const newPath = path.join(dir, newName);
    validateFilePath(newPath);

    await fs.rename(realPath, newPath);
    return { oldPath: realPath, newPath, success: true };
  }

  async copyFile(sourcePath, destPath) {
    const realSource = validateFilePath(sourcePath);
    const realDest = validateFilePath(destPath);

    await fs.ensureDir(path.dirname(realDest));
    await fs.copy(realSource, realDest);

    return { sourcePath: realSource, destPath: realDest, success: true };
  }
}
