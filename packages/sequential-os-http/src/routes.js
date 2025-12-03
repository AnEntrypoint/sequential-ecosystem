import path from 'path';
import fs from 'fs-extra';
import { asyncHandler } from '@sequential/error-handler';
import { throwValidationError } from '@sequential/error-handling';
import { packageManager } from './package-manager.js';
import { nowISO } from '@sequential/timestamp-utilities';
import { validateBodyFieldExists, validateBodyArray } from '@sequential/body-validator';

export function registerSequentialOsRoutes(app, kit, STATEKIT_DIR) {
  app.get('/api/sequential-os/status', asyncHandler(async (req, res) => {
    res.json(await kit.status());
  }));

  app.post('/api/sequential-os/run', asyncHandler(async (req, res) => {
    const instruction = validateBodyFieldExists(req.body, 'instruction');
    res.json(await kit.run(instruction));
  }));

  app.post('/api/sequential-os/exec', asyncHandler(async (req, res) => {
    const instruction = validateBodyFieldExists(req.body, 'instruction');
    res.json({ output: await kit.exec(instruction), success: true });
  }));

  app.get('/api/sequential-os/history', asyncHandler(async (req, res) => {
    res.json(await kit.history());
  }));

  app.post('/api/sequential-os/checkout', asyncHandler(async (req, res) => {
    const ref = validateBodyFieldExists(req.body, 'ref');
    await kit.checkout(ref);
    res.json({ success: true, ref });
  }));

  app.get('/api/sequential-os/tags', asyncHandler(async (req, res) => {
    res.json(kit.tags());
  }));

  app.post('/api/sequential-os/tag', asyncHandler(async (req, res) => {
    const name = validateBodyFieldExists(req.body, 'name');
    const ref = req.body.ref;
    kit.tag(name, ref);
    res.json({ success: true, name, ref });
  }));

  const cmdResponse = (cmd, result, meta = {}) => ({ success: true, instruction: cmd, ...result, ...meta, timestamp: nowISO() });
  const execResponse = (cmd, result, meta = {}) => ({ success: true, instruction: cmd, [meta.field || 'output']: result || '', timestamp: nowISO() });

  app.get('/api/sequential-os/inspect/:hash', asyncHandler(async (req, res) => {
    const { hash } = req.params;
    const layerPath = path.join(STATEKIT_DIR, 'layers', hash);
    if (!fs.existsSync(layerPath)) throwValidationError('hash', 'Layer not found');
    const files = [];
    const scan = (dir, base = '') => {
      fs.readdirSync(dir).forEach(item => {
        const fullPath = path.join(dir, item);
        (fs.statSync(fullPath).isDirectory()) ? scan(fullPath, path.join(base, item)) : files.push(path.join(base, item));
      });
    };
    scan(layerPath);
    res.json({ hash, files, size: fs.statSync(layerPath).size || 0 });
  }));

  app.post('/api/sequential-os/diff', asyncHandler(async (req, res) => {
    const file = validateBodyFieldExists(req.body, 'file');
    const hash1 = validateBodyFieldExists(req.body, 'hash1');
    const hash2 = validateBodyFieldExists(req.body, 'hash2');
    const p1 = path.join(STATEKIT_DIR, 'layers', hash1, file);
    const p2 = path.join(STATEKIT_DIR, 'layers', hash2, file);
    if (!fs.existsSync(p1) || !fs.existsSync(p2)) throwValidationError('file', 'File not found');
    const c1 = fs.readFileSync(p1, 'utf-8'), c2 = fs.readFileSync(p2, 'utf-8');
    res.json({ file, hash1, hash2, content1: c1, content2: c2, identical: c1 === c2 });
  }));

  app.post('/api/sequential-os/terminal/execute', asyncHandler(async (req, res) => {
    const instruction = validateBodyFieldExists(req.body, 'instruction');
    const sessionId = req.body.sessionId || 'default';
    const result = await kit.run(instruction);
    res.json({ success: true, output: result.output || '', exitCode: result.exitCode || 0, instruction, sessionId, timestamp: nowISO() });
  }));

  app.post('/api/sequential-os/apt/install', asyncHandler(async (req, res) => {
    const packages = validateBodyArray(req.body, 'packages');
    const validation = await packageManager.validatePackagesForInstall(packages);
    if (!validation.canProceed) throwValidationError('packages', 'Validation failed');
    const cmd = packageManager.getInstallCommand(validation.valid);
    const result = await kit.run(cmd);
    res.json(cmdResponse(cmd, result, { packages: validation.valid }));
  }));

  app.post('/api/sequential-os/apt/remove', asyncHandler(async (req, res) => {
    const packages = validateBodyArray(req.body, 'packages');
    const validation = await packageManager.validatePackagesForInstall(packages);
    if (!validation.canProceed) throwValidationError('packages', 'Validation failed');
    const cmd = req.body.purge ? packageManager.getPurgeCommand(validation.valid) : packageManager.getRemoveCommand(validation.valid);
    const result = await kit.run(cmd);
    res.json(cmdResponse(cmd, result, { packages: validation.valid }));
  }));

  app.post('/api/sequential-os/apt/update', asyncHandler(async (req, res) => {
    const cmd = packageManager.getUpdateCommand();
    const result = await kit.run(cmd);
    res.json(cmdResponse(cmd, result));
  }));

  app.post('/api/sequential-os/apt/upgrade', asyncHandler(async (req, res) => {
    const cmd = req.body.distUpgrade ? packageManager.getDistUpgradeCommand() : packageManager.getUpgradeCommand();
    const result = await kit.run(cmd);
    res.json(cmdResponse(cmd, result));
  }));

  app.post('/api/sequential-os/apt/search', asyncHandler(async (req, res) => {
    const packageName = validateBodyFieldExists(req.body, 'packageName');
    const cmd = packageManager.getSearchCommand(packageName);
    const result = await kit.exec(cmd);
    res.json(execResponse(cmd, result, { field: 'results', packageName }));
  }));

  app.post('/api/sequential-os/apt/info', asyncHandler(async (req, res) => {
    const packageName = validateBodyFieldExists(req.body, 'packageName');
    const cmd = packageManager.getInfoCommand(packageName);
    const result = await kit.exec(cmd);
    res.json(execResponse(cmd, result, { field: 'info', packageName }));
  }));

  app.get('/api/sequential-os/apt/list', asyncHandler(async (req, res) => {
    const filter = req.query.filter;
    const cmd = packageManager.getListInstalledCommand(filter);
    const result = await kit.exec(cmd);
    res.json(execResponse(cmd, result, { field: 'packages', filter: filter || null }));
  }));

  app.post('/api/sequential-os/apt/autoremove', asyncHandler(async (req, res) => {
    const cmd = packageManager.getAutoremoveCommand();
    const result = await kit.run(cmd);
    res.json(cmdResponse(cmd, result));
  }));

  app.get('/api/sequential-os/apt/status', asyncHandler(async (req, res) => {
    res.json({ supported: packageManager.hasApt && packageManager.isLinux, platform: process.platform, hasApt: packageManager.hasApt, isLinux: packageManager.isLinux, timestamp: nowISO() });
  }));
}
