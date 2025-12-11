import { createErrorResponse } from '@sequentialos/error-handling';
import { packageManager } from './package-manager.js';
import { nowISO } from '@sequentialos/timestamp-utilities';

function asyncHandler(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}

export function registerPackageHandlers(app, kit) {
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
