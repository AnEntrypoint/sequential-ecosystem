import logger from 'sequential-logging';
import { taskRegistry } from 'task-registry';
import { flowRegistry } from 'flow-registry';
import { toolRegistry } from 'tool-registry';
import { createTaskService, createFlowService } from 'execution-service-unified';
import { executeTool } from 'tool-executor';
import { executeFlow } from 'flow-executor';
import { nanoid } from 'nanoid';
import { serverLifecycle } from './server-lifecycle.js';
import { logManager } from './log-manager.js';

const taskService = createTaskService({ maxHistorySize: 100 });
const flowService = createFlowService({ maxHistorySize: 100 });

export class MCPTools {
  getToolDefinitions() {
    return [
      {
        name: 'execute',
        description: 'Execute a task, flow, or tool by type and name',
        inputSchema: {
          type: 'object',
          properties: {
            type: {
              type: 'string',
              enum: ['task', 'flow', 'tool'],
              description: 'Type of entity to execute'
            },
            name: {
              type: 'string',
              description: 'Name of the entity to execute'
            },
            input: {
              type: 'object',
              description: 'Input parameters for execution',
              additionalProperties: true
            },
            category: {
              type: 'string',
              description: 'Tool category (required when type is "tool")'
            },
            id: {
              type: 'string',
              description: 'Optional execution ID'
            },
            timeout: {
              type: 'number',
              description: 'Execution timeout in milliseconds'
            },
            broadcast: {
              type: 'boolean',
              description: 'Whether to broadcast execution events'
            }
          },
          required: ['type', 'name']
        }
      },
      {
        name: 'list',
        description: 'List all available entities of a specific type',
        inputSchema: {
          type: 'object',
          properties: {
            type: {
              type: 'string',
              enum: ['task', 'flow', 'tool'],
              description: 'Type of entities to list'
            }
          },
          required: ['type']
        }
      },
      {
        name: 'get_execution_history',
        description: 'Get execution history for a specific entity type',
        inputSchema: {
          type: 'object',
          properties: {
            entityType: {
              type: 'string',
              enum: ['task', 'flow'],
              description: 'Type of entity (task or flow)'
            },
            limit: {
              type: 'number',
              description: 'Maximum number of history entries to return',
              default: 10
            }
          },
          required: ['entityType']
        }
      },
      {
        name: 'get_server_status',
        description: 'Get desktop-server status and metrics',
        inputSchema: {
          type: 'object',
          properties: {}
        }
      },
      {
        name: 'start_server',
        description: 'Start the desktop-server or restart it if already running',
        inputSchema: {
          type: 'object',
          properties: {}
        }
      },
      {
        name: 'stop_server',
        description: 'Stop the desktop-server gracefully',
        inputSchema: {
          type: 'object',
          properties: {}
        }
      },
      {
        name: 'get_server_logs',
        description: 'Get latest server logs from the running process',
        inputSchema: {
          type: 'object',
          properties: {
            limit: {
              type: 'number',
              description: 'Number of latest log lines to return (optional, default all)',
              default: null
            },
            level: {
              type: 'string',
              enum: ['all', 'stdout', 'stderr'],
              description: 'Filter logs by level (optional, default all)',
              default: 'all'
            }
          }
        }
      }
    ];
  }

  async execute(type, name, input = {}, options = {}) {
    const { category, id = nanoid(9), timeout, broadcast = true } = options;

    logger.debug('[MCPTools] Executing', type, ':', name);

    try {
      if (type === 'task') {
        const task = taskRegistry.get(name);
        if (task?.handler) {
          taskService.register(name, task.handler);
        }

        const timeoutMs = timeout || 30000;
        const result = await taskService.execute(name, input, {
          id,
          timeout: timeoutMs,
          broadcast
        });

        return {
          success: result.success,
          type: 'task',
          name,
          result: result.data || result.error,
          executionId: result.id,
          duration: result.duration,
          timestamp: result.endTime
        };
      } else if (type === 'flow') {
        const flowEntry = flowRegistry.get(name);
        if (!flowEntry) {
          throw new Error(`Flow not found: ${name}`);
        }

        const timeoutMs = timeout || 60000;
        const flowResult = await executeFlow(flowEntry.config, input);
        return {
          success: flowResult.success,
          type: 'flow',
          name,
          result: flowResult.data || flowResult.error,
          executionId: `flow-${id}`,
          timestamp: new Date().toISOString()
        };
      } else if (type === 'tool') {
        if (!category) {
          throw new Error('Tool execution requires category parameter');
        }

        const toolResult = await executeTool(category, name, input);
        return {
          success: true,
          type: 'tool',
          category,
          name,
          result: toolResult,
          executionId: `tool-${id}`,
          timestamp: new Date().toISOString()
        };
      } else {
        throw new Error(`Unknown execution type: ${type}`);
      }
    } catch (err) {
      logger.error('[MCPTools] Execution failed:', err);
      throw err;
    }
  }

