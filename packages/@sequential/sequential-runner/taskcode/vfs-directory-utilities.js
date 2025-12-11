import fs from 'fs';
import path from 'path';

/**
 * Recursively copy directory
 */
export async function copyDirectory(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const entries = await fs.promises.readdir(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      await copyDirectory(srcPath, destPath);
    } else {
      await fs.promises.copyFile(srcPath, destPath);
    }
  }
}

/**
 * Calculate total size of directory recursively
 */
export function getDirectorySize(dirPath) {
  if (!fs.existsSync(dirPath)) return 0;

  let size = 0;
  const items = fs.readdirSync(dirPath, { withFileTypes: true });

  for (const item of items) {
    const itemPath = path.join(dirPath, item.name);
    if (item.isDirectory()) {
      size += getDirectorySize(itemPath);
    } else {
      const stat = fs.statSync(itemPath);
      size += stat.size;
    }
  }

  return size;
}

/**
 * Build VFS tree structure with scope information
 */
export function buildVFSTree(scopes) {
  const tree = {};

  for (const [scopeName, scopePath] of Object.entries(scopes)) {
    tree[scopeName] = {
      path: scopePath,
      exists: fs.existsSync(scopePath),
      size: getDirectorySize(scopePath)
    };
  }

  return tree;
}

/**
 * Export VFS to external location
 */
export async function exportToPath(scopes, exportBasePath, taskId) {
  const exportPath = path.join(exportBasePath, 'tasks', taskId);

  if (!fs.existsSync(exportPath)) {
    fs.mkdirSync(exportPath, { recursive: true });
  }

  for (const [scopeName, scopePath] of Object.entries(scopes)) {
    const targetPath = path.join(exportPath, scopeName);

    if (fs.existsSync(scopePath)) {
      await copyDirectory(scopePath, targetPath);
    }
  }

  return exportPath;
}
