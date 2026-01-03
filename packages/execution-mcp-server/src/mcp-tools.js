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
        name: 'execute_task',
        description: 'Execute a task by name with input parameters',
        inputSchema: {
          type: 'object',
          properties: {
            taskName: {
              type: 'string',
              description: 'Name of the task to execute'
            },
            input: {
              type: 'object',
              description: 'Input parameters for the task',
              additionalProperties: true
            },
            timeout: {
              type: 'number',
              description: 'Execution timeout in milliseconds (optional, default 30000)',
              default: 30000
            }
          },
          required: ['taskName']
        }
      },
      {
        name: 'execute_flow',
        description: 'Execute a flow by name with input parameters',
        inputSchema: {
          type: 'object',
          properties: {
            flowName: {
              type: 'string',
              description: 'Name of the flow to execute'
            },
            input: {
              type: 'object',
              description: 'Input parameters for the flow',
              additionalProperties: true
            },
            timeout: {
              type: 'number',
              description: 'Execution timeout in milliseconds (optional, default 60000)',
              default: 60000
            }
          },
          required: ['flowName']
        }
      },
      {
        name: 'execute_tool',
        description: 'Execute a tool by category and name with input parameters',
        inputSchema: {
          type: 'object',
          properties: {
            category: {
              type: 'string',
              description: 'Tool category'
            },
            toolName: {
              type: 'string',
              description: 'Tool name'
            },
            input: {
              type: 'object',
              description: 'Input parameters for the tool',
              additionalProperties: true
            }
          },
          required: ['category', 'toolName']
        }
      },
      {
        name: 'list_tasks',
        description: 'List all available tasks',
        inputSchema: {
          type: 'object',
          properties: {}
        }
      },
      {
        name: 'list_flows',
        description: 'List all available flows',
        inputSchema: {
          type: 'object',
          properties: {}
        }
      },
      {
        name: 'list_tools',
        description: 'List all available tools',
        inputSchema: {
          type: 'object',
          properties: {}
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
        name: 'restart_server',
        description: 'Restart the desktop-server (deprecated: use start_server instead, it auto-restarts if running)',
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
      },
      {
        name: 'clear_server_logs',
        description: 'Clear server log history',
        inputSchema: {
          type: 'object',
          properties: {}
        }
      }
    ];
  }

  async executeTask(taskName, input = {}, timeout = 30000) {
    logger.debug('[MCPTools] Executing task:', taskName);

    try {
      const task = taskRegistry.get(taskName);
      if (task?.handler) {
        taskService.register(taskName, task.handler);
      }

      const result = await taskService.execute(taskName, input, {
        id: nanoid(9),
        timeout,
        broadcast: true
      });

      return {
        success: result.success,
        taskName,
        result: result.data || result.error,
        executionId: result.id,
        duration: result.duration,
        timestamp: result.endTime
      };
    } catch (err) {
      logger.error('[MCPTools] Task execution failed:', err);
      throw err;
    }
  }

  async executeFlow(flowName, input = {}, timeout = 60000) {
    logger.debug('[MCPTools] Executing flow:', flowName);

    try {
      const flowEntry = flowRegistry.get(flowName);
      if (!flowEntry) {
        throw new Error(`Flow not found: ${flowName}`);
      }

      const flowResult = await executeFlow(flowEntry.config, input);
      const result = {
        success: flowResult.success,
        flowName,
        result: flowResult.data || flowResult.error,
        executionId: `flow-${nanoid(9)}`,
        timestamp: new Date().toISOString()
      };

      return result;
    } catch (err) {
      logger.error('[MCPTools] Flow execution failed:', err);
      throw err;
    }
  }

  async executeTool(category, toolName, input = {}) {
    logger.debug('[MCPTools] Executing tool:', category, toolName);

    try {
      const toolResult = await executeTool(category, toolName, input);
      return {
        success: true,
        category,
        toolName,
        result: toolResult,
        executionId: `tool-${nanoid(9)}`,
        timestamp: new Date().toISOString()
      };
    } catch (err) {
      logger.error('[MCPTools] Tool execution failed:', err);
      throw err;
    }
  }

  async listTasks() {
    await taskRegistry.loadAll();
    const tasks = taskRegistry.list().map(name => {
      const task = taskRegistry.get(name);
      return {
        name,
        loadedAt: task?.loadedAt?.toISOString(),
        hasConfig: !!task?.config
      };
    });
    return { tasks, count: tasks.length };
  }

  async listFlows() {
    await flowRegistry.loadAll();
    const flows = flowRegistry.list().map(name => {
      const flow = flowRegistry.get(name);
      return {
        name,
        loadedAt: flow?.loadedAt?.toISOString(),
        hasConfig: !!flow?.config
      };
    });
    return { flows, count: flows.length };
  }

  async listTools() {
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
    return { tools, count: tools.length };
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

  async restartServer() {
    return await serverLifecycle.restart();
  }

  getServerLogs(limit = null, level = 'all') {
    let logs = logManager.getLogs(limit);

    if (level !== 'all') {
      logs = logs.filter(log => log.level === level);
    }

    const stats = logManager.getStats();
    return {
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
  }

  clearServerLogs() {
    logManager.clear();
    return {
      success: true,
      message: 'Server logs cleared',
      stats: logManager.getStats()
    };
  }

  async handleToolCall(toolName, input) {
    logger.debug('[MCPTools] Handling tool call:', toolName);

    switch (toolName) {
      case 'execute_task':
        return await this.executeTask(input.taskName, input.input, input.timeout);

      case 'execute_flow':
        return await this.executeFlow(input.flowName, input.input, input.timeout);

      case 'execute_tool':
        return await this.executeTool(input.category, input.toolName, input.input);

      case 'list_tasks':
        return await this.listTasks();

      case 'list_flows':
        return await this.listFlows();

      case 'list_tools':
        return await this.listTools();

      case 'get_execution_history':
        return this.getExecutionHistory(input.entityType, input.limit);

      case 'get_server_status':
        return this.getServerStatus();

      case 'start_server':
        return await this.startServer();

      case 'stop_server':
        return await this.stopServer();

      case 'restart_server':
        return await this.restartServer();

      case 'get_server_logs':
        return this.getServerLogs(input.limit, input.level);

      case 'clear_server_logs':
        return this.clearServerLogs();

      default:
        throw new Error(`Unknown tool: ${toolName}`);
    }
  }
}

export const mcpTools = new MCPTools();
