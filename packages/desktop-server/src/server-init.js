import logger from '@sequentialos/sequential-logging';
import { validateEnvironment } from './utils/env-validation.js';
import { ensureDirectories, loadStateKit, initializeStateKit } from './utils/initialization.js';
import { AppRegistry } from './app-registry.js';
import { setupDIContainer } from './utils/di-setup.js';
import path from 'path';
import { StateManager, FileSystemAdapter, setupBroadcastMiddleware } from '@sequentialos/persistent-state';
import { RealtimeBroadcaster } from '@sequentialos/realtime-sync';
import { queueWorkerPool, taskScheduler } from '@sequentialos/server-utilities';

export async function initializeEnvironment() {
  validateEnvironment();
  const dirConfig = {};
  const { STATEKIT_DIR, WORK_DIR } = await ensureDirectories(dirConfig);

  let kit = null;
  try {
    const StateKit = await loadStateKit();
    kit = await initializeStateKit(StateKit, STATEKIT_DIR, WORK_DIR);
  } catch (err) {
    logger.warn('StateKit initialization failed, continuing without it:', err.message);
  }

  return { kit, STATEKIT_DIR, WORK_DIR };
}

export async function setupAppRegistry() {
  const appRegistry = new AppRegistry({
    appDirs: [
      'app-terminal',
      'app-debugger',
      'app-flow-editor',
      'app-task-editor',
      'app-tool-editor',
      'app-task-debugger',
      'app-flow-debugger',
      'app-run-observer',
      'app-file-browser',
      '@sequentialos/app-editor',
      '@sequentialos/app-debugger',
      '@sequentialos/app-manager',
      'app-observability-console',
      'app-observability-dashboard',
      'app-demo-chat'
    ]
  });

  await appRegistry.discover();
  return appRegistry;
}

export function setupDIAndState(WORK_DIR) {
  const container = setupDIContainer();

  const stateDir = path.join(WORK_DIR, '.state');
  container.register('StateManager', () => {
    const stateAdapter = new FileSystemAdapter(stateDir);
    return new StateManager(stateAdapter, {
      maxCacheSize: parseInt(process.env.STATE_CACHE_SIZE || '5000'),
      cacheTTL: parseInt(process.env.STATE_TTL_MS || '600000'),
      cleanupInterval: parseInt(process.env.STATE_CLEANUP_INTERVAL_MS || '60000')
    });
  }, { singleton: true });

  container.register('QueueWorkerPool', () => queueWorkerPool, { singleton: true });
  container.register('TaskScheduler', () => taskScheduler, { singleton: true });

  const stateManager = container.resolve('StateManager');
  setupBroadcastMiddleware(stateManager, RealtimeBroadcaster);

  return { container, stateManager };
}
