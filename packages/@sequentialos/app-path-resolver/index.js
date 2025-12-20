import path from 'path';
import fs from 'fs';
import { throwPathTraversal } from '@sequentialos/error-handling';

export function resolveAppPath(requestedPath, appPath) {
  let realPath;
  try {
    realPath = fs.realpathSync(requestedPath);
  } catch (err) {
    if (err.code === 'ENOENT') {
      const parentDir = path.dirname(requestedPath);
      try {
        const realParent = fs.realpathSync(parentDir);
        realPath = path.join(realParent, path.basename(requestedPath));
      } catch (parentErr) {
        realPath = requestedPath;
      }
    } else {
      throwPathTraversal(requestedPath);
    }
  }

  const realAppPath = fs.realpathSync(appPath);
  if (!realPath.startsWith(realAppPath + path.sep) && realPath !== realAppPath) {
    throwPathTraversal(realPath);
  }

  return realPath;
}

export function createAppPathMiddleware(appsBaseDir) {
  return (req, res, next) => {
    const appId = req.params.appId;
    const appPath = path.resolve(appsBaseDir, appId);
    const requestedPath = path.join(appPath, req.params[0] || 'dist/index.html');

    try {
      req.resolvedPath = resolveAppPath(requestedPath, appPath);
      next();
    } catch (err) {
      res.status(err.status || 403).json({ error: err.message });
    }
  };
}
