import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import logger from '@sequentialos/sequential-logging';
import { SERVER_CONFIG } from '@sequentialos/core-config';
import { taskRegistry } from '@sequentialos/task-registry';
import { flowRegistry } from '@sequentialos/flow-registry';
import { toolRegistry } from '@sequentialos/tool-registry';
import { executeFlow } from '@sequentialos/flow-executor';
import { executeTool } from '@sequentialos/tool-executor';
import { createTaskService } from '@sequentialos/execution-service-unified';
import { hotReloadManager } from '@sequentialos/hot-reload-manager';
import { nanoid } from 'nanoid';
import '@sequentialos/tool-dispatcher';
import '@sequentialos/unified-invocation-bridge';

const app = express();

const taskService = createTaskService({ maxHistorySize: 100 });

const getMemoryStatus = () => {
  const mem = process.memoryUsage();
  return {
    heapUsedMB: (mem.heapUsed / 1024 / 1024).toFixed(2),
    rssMB: (mem.rss / 1024 / 1024).toFixed(2),
    heapPercent: ((mem.heapUsed / mem.heapTotal) * 100).toFixed(2)
  };
};

setInterval(() => {
  if (global.gc) {
    const mem = process.memoryUsage();
    const heapPercent = mem.heapUsed / mem.heapTotal;
    if (heapPercent > 0.8) {
      global.gc();
    }
  }
}, 60000);

app.use(cors({ origin: SERVER_CONFIG.CORS_ORIGIN }));
app.use(bodyParser.json({ limit: SERVER_CONFIG.REQUEST_SIZE_LIMIT }));

app.get('/health', (req, res) => {
  const memory = getMemoryStatus();
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    memory
  });
});

let registriesLoaded = false;

const ensureRegistriesLoaded = async () => {
  if (!registriesLoaded) {
    await taskRegistry.loadAll();
    await flowRegistry.loadAll();
    await toolRegistry.loadAll();
    registriesLoaded = true;
  }
};

app.get('/api/tasks', async (req, res) => {
  try {
    await ensureRegistriesLoaded();
    const tasks = taskRegistry.list().map(name => ({
      name,
      loaded: true
    }));
    res.json({ success: true, data: tasks });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/flows', async (req, res) => {
  try {
    await ensureRegistriesLoaded();
    const flows = flowRegistry.list().map(name => {
      const flow = flowRegistry.get(name);
      return {
        name,
        config: flow?.config,
        loaded: true
      };
    });
    res.json({ success: true, data: flows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/tools', async (req, res) => {
  try {
    await ensureRegistriesLoaded();
    const tools = toolRegistry.list().map(fullName => {
      const tool = toolRegistry.get(fullName);
      return {
        fullName,
        id: tool?.id,
        name: tool?.name,
        category: tool?.category || 'default',
        loaded: true
      };
    });
    res.json({ success: true, data: tools });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/tasks/:taskName/execute', async (req, res) => {
  try {
    await ensureRegistriesLoaded();
    const { taskName } = req.params;
    const input = req.body || {};

    const task = taskRegistry.get(taskName);
    if (task?.handler) {
      taskService.register(taskName, task.handler);
    }

    const result = await taskService.execute(taskName, input, {
      id: nanoid(9),
      broadcast: true
    });

    res.json({ success: result.success, data: result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/flows/:flowName/execute', async (req, res) => {
  try {
    await ensureRegistriesLoaded();

    const { flowName } = req.params;
    const input = req.body || {};

    const flowEntry = flowRegistry.get(flowName);
    if (!flowEntry) {
      return res.status(404).json({
        success: false,
        error: `Flow not found: ${flowName}`
      });
    }

    const flowResult = await executeFlow(flowEntry.config, input);
    const result = {
      success: flowResult.success,
      data: flowResult,
      id: `flow-${nanoid(9)}`
    };

    res.json({ success: result.success, data: result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/tools/:category/:toolName/execute', async (req, res) => {
  try {
    await ensureRegistriesLoaded();
    const { category, toolName } = req.params;
    const input = req.body || {};

    const toolResult = await executeTool(category, toolName, input);
    const result = {
      success: true,
      data: toolResult,
      id: `tool-${nanoid(9)}`
    };

    res.json({ success: result.success, data: result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.use((err, req, res, next) => {
  logger.error('Server error:', err);
  res.status(500).json({
    success: false,
    error: err.message
  });
});

const PORT = SERVER_CONFIG.PORT;
const HOST = SERVER_CONFIG.HOST;

app.listen(PORT, HOST, async () => {
  logger.info(`Sequential Ecosystem desktop server running on ${HOST}:${PORT}`);

  await taskRegistry.loadAll();
  await flowRegistry.loadAll();
  await toolRegistry.loadAll();
  registriesLoaded = true;

  hotReloadManager.on('reload', () => {
    registriesLoaded = false;
  });

  hotReloadManager.start();
});
