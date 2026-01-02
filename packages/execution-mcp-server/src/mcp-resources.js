import logger from 'sequential-logging';
import { taskRegistry } from 'task-registry';
import { flowRegistry } from 'flow-registry';
import { toolRegistry } from 'tool-registry';

export class MCPResources {
  async getResourcesList() {
    const resources = [];

    try {
      await Promise.all([
        taskRegistry.loadAll(),
        flowRegistry.loadAll(),
        toolRegistry.loadAll()
      ]);
    } catch (err) {
      logger.error('[MCPResources] Failed to load registries:', err);
      throw err;
    }

    try {
      const tasks = taskRegistry.list();
      for (const taskName of tasks) {
        const task = taskRegistry.get(taskName);
        resources.push({
          uri: `task://${taskName}`,
          name: taskName,
          description: `Execute task: ${taskName}`,
          mimeType: 'application/json',
          metadata: {
            type: 'task',
            loadedAt: task?.loadedAt?.toISOString()
          }
        });
      }
    } catch (err) {
      logger.error('[MCPResources] Failed to list tasks:', err);
      throw err;
    }

    try {
      const flows = flowRegistry.list();
      for (const flowName of flows) {
        const flow = flowRegistry.get(flowName);
        resources.push({
          uri: `flow://${flowName}`,
          name: flowName,
          description: `Execute flow: ${flowName}`,
          mimeType: 'application/json',
          metadata: {
            type: 'flow',
            loadedAt: flow?.loadedAt?.toISOString()
          }
        });
      }
    } catch (err) {
      logger.error('[MCPResources] Failed to list flows:', err);
      throw err;
    }

    try {
      const tools = toolRegistry.list();
      for (const fullName of tools) {
        const tool = toolRegistry.get(fullName);
        const [category, toolName] = fullName.split(':');
        resources.push({
          uri: `tool://${fullName}`,
          name: fullName,
          description: `Execute tool: ${toolName} in category ${category}`,
          mimeType: 'application/json',
          metadata: {
            type: 'tool',
            category: category || 'default',
            toolName,
            loadedAt: tool?.loadedAt?.toISOString()
          }
        });
      }
    } catch (err) {
      logger.error('[MCPResources] Failed to list tools:', err);
      throw err;
    }

    return { resources };
  }

  async readResource(uri) {
    logger.debug('[MCPResources] Reading resource:', uri);

    if (uri.startsWith('task://')) {
      const taskName = uri.slice(7);
      const task = taskRegistry.get(taskName);
      if (!task) {
        throw new Error(`Task not found: ${taskName}`);
      }
      return {
        uri,
        mimeType: 'application/json',
        contents: JSON.stringify({
          type: 'task',
          name: taskName,
          config: task.config || {},
          loadedAt: task.loadedAt?.toISOString()
        }, null, 2)
      };
    }

    if (uri.startsWith('flow://')) {
      const flowName = uri.slice(7);
      const flow = flowRegistry.get(flowName);
      if (!flow) {
        throw new Error(`Flow not found: ${flowName}`);
      }
      return {
        uri,
        mimeType: 'application/json',
        contents: JSON.stringify({
          type: 'flow',
          name: flowName,
          config: flow.config || {},
          loadedAt: flow.loadedAt?.toISOString()
        }, null, 2)
      };
    }

    if (uri.startsWith('tool://')) {
      const fullName = uri.slice(7);
      const tool = toolRegistry.get(fullName);
      if (!tool) {
        throw new Error(`Tool not found: ${fullName}`);
      }
      return {
        uri,
        mimeType: 'application/json',
        contents: JSON.stringify({
          type: 'tool',
          name: tool.name || tool.id,
          category: tool.category || 'default',
          id: tool.id,
          description: tool.description,
          inputSchema: tool.inputSchema,
          loadedAt: tool.loadedAt?.toISOString()
        }, null, 2)
      };
    }

    throw new Error(`Unknown resource URI: ${uri}`);
  }
}

export const mcpResources = new MCPResources();
