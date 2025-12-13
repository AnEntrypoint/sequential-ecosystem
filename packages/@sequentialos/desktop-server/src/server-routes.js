import path from 'path';
import express from 'express';
import { registerDebugRoutes } from './routes/debug.js';
import { registerAppRoutes } from './routes/apps.js';
import { registerUserAppRoutes } from './routes/user-apps.js';
import { registerSequentialOsRoutes } from './routes/sequential-os.js';
import { registerFileRoutes } from './routes/files.js';
import { registerVfsRoutes } from './routes/vfs.js';
import { registerTaskRoutes, getActiveTasks } from './routes/tasks.js';
import { registerFlowRoutes } from './routes/flows.js';
import { registerToolRoutes } from './routes/tools.js';
import { registerQueueRoutes } from './routes/queue.js';
import { registerWorkerRoutes } from './routes/workers.js';
import { registerSchedulerRoutes } from './routes/scheduler.js';
import { registerRunsRoutes } from './routes/runs.js';
import { registerStorageObserverRoutes } from './routes/storage-observer.js';
import { registerBackgroundTaskRoutes } from './routes/background-tasks.js';
import { registerErrorLoggingRoutes } from './routes/error-logging.js';
import { registerHealthRoutes } from './routes/health.js';
import { registerLLMRoutes } from './routes/llm.js';
import { registerStorageRoutes } from './routes/storage.js';
import { registerComponentRoutes } from './routes/components.js';
import { registerObservabilityV2Routes } from './routes/observability-v2.js';

export { getActiveTasks };

export async function registerAllRoutes(app, container, appRegistry, kit, STATEKIT_DIR, __dirname) {
  console.log('[registerAllRoutes] Received STATEKIT_DIR:', STATEKIT_DIR, 'kit:', kit ? 'present' : 'null');
  registerDebugRoutes(app, container);
  registerAppRoutes(app, appRegistry, __dirname);
  registerUserAppRoutes(app, container);

  if (kit) {
    console.log('[registerAllRoutes] Calling registerSequentialOsRoutes with STATEKIT_DIR:', STATEKIT_DIR);
    registerSequentialOsRoutes(app, kit, STATEKIT_DIR);
  } else {
    app.use('/api/sequential-os/', (req, res) => {
      res.status(503).json({ error: 'Sequential-OS service unavailable (StateKit not initialized)' });
    });
  }

  registerFileRoutes(app, container);
  registerVfsRoutes(app, container);
  registerTaskRoutes(app, container);
  registerFlowRoutes(app, container);

  const toolRegistry = container.resolve('ToolRegistry');
  await toolRegistry.loadPersistedTools();

  registerToolRoutes(app, container);
  registerQueueRoutes(app, container);
  registerWorkerRoutes(app, container);
  registerSchedulerRoutes(app, container);
  registerRunsRoutes(app, () => getActiveTasks(container));
  registerStorageObserverRoutes(app, container);
  registerBackgroundTaskRoutes(app);
  registerErrorLoggingRoutes(app);
  registerHealthRoutes(app);
  registerLLMRoutes(app, container);
  registerStorageRoutes(app, container);
  registerObservabilityV2Routes(app);
}

export function setupStaticFiles(app, __dirname) {
  app.use(express.static(path.join(__dirname, '../../desktop-shell/dist')));
  app.use(express.static(path.join(__dirname, '../../zellous')));
  app.use('/app-sdk', express.static(path.join(__dirname, '../../app-sdk')));
}
