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
import { z } from 'zod';

const taskService = createTaskService({ maxHistorySize: 100 });
const flowService = createFlowService({ maxHistorySize: 100 });

const executeSchema = z.object({
  type: z.enum(['task', 'flow', 'tool']),
  name: z.string().min(1, 'Name cannot be empty'),
  input: z.record(z.any()).optional(),
  category: z.string().optional(),
  id: z.string().optional(),
  timeout: z.number().positive().optional(),
  broadcast: z.boolean().optional()
});

const listSchema = z.object({
  type: z.enum(['task', 'flow', 'tool'])
});

const historySchema = z.object({
  entityType: z.enum(['task', 'flow']),
  limit: z.number().positive().optional().default(10)
});

const logsSchema = z.object({
  level: z.enum(['all', 'stdout', 'stderr']).optional().default('all'),
  limit: z.number().positive().optional()
});

class ValidationError extends Error {
  constructor(message, code = 'VALIDATION_ERROR') {
    super(message);
    this.code = code;
    this.name = 'ValidationError';
  }
}

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
    try {
      const validated = executeSchema.parse({
        type,
        name,
        input: input || {},
        category: options?.category,
        id: options?.id,
        timeout: options?.timeout,
        broadcast: options?.broadcast
      });

      const { category, id = nanoid(9), timeout, broadcast = true } = {
        category: validated.category,
        id: validated.id || nanoid(9),
        timeout: validated.timeout,
        broadcast: validated.broadcast !== false
      };

      logger.debug('[MCPTools] Executing', type, ':', name);

      if (validated.type === 'task') {
        const task = taskRegistry.get(validated.name);
        if (task?.handler) {
          taskService.register(validated.name, task.handler);
        }

        const timeoutMs = timeout || 30000;
        const result = await taskService.execute(validated.name, validated.input || {}, {
          id,
          timeout: timeoutMs,
          broadcast
        });

        return {
          success: result.success,
          type: 'task',
          name: validated.name,
          result: result.data || result.error,
          executionId: result.id,
          duration: result.duration,
          timestamp: result.endTime
        };
      } else if (validated.type === 'flow') {
        const flowEntry = flowRegistry.get(validated.name);
        if (!flowEntry) {
          throw new ValidationError(`Flow not found: ${validated.name}`, 'NOT_FOUND');
        }

        const timeoutMs = timeout || 60000;
        const flowResult = await executeFlow(flowEntry.config, validated.input || {});
        return {
          success: flowResult.success,
          type: 'flow',
          name: validated.name,
          result: flowResult.data || flowResult.error,
          executionId: `flow-${id}`,
          timestamp: new Date().toISOString()
        };
      } else if (validated.type === 'tool') {
        if (!validated.category) {
          throw new ValidationError('Tool execution requires category parameter', 'MISSING_PARAM');
        }

        const toolResult = await executeTool(validated.category, validated.name, validated.input || {});
        return {
          success: true,
          type: 'tool',
          category: validated.category,
          name: validated.name,
          result: toolResult,
          executionId: `tool-${id}`,
          timestamp: new Date().toISOString()
        };
      }
    } catch (err) {
      if (err instanceof z.ZodError) {
        const message = err.errors[0]?.message || 'Invalid input parameters';
        logger.error('[MCPTools] Validation failed:', message);
        throw new ValidationError(message, 'VALIDATION_ERROR');
      }
      if (err instanceof ValidationError) {
        logger.error('[MCPTools] Validation error:', err.message);
        throw err;
      }
      logger.error('[MCPTools] Execution failed:', err);
      throw err;
    }
  }

  async list(type) {
    try {
      const validated = listSchema.parse({ type });
      logger.debug('[MCPTools] Listing', validated.type + 's');

      if (validated.type === 'task') {
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
      } else if (validated.type === 'flow') {
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
      } else if (validated.type === 'tool') {
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
      }
    } catch (err) {
      if (err instanceof z.ZodError) {
        const message = err.errors[0]?.message || 'Invalid list type parameter';
        logger.error('[MCPTools] Validation failed:', message);
        throw new ValidationError(message, 'VALIDATION_ERROR');
      }
      if (err instanceof ValidationError) {
        logger.error('[MCPTools] Validation error:', err.message);
        throw err;
      }
      logger.error('[MCPTools] List failed:', err);
      throw err;
    }
  }

  getExecutionHistory(entityType, limit = 10) {
    try {
      const validated = historySchema.parse({ entityType, limit });
      const service = validated.entityType === 'task' ? taskService : flowService;
      const history = service.getHistory(validated.limit);
      return {
        entityType: validated.entityType,
        history,
        count: history.length,
        totalCount: service.executionHistory.length
      };
    } catch (err) {
      if (err instanceof z.ZodError) {
        const message = err.errors[0]?.message || 'Invalid execution history parameters';
        logger.error('[MCPTools] Validation failed:', message);
        throw new ValidationError(message, 'VALIDATION_ERROR');
      }
      if (err instanceof ValidationError) {
        logger.error('[MCPTools] Validation error:', err.message);
        throw err;
      }
      logger.error('[MCPTools] Get execution history failed:', err);
      throw err;
    }
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
    try {
      const validated = logsSchema.parse({ limit, level });
      let logs = logManager.getLogs(validated.limit);

      if (validated.level !== 'all') {
        logs = logs.filter(log => log.level === validated.level);
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
    } catch (err) {
      if (err instanceof z.ZodError) {
        const message = err.errors[0]?.message || 'Invalid server logs parameters';
        logger.error('[MCPTools] Validation failed:', message);
        throw new ValidationError(message, 'VALIDATION_ERROR');
      }
      if (err instanceof ValidationError) {
        logger.error('[MCPTools] Validation error:', err.message);
        throw err;
      }
      logger.error('[MCPTools] Get server logs failed:', err);
      throw err;
    }
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
