import fs from 'fs-extra';
import path from 'path';
import { randomUUID } from 'crypto';
import { createPathTraversalError } from '@sequentialos/error-handling';

function validateSecurePath(userPath, basePath) {
  try {
    const resolved = fs.realpathSync(userPath);
    const baseResolved = fs.realpathSync(basePath);
    const normalizedBase = baseResolved.endsWith(path.sep) ? baseResolved : baseResolved + path.sep;

    if (!resolved.startsWith(normalizedBase) && resolved !== baseResolved) {
      throw createPathTraversalError(userPath);
    }
    return resolved;
  } catch (err) {
    if (err.code === 'ENOENT') {
      const normalized = path.normalize(path.resolve(basePath, userPath));
      const baseResolved = fs.realpathSync(basePath);
      const normalizedBase = baseResolved.endsWith(path.sep) ? baseResolved : baseResolved + path.sep;
      if (!normalized.startsWith(normalizedBase)) {
        throw createPathTraversalError(userPath);
      }
      return normalized;
    }
    throw err;
  }
}

async function readFile(filePath, encoding = 'utf8') {
  return fs.readFile(filePath, encoding);
}

async function writeFileAtomic(filePath, data, encoding = 'utf8') {
  const dir = path.dirname(filePath);
  await fs.ensureDir(dir);

  const tempFile = path.join(dir, `.tmp-${randomUUID()}`);

  try {
    await fs.writeFile(tempFile, data, encoding);
    await fs.move(tempFile, filePath, { overwrite: true });
  } catch (err) {
    try {
      await fs.remove(tempFile);
    } catch {}
    throw err;
  }
}

async function readJson(filePath) {
  try {
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    if (err.code === 'ENOENT') return null;
    throw err;
  }
}

async function writeJson(filePath, obj) {
  const dir = path.dirname(filePath);
  await fs.ensureDir(dir);

  const data = JSON.stringify(obj, null, 2);
  const tempFile = path.join(dir, `.tmp-${randomUUID()}`);

  try {
    await fs.writeFile(tempFile, data, 'utf8');
    await fs.move(tempFile, filePath, { overwrite: true });
  } catch (err) {
    try {
      await fs.remove(tempFile);
    } catch {}
    throw err;
  }
}

async function deleteFile(filePath) {
  await fs.remove(filePath);
}

async function exists(filePath) {
  return fs.pathExists(filePath);
}

async function mkdir(dirPath) {
  return fs.ensureDir(dirPath);
}

async function list(dirPath, options = {}) {
  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });

    if (options.filesOnly) {
      return entries.filter(e => e.isFile()).map(e => e.name);
    }
    if (options.dirsOnly) {
      return entries.filter(e => e.isDirectory()).map(e => e.name);
    }

    return entries.map(e => ({
      name: e.name,
      isDirectory: e.isDirectory(),
      isFile: e.isFile()
    }));
  } catch (err) {
    if (err.code === 'ENOENT') return [];
    throw err;
  }
}

async function appendFile(filePath, data) {
  const dir = path.dirname(filePath);
  await fs.ensureDir(dir);
  return fs.appendFile(filePath, data, 'utf8');
}

async function copyFile(src, dest) {
  const dir = path.dirname(dest);
  await fs.ensureDir(dir);
  return fs.copy(src, dest);
}

async function getStats(filePath) {
  try {
    return await fs.stat(filePath);
  } catch (err) {
    if (err.code === 'ENOENT') return null;
    throw err;
  }
}

export const storage = {
  read: readFile,
  write: writeFileAtomic,
  delete: deleteFile,
  list,
  exists,
  mkdir,
  readJson,
  writeJson,
  append: appendFile,
  copy: copyFile,
  stats: getStats,
  validatePath: validateSecurePath
};

export { validateSecurePath };
