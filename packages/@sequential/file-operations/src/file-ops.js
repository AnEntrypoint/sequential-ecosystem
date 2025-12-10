import fs from 'fs-extra';
import path from 'path';
import { randomUUID } from 'crypto';
import logger from '@sequentialos/sequential-logging';

export async function writeFileAtomic(filePath, content) {
  const dir = path.dirname(filePath);
  await fs.ensureDir(dir);

  const tempFile = path.join(dir, `.${randomUUID()}.tmp`);

  try {
    if (typeof content === 'object') {
      await fs.writeJSON(tempFile, content, { spaces: 2 });
    } else {
      await fs.writeFile(tempFile, content, 'utf8');
    }

    await fs.rename(tempFile, filePath);
  } catch (error) {
    try {
      await fs.remove(tempFile);
    } catch (e) {
      logger.error(`Failed to remove temp file ${tempFile}:`, e.message);
    }
    throw error;
  }
}

export async function writeFileAtomicString(filePath, content) {
  const dir = path.dirname(filePath);
  await fs.ensureDir(dir);

  const tempFile = path.join(dir, `.${randomUUID()}.tmp`);

  try {
    await fs.writeFile(tempFile, content, 'utf8');
    await fs.rename(tempFile, filePath);
  } catch (error) {
    try {
      await fs.remove(tempFile);
    } catch (e) {
      logger.error(`Failed to remove temp file ${tempFile}:`, e.message);
    }
    throw error;
  }
}

export async function writeFileAtomicJson(filePath, content) {
  const dir = path.dirname(filePath);
  await fs.ensureDir(dir);

  const tempFile = path.join(dir, `.${randomUUID()}.tmp`);

  try {
    await fs.writeJSON(tempFile, content, { spaces: 2 });
    await fs.rename(tempFile, filePath);
  } catch (error) {
    try {
      await fs.remove(tempFile);
    } catch (e) {
      logger.error(`Failed to remove temp file ${tempFile}:`, e.message);
    }
    throw error;
  }
}

export async function readJsonFile(filePath, options = {}) {
  try {
    const content = await fs.readFile(filePath, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    if (error.code === 'ENOENT' && options.default !== undefined) {
      return options.default;
    }
    throw error;
  }
}

export async function readJsonFileOptional(filePath) {
  try {
    const content = await fs.readFile(filePath, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    if (error.code === 'ENOENT') return null;
    throw error;
  }
}

export async function readJsonFiles(dirPath, filter = null) {
  const files = await fs.readdir(dirPath);
  const jsonFiles = files.filter(f => f.endsWith('.json'));
  const filtered = filter ? jsonFiles.filter(filter) : jsonFiles;

  const results = [];
  for (const file of filtered) {
    try {
      const content = await readJsonFile(path.join(dirPath, file));
      results.push({ file, content });
    } catch (error) {
      results.push({ file, error: error.message });
    }
  }
  return results;
}

export async function listFiles(dirPath, options = {}) {
  const { extensions = null, recursive = false, fullPath = false, sort = false } = options;

  let files = await fs.readdir(dirPath);

  if (extensions) {
    const exts = Array.isArray(extensions) ? extensions : [extensions];
    files = files.filter(f => exts.some(ext => f.endsWith(ext)));
  }

  if (sort) {
    files = files.sort();
  }

  if (fullPath) {
    files = files.map(f => path.join(dirPath, f));
  }

  if (recursive) {
    const allFiles = [];
    for (const file of files) {
      const filePath = fullPath ? file : path.join(dirPath, file);
      const stat = await fs.stat(filePath);
      if (stat.isDirectory()) {
        const subFiles = await listFiles(filePath, { ...options, fullPath: true });
        allFiles.push(...subFiles);
      } else {
        allFiles.push(filePath);
      }
    }
    return allFiles;
  }

  return files;
}

export async function ensureDirectory(dirPath) {
  await fs.ensureDir(dirPath);
  return dirPath;
}

export async function moveFile(sourcePath, destPath) {
  const destDir = path.dirname(destPath);
  await fs.ensureDir(destDir);
  await fs.move(sourcePath, destPath, { overwrite: false });
  return destPath;
}

export async function copyFile(sourcePath, destPath) {
  const destDir = path.dirname(destPath);
  await fs.ensureDir(destDir);
  await fs.copy(sourcePath, destPath, { overwrite: false });
  return destPath;
}

export async function deleteFile(filePath) {
  await fs.remove(filePath);
}
