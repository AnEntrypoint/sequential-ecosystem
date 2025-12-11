import logger from '@sequentialos/sequential-logging';
import { broadcastBackgroundTaskEvent } from '@sequentialos/websocket-broadcaster';
import { nowISO } from '@sequentialos/timestamp-utilities';
import { taskQueueManager, backgroundTaskManager } from '@sequentialos/server-utilities';
import { setupHotReload, closeFileWatchers } from './utils/hot-reload.js';
import { setupGracefulShutdown } from './utils/graceful-shutdown.js';

export function setupBackgroundTaskListeners() {
  backgroundTaskManager.on('task:start', (taskData) => {
    broadcastBackgroundTaskEvent({
      type: 'task:start',
      data: taskData,
      timestamp: nowISO()
    });
  });

  backgroundTaskManager.on('task:complete', (status) => {
    broadcastBackgroundTaskEvent({
      type: 'task:complete',
      status,
      timestamp: nowISO()
    });
  });

  backgroundTaskManager.on('task:failed', (status) => {
    broadcastBackgroundTaskEvent({
      type: 'task:failed',
      status,
      timestamp: nowISO()
    });
  });

  backgroundTaskManager.on('task:killed', (taskData) => {
    broadcastBackgroundTaskEvent({
      type: 'task:killed',
      data: taskData,
      timestamp: nowISO()
    });
  });

  backgroundTaskManager.on('task:progress', ({ id, progress }) => {
    broadcastBackgroundTaskEvent({
      type: 'task:progress',
      id,
      progress,
      timestamp: nowISO()
    });
  });
}

export async function initializeWorkers(queueWorkerPool, taskScheduler, stateManager) {
  backgroundTaskManager.setStateManager(stateManager);
  taskQueueManager.setStateManager(stateManager);
  await taskQueueManager.loadFromStorage();

  queueWorkerPool.setDependencies(taskQueueManager, backgroundTaskManager);
  await queueWorkerPool.start();

  taskScheduler.setDependencies(taskQueueManager, stateManager);
  await taskScheduler.start();
}

export function setupServerStartup(httpServer, PORT, HOSTNAME, PROTOCOL, appRegistry) {
  const baseUrl = `${PROTOCOL}://${HOSTNAME}:${PORT}`;
  const wsProtocol = PROTOCOL === 'https' ? 'wss' : 'ws';
  const wsBaseUrl = `${wsProtocol}://${HOSTNAME}:${PORT}`;

  httpServer.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      logger.error(`\n✗ Port ${PORT} is already in use`);
    } else if (err.code === 'EACCES') {
      logger.error(`\n✗ Access denied to port ${PORT} (requires elevated privileges)`);
    } else {
      logger.error(`\n✗ Server error: ${err.message}`);
    }
    process.exit(1);
  });

  httpServer.listen(PORT, () => {
    logger.info('\n✓ Sequential Desktop Server initialized\n');
    logger.info('Access points:');
    logger.info(`  Desktop:        ${baseUrl}`);
    logger.info(`  Apps API:       ${baseUrl}/api/apps`);
    logger.info(`  Sequential-OS:  ${baseUrl}/api/sequential-os/*`);
    logger.info(`  WebSocket:      ${wsBaseUrl}/api/runs/subscribe`);
    logger.info(`  Zellous:        ${baseUrl}/`);
    logger.info('\nRegistered apps:');
    appRegistry.getManifests().forEach(manifest => {
      logger.info(`  ${manifest.icon} ${manifest.name}: ${baseUrl}/apps/${manifest.id}/${manifest.entry}`);
    });
    logger.info('\nPress Ctrl+C to shutdown\n');
  });

  return { baseUrl, wsBaseUrl };
}

export function setupServerShutdown(httpServer, wss, fileWatchers, stateManager, queueWorkerPool, taskScheduler) {
  setupGracefulShutdown(httpServer, wss, fileWatchers, stateManager, queueWorkerPool, taskScheduler);
}

export function setupHotReloadWatcher(app, appRegistry, __dirname) {
  const { fileWatchers } = setupHotReload(app, appRegistry, __dirname);
  return fileWatchers;
}
