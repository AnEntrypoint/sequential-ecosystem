import path from 'path';
import { promises as fs } from 'fs';
import { asyncHandler } from '../middleware/error-handler.js';
import { formatResponse } from '@sequentialos/response-formatting';
import { throwNotFound } from '@sequentialos/error-handling';
import { resolveAppPath } from '@sequentialos/app-path-resolver';

export function registerAppRoutes(app, appRegistry, __dirname) {
  app.get('/api/apps', asyncHandler(async (req, res) => {
    const builtinApps = appRegistry.getManifests().map(m => ({ ...m, builtin: true }));

    const userAppsDir = path.join(process.env.ECOSYSTEM_PATH || process.env.HOME, '.sequential', 'apps');
    const userApps = [];
    try {
      await fs.mkdir(userAppsDir, { recursive: true });
      const dirs = await fs.readdir(userAppsDir);
      for (const dir of dirs) {
        const manifestPath = path.join(userAppsDir, dir, 'manifest.json');
        try {
          const content = await fs.readFile(manifestPath, 'utf-8');
          const manifest = JSON.parse(content);
          userApps.push({ ...manifest, builtin: false });
        } catch (e) {
          // Skip invalid manifests
        }
      }
    } catch (e) {
      // No user apps directory yet
    }

    res.json(formatResponse([...builtinApps, ...userApps]));
  }));

  app.use('/apps/:appId/*', (req, res, next) => {
    const { appId } = req.params;
    const appInfo = appRegistry.getApp(appId);

    let appPath;
    if (appInfo) {
      appPath = path.resolve(__dirname, `../../${appId}`);
    } else {
      appPath = path.join(process.env.ECOSYSTEM_PATH || process.env.HOME, '.sequential', 'apps', appId);
    }

    const requestedPath = path.join(appPath, req.params[0] || 'dist/index.html');
    const realPath = resolveAppPath(requestedPath, appPath);
    res.sendFile(realPath, (err) => {
      if (err) {
        if (err.code === 'ENOENT') {
          res.status(404).json({ error: 'App file not found', file: req.params[0] });
        } else if (err.code === 'EACCES') {
          res.status(403).json({ error: 'Access denied', file: req.params[0] });
        } else {
          res.status(500).json({ error: 'Failed to serve file', message: err.message });
        }
      }
    });
  });
}
