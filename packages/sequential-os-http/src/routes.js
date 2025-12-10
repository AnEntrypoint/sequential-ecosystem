import path from 'path';
import fs from 'fs-extra';
import { createErrorResponse } from '@sequentialos/error-handling';
import { packageManager } from './package-manager.js';
import { nowISO, createTimestamps, updateTimestamp } from '@sequentialos/timestamp-utilities';

function asyncHandler(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}

export function registerSequentialOsRoutes(app, kit, STATEKIT_DIR) {
  app.get('/api/sequential-os/status', asyncHandler(async (req, res) => {
    const status = await kit.status();
    res.json(status);
  }));

  app.post('/api/sequential-os/run', asyncHandler(async (req, res) => {
    const { instruction } = req.body;
    if (!instruction) {
      return res.status(400).json(createErrorResponse('INVALID_INPUT', 'instruction is required'));
    }
    const result = await kit.run(instruction);
    res.json(result);
  }));

  app.post('/api/sequential-os/exec', asyncHandler(async (req, res) => {
    const { instruction } = req.body;
    if (!instruction) {
      return res.status(400).json(createErrorResponse('INVALID_INPUT', 'instruction is required'));
    }
    const result = await kit.exec(instruction);
    res.json({ output: result, success: true });
  }));

  app.get('/api/sequential-os/history', asyncHandler(async (req, res) => {
    const history = await kit.history();
    res.json(history);
  }));

  app.post('/api/sequential-os/checkout', asyncHandler(async (req, res) => {
    const { ref } = req.body;
    if (!ref) {
      return res.status(400).json(createErrorResponse('INVALID_INPUT', 'ref is required'));
    }
    await kit.checkout(ref);
    res.json({ success: true, ref });
  }));

  app.get('/api/sequential-os/tags', asyncHandler(async (req, res) => {
    const tags = kit.tags();
    res.json(tags);
  }));

  app.post('/api/sequential-os/tag', asyncHandler(async (req, res) => {
    const { name, ref } = req.body;
    if (!name) {
      return res.status(400).json(createErrorResponse('INVALID_INPUT', 'name is required'));
    }
    kit.tag(name, ref);
    res.json({ success: true, name, ref });
  }));

  app.get('/api/sequential-os/inspect/:hash', asyncHandler(async (req, res) => {
    const { hash } = req.params;
    const layerPath = path.join(STATEKIT_DIR, 'layers', hash);
    const resolvedPath = fs.realpathSync(STATEKIT_DIR);
    const resolvedLayerPath = fs.realpathSync(layerPath);
    if (!resolvedLayerPath.startsWith(resolvedPath)) {
      return res.status(403).json(createErrorResponse('PATH_TRAVERSAL', 'Access denied'));
    }
    if (!fs.existsSync(layerPath)) {
      return res.status(404).json(createErrorResponse('LAYER_NOT_FOUND', 'Layer not found'));
    }
    const files = [];
    const getAllFiles = (dir, base = '') => {
      const items = fs.readdirSync(dir);
      items.forEach(item => {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
          getAllFiles(fullPath, path.join(base, item));
        } else {
          files.push(path.join(base, item));
        }
      });
    };
    getAllFiles(layerPath);
    const stats = fs.statSync(layerPath);
    res.json({ hash, files, size: stats.size || 0 });
  }));

  app.post('/api/sequential-os/diff', asyncHandler(async (req, res) => {
    const { file, hash1, hash2 } = req.body;
    if (!file || !hash1 || !hash2) {
      return res.status(400).json(createErrorResponse('INVALID_INPUT', 'file, hash1, and hash2 are required'));
    }
    const layerPath1 = path.join(STATEKIT_DIR, 'layers', hash1, file);
    const layerPath2 = path.join(STATEKIT_DIR, 'layers', hash2, file);
    const resolvedPath = fs.realpathSync(STATEKIT_DIR);
    const resolvedLayerPath1 = fs.realpathSync(layerPath1);
    const resolvedLayerPath2 = fs.realpathSync(layerPath2);
    if (!resolvedLayerPath1.startsWith(resolvedPath) || !resolvedLayerPath2.startsWith(resolvedPath)) {
      return res.status(403).json(createErrorResponse('PATH_TRAVERSAL', 'Access denied'));
    }

    if (!fs.existsSync(layerPath1) || !fs.existsSync(layerPath2)) {
      return res.status(404).json(createErrorResponse('FILE_NOT_FOUND', 'File not found in one or both layers'));
    }

    const content1 = fs.readFileSync(layerPath1, 'utf-8');
    const content2 = fs.readFileSync(layerPath2, 'utf-8');

    res.json({
      file,
      hash1,
      hash2,
      content1,
      content2,
      identical: content1 === content2
    });
  }));

  app.post('/api/sequential-os/terminal/execute', asyncHandler(async (req, res) => {
    const { instruction, sessionId = 'default' } = req.body;
    if (!instruction) {
      return res.status(400).json(createErrorResponse('INVALID_INPUT', 'instruction is required'));
    }
    const result = await kit.run(instruction);
    res.json({
      success: true,
      output: result.output || '',
      exitCode: result.exitCode || 0,
      instruction,
      sessionId,
      timestamp: nowISO()
    });
  }));

  app.post('/api/sequential-os/apt/install', asyncHandler(async (req, res) => {
    const { packages } = req.body;
    if (!packages || !Array.isArray(packages) || packages.length === 0) {
      return res.status(400).json(createErrorResponse('INVALID_INPUT', 'packages array is required'));
    }

    const validation = await packageManager.validatePackagesForInstall(packages);
    if (!validation.canProceed) {
      return res.status(400).json({
        success: false,
        errors: validation.invalid,
        message: 'Some packages failed validation'
      });
    }

    const installCmd = packageManager.getInstallCommand(validation.valid);
    const result = await kit.run(installCmd);

    res.json({
      success: true,
      packages: validation.valid,
      instruction: installCmd,
      hash: result.hash,
      short: result.short,
      stdout: result.stdout || '',
      stderr: result.stderr || '',
      timestamp: nowISO()
    });
  }));

  app.post('/api/sequential-os/apt/remove', asyncHandler(async (req, res) => {
    const { packages, purge = false } = req.body;
    if (!packages || !Array.isArray(packages) || packages.length === 0) {
      return res.status(400).json(createErrorResponse('INVALID_INPUT', 'packages array is required'));
    }

    const validation = await packageManager.validatePackagesForInstall(packages);
    if (!validation.canProceed) {
      return res.status(400).json({
        success: false,
        errors: validation.invalid,
        message: 'Some packages failed validation'
      });
    }

    const removeCmd = purge
      ? packageManager.getPurgeCommand(validation.valid)
      : packageManager.getRemoveCommand(validation.valid);

    const result = await kit.run(removeCmd);

    res.json({
      success: true,
      packages: validation.valid,
      instruction: removeCmd,
      hash: result.hash,
      short: result.short,
      stdout: result.stdout || '',
      stderr: result.stderr || '',
      timestamp: nowISO()
    });
  }));

  app.post('/api/sequential-os/apt/update', asyncHandler(async (req, res) => {
    const updateCmd = packageManager.getUpdateCommand();
    const result = await kit.run(updateCmd);

    res.json({
      success: true,
      instruction: updateCmd,
      hash: result.hash,
      short: result.short,
      stdout: result.stdout || '',
      stderr: result.stderr || '',
      timestamp: nowISO()
    });
  }));

  app.post('/api/sequential-os/apt/upgrade', asyncHandler(async (req, res) => {
    const { distUpgrade = false } = req.body;
    const upgradeCmd = distUpgrade
      ? packageManager.getDistUpgradeCommand()
      : packageManager.getUpgradeCommand();

    const result = await kit.run(upgradeCmd);

    res.json({
      success: true,
      instruction: upgradeCmd,
      hash: result.hash,
      short: result.short,
      stdout: result.stdout || '',
      stderr: result.stderr || '',
      timestamp: nowISO()
    });
  }));

  app.post('/api/sequential-os/apt/search', asyncHandler(async (req, res) => {
    const { packageName } = req.body;
    if (!packageName) {
      return res.status(400).json(createErrorResponse('INVALID_INPUT', 'packageName is required'));
    }

    const searchCmd = packageManager.getSearchCommand(packageName);
    const result = await kit.exec(searchCmd);

    res.json({
      success: true,
      packageName,
      instruction: searchCmd,
      results: result || '',
      timestamp: nowISO()
    });
  }));

  app.post('/api/sequential-os/apt/info', asyncHandler(async (req, res) => {
    const { packageName } = req.body;
    if (!packageName) {
      return res.status(400).json(createErrorResponse('INVALID_INPUT', 'packageName is required'));
    }

    const infoCmd = packageManager.getInfoCommand(packageName);
    const result = await kit.exec(infoCmd);

    res.json({
      success: true,
      packageName,
      instruction: infoCmd,
      info: result || '',
      timestamp: nowISO()
    });
  }));

  app.get('/api/sequential-os/apt/list', asyncHandler(async (req, res) => {
    const { filter } = req.query;
    const listCmd = packageManager.getListInstalledCommand(filter);
    const result = await kit.exec(listCmd);

    res.json({
      success: true,
      instruction: listCmd,
      filter: filter || null,
      packages: result || '',
      timestamp: nowISO()
    });
  }));

  app.post('/api/sequential-os/apt/autoremove', asyncHandler(async (req, res) => {
    const autoremoveCmd = packageManager.getAutoremoveCommand();
    const result = await kit.run(autoremoveCmd);

    res.json({
      success: true,
      instruction: autoremoveCmd,
      hash: result.hash,
      short: result.short,
      stdout: result.stdout || '',
      stderr: result.stderr || '',
      timestamp: nowISO()
    });
  }));

  app.get('/api/sequential-os/apt/status', asyncHandler(async (req, res) => {
    const hasApt = packageManager.hasApt;
    const isLinux = packageManager.isLinux;

    res.json({
      supported: hasApt && isLinux,
      platform: process.platform,
      hasApt,
      isLinux,
      timestamp: nowISO()
    });
  }));
}
