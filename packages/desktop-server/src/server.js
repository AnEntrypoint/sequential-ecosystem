import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import logger from 'sequential-logging';
import { SERVER_CONFIG } from 'core-config';
import { taskRegistry } from 'task-registry';
import { flowRegistry } from 'flow-registry';
import { toolRegistry } from 'tool-registry';
import { executeFlow } from 'flow-executor';
import { executeTool } from 'tool-executor';
import { createTaskService } from 'execution-service-unified';
import { hotReloadManager } from 'hot-reload-manager';
import { nanoid } from 'nanoid';
import 'tool-dispatcher';
import 'unified-invocation-bridge';

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

const getErrorStatusCode = (error) => {
  if (!error) return 500;
  const msg = error.message || '';
  if (msg.includes('timeout') || msg.includes('Timeout')) return 408;
  if (msg.includes('not found') || msg.includes('Not found')) return 404;
  if (msg.includes('Invalid') || msg.includes('invalid') || msg.includes('Validation') || msg.includes('validation')) return 400;
  if (msg.includes('syntax') || msg.includes('Syntax') || msg.includes('parse') || msg.includes('Parse')) return 400;
  if (msg.includes('required') || msg.includes('Required') || msg.includes('missing') || msg.includes('Missing')) return 400;
  return 500;
};

const inputValidationMiddleware = (req, res, next) => {
  if (req.method === 'POST' && req.path.includes('/execute')) {
    const input = req.body;
    if (input !== null && input !== undefined && typeof input !== 'object') {
      return res.status(400).json({
        success: false,
        error: 'Input must be a JSON object'
      });
    }
    if (input === null || input === undefined) {
      req.body = {};
    }
  }
  next();
};

app.use(inputValidationMiddleware);

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

    if (!taskName || typeof taskName !== 'string') {
      return res.status(400).json({ success: false, error: 'Task name is required and must be a string' });
    }

    const task = taskRegistry.get(taskName);
    if (!task) {
      return res.status(404).json({ success: false, error: `Task not found: ${taskName}` });
    }

    if (task?.handler) {
      taskService.register(taskName, task.handler);
    }

    const result = await taskService.execute(taskName, input, {
      id: nanoid(9),
      broadcast: true
    });

    if (!result.success && result.error) {
      const statusCode = getErrorStatusCode(result.error);
      return res.status(statusCode).json({ success: false, error: result.error?.message || result.error });
    }

    res.json({ success: result.success, data: result });
  } catch (err) {
    const statusCode = getErrorStatusCode(err);
    res.status(statusCode).json({ success: false, error: err.message });
  }
});

app.post('/api/flows/:flowName/execute', async (req, res) => {
  try {
    await ensureRegistriesLoaded();

    const { flowName } = req.params;
    const input = req.body || {};

    if (!flowName || typeof flowName !== 'string') {
      return res.status(400).json({ success: false, error: 'Flow name is required and must be a string' });
    }

    const flowEntry = flowRegistry.get(flowName);
    if (!flowEntry) {
      return res.status(404).json({
        success: false,
        error: `Flow not found: ${flowName}`
      });
    }

    const flowResult = await executeFlow(flowEntry.config, input);

    if (!flowResult.success && flowResult.errors?.length > 0) {
      const firstError = flowResult.errors[0];
      const statusCode = getErrorStatusCode({ message: firstError.error });
      return res.status(statusCode).json({
        success: false,
        error: firstError.error
      });
    }

    const result = {
      success: flowResult.success,
      data: flowResult,
      id: `flow-${nanoid(9)}`
    };

    res.json({ success: result.success, data: result });
  } catch (err) {
    const statusCode = getErrorStatusCode(err);
    res.status(statusCode).json({ success: false, error: err.message });
  }
});

app.post('/api/tools/:category/:toolName/execute', async (req, res) => {
  try {
    await ensureRegistriesLoaded();
    const { category, toolName } = req.params;
    const input = req.body || {};

    if (!category || typeof category !== 'string') {
      return res.status(400).json({ success: false, error: 'Tool category is required and must be a string' });
    }

    if (!toolName || typeof toolName !== 'string') {
      return res.status(400).json({ success: false, error: 'Tool name is required and must be a string' });
    }

    const toolResult = await executeTool(category, toolName, input);
    const result = {
      success: true,
      data: toolResult,
      id: `tool-${nanoid(9)}`
    };

    res.json({ success: result.success, data: result });
  } catch (err) {
    const statusCode = getErrorStatusCode(err);
    res.status(statusCode).json({ success: false, error: err.message });
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
