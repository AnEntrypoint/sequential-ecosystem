import express from 'express';
import path from 'path';
import http from 'http';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import logger from '@sequentialos/sequential-logging';
import { CONFIG, queueWorkerPool, taskScheduler } from '@sequentialos/server-utilities';
import { createErrorHandler } from './middleware/error-handler.js';
import { setupWebSocket } from './utils/websocket-setup.js';
import { bootstrapComponents } from './utils/bootstrap-components.js';
import { registerRealtimeRoutes, setupRealtimeWebSocket } from './routes/realtime.js';
import * as serverInit from './server-init.js';
import * as serverMiddleware from './server-middleware.js';
import * as serverRoutes from './server-routes.js';
import * as serverLifecycle from './server-lifecycle.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PORT = CONFIG.server.port;
const HOSTNAME = CONFIG.server.hostname;
const PROTOCOL = CONFIG.server.protocol;

async function main() {
  try {
    logger.info('\n🚀 Starting Sequential Desktop Server...\n');

    // Initialize environment and infrastructure
    const { kit, STATEKIT_DIR, WORK_DIR } = await serverInit.initializeEnvironment();

    const appRegistry = await serverInit.setupAppRegistry();
    const { container, stateManager } = serverInit.setupDIAndState(WORK_DIR);

    // Setup Express app and middleware
    const app = express();
    serverMiddleware.setupExpressMiddleware(app);
    serverMiddleware.setupCORS(app);
    serverMiddleware.setupRequestTracking(app);
    serverMiddleware.setupAPIMiddleware(app);

    // Register routes
    await serverRoutes.registerAllRoutes(app, container, appRegistry, kit, STATEKIT_DIR, __dirname);
    await bootstrapComponents(stateManager);

    // Setup static files and error handling
    serverRoutes.setupStaticFiles(app, __dirname);
    app.use(createErrorHandler());

    // Setup WebSocket and background tasks
    const httpServer = http.createServer(app);
    const { wss } = setupWebSocket(httpServer, () => {
      const { getActiveTasks } = serverRoutes;
      return getActiveTasks(container);
    });
    registerRealtimeRoutes(app, wss);
    setupRealtimeWebSocket(wss);

    // Setup lifecycle listeners and workers
    serverLifecycle.setupBackgroundTaskListeners();
    await serverLifecycle.initializeWorkers(queueWorkerPool, taskScheduler, stateManager);

    // Setup hot reload and startup
    const fileWatchers = serverLifecycle.setupHotReloadWatcher(app, appRegistry, __dirname);
    serverLifecycle.setupServerStartup(httpServer, PORT, HOSTNAME, PROTOCOL, appRegistry);
    serverLifecycle.setupServerShutdown(httpServer, wss, fileWatchers, stateManager, queueWorkerPool, taskScheduler);

    return new Promise(() => {});

  } catch (error) {
    logger.error('\n✗ Failed to start server', error);
    throw error;
  }
}

main().catch(error => {
  logger.error('Fatal error:', error);
  process.exit(1);
});