  async list(type) {
    logger.debug('[MCPTools] Listing', type + 's');

    try {
      if (type === 'task') {
        await taskRegistry.loadAll();
        const tasks = taskRegistry.list().map(name => {
          const task = taskRegistry.get(name);
          return {
            name,
            loadedAt: task?.loadedAt?.toISOString(),
            hasConfig: !!task?.config
          };
        });
        return { type: 'task', items: tasks, count: tasks.length };
      } else if (type === 'flow') {
        await flowRegistry.loadAll();
        const flows = flowRegistry.list().map(name => {
          const flow = flowRegistry.get(name);
          return {
            name,
            loadedAt: flow?.loadedAt?.toISOString(),
            hasConfig: !!flow?.config
          };
        });
        return { type: 'flow', items: flows, count: flows.length };
      } else if (type === 'tool') {
        await toolRegistry.loadAll();
        const tools = toolRegistry.list().map(fullName => {
          const tool = toolRegistry.get(fullName);
          const [category, toolName] = fullName.split(':');
          return {
            fullName,
            category: category || 'default',
            name: toolName,
            id: tool?.id,
            loadedAt: tool?.loadedAt?.toISOString()
          };
        });
        return { type: 'tool', items: tools, count: tools.length };
      } else {
        throw new Error(`Unknown list type: ${type}`);
      }
    } catch (err) {
      logger.error('[MCPTools] List failed:', err);
      throw err;
    }
  }

  getExecutionHistory(entityType, limit = 10) {
    const service = entityType === 'task' ? taskService : flowService;
    const history = service.getHistory(limit);
    return {
      entityType,
      history,
      count: history.length,
      totalCount: service.executionHistory.length
    };
  }

  getServerStatus() {
    return serverLifecycle.getStatus();
  }

  async startServer() {
    const status = serverLifecycle.getStatus();
    if (status.isRunning) {
      logger.info('[MCPTools] Server already running, initiating automatic restart');
      try {
        await serverLifecycle.stop();
        await new Promise(resolve => setTimeout(resolve, 500));
        const startResult = await serverLifecycle.start();
        return {
          ...startResult,
          action: 'restart',
          wasAlreadyRunning: true,
          message: 'Server was already running, restarted automatically'
        };
      } catch (err) {
        logger.error('[MCPTools] Auto-restart failed:', err);
        throw err;
      }
    }

    const startResult = await serverLifecycle.start();
    return {
      ...startResult,
      action: 'start',
      wasAlreadyRunning: false
    };
  }

  async stopServer() {
    return await serverLifecycle.stop();
  }

  getServerLogs(limit = null, level = 'all') {
    let logs = logManager.getLogs(limit);

    if (level !== 'all') {
      logs = logs.filter(log => log.level === level);
    }

    const stats = logManager.getStats();
    const result = {
      success: true,
      logs: logs.map(log => ({
        timestamp: log.timestamp,
        level: log.level,
        message: log.message
      })),
      count: logs.length,
      stats: {
        totalLines: stats.totalLines,
        maxLines: stats.maxLines,
        isFull: stats.isFull,
        isCapturing: stats.isCapturing,
        levelCounts: stats.levelCounts
      }
    };

    logManager.clear();
    return result;
  }

  async handleToolCall(toolName, input) {
    logger.debug('[MCPTools] Handling tool call:', toolName);

    switch (toolName) {
      case 'execute':
        return await this.execute(input.type, input.name, input.input, {
          category: input.category,
          id: input.id,
          timeout: input.timeout,
          broadcast: input.broadcast
        });

      case 'list':
        return await this.list(input.type);

      case 'get_execution_history':
        return this.getExecutionHistory(input.entityType, input.limit);

      case 'get_server_status':
        return this.getServerStatus();

      case 'start_server':
        return await this.startServer();

      case 'stop_server':
        return await this.stopServer();

      case 'get_server_logs':
        return this.getServerLogs(input.limit, input.level);

      default:
        throw new Error(`Unknown tool: ${toolName}`);
    }
  }
}

export const mcpTools = new MCPTools();
