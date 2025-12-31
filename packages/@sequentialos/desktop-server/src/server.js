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
import { nanoid } from 'nanoid';

const app = express();

app.use(cors({ origin: SERVER_CONFIG.CORS_ORIGIN }));
app.use(bodyParser.json({ limit: SERVER_CONFIG.REQUEST_SIZE_LIMIT }));

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api/tasks', async (req, res) => {
  try {
    await taskRegistry.loadAll();
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
    await flowRegistry.loadAll();
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
    await toolRegistry.loadAll();
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
    await taskRegistry.loadAll();
    const { taskName } = req.params;
    const input = req.body || {};

    const taskService = createTaskService();
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
    await flowRegistry.loadAll();
    await taskRegistry.loadAll();

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
    await toolRegistry.loadAll();
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

app.listen(PORT, HOST, () => {
  logger.info(`Sequential Ecosystem desktop server running on ${HOST}:${PORT}`);
});
