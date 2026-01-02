import logger from 'sequential-logging';
import { mcpResources } from './mcp-resources.js';
import { mcpTools } from './mcp-tools.js';
import { serverLifecycle } from './server-lifecycle.js';
import { taskRegistry } from 'task-registry';
import { flowRegistry } from 'flow-registry';
import { toolRegistry } from 'tool-registry';
import { hotReloadManager } from 'hot-reload-manager';

export class MCPServer {
  constructor() {
    this.isInitialized = false;
    this.protocolVersion = '2024-11-05';
    this.serverName = 'sequential-ecosystem';
    this.serverVersion = '1.0.0';
  }

  async initialize() {
    if (this.isInitialized) {
      logger.warn('[MCPServer] Already initialized, skipping');
      return;
    }

    logger.info('[MCPServer] Initializing MCP server...');

    try {
      await taskRegistry.loadAll();
      await flowRegistry.loadAll();
      await toolRegistry.loadAll();

      hotReloadManager.on('reload', async () => {
        logger.info('[MCPServer] Registry reload triggered, updating resources');
      });

      this.isInitialized = true;
      logger.info('[MCPServer] Initialization complete');
    } catch (err) {
      logger.error('[MCPServer] Initialization failed:', err);
      throw err;
    }
  }

  getServerInfo() {
    return {
      protocolVersion: this.protocolVersion,
      capabilities: {
        resources: {
          listChanged: true,
          subscribe: true
        },
        tools: {
          listChanged: true
        }
      },
      serverName: this.serverName,
      serverVersion: this.serverVersion
    };
  }

  async listResources() {
    await this.ensureInitialized();
    return await mcpResources.getResourcesList();
  }

  async readResource(uri) {
    await this.ensureInitialized();
    return await mcpResources.readResource(uri);
  }

  async listTools() {
    await this.ensureInitialized();
    return {
      tools: mcpTools.getToolDefinitions()
    };
  }

  async callTool(toolName, input) {
    await this.ensureInitialized();
    logger.info('[MCPServer] Calling tool:', toolName);

    try {
      const result = await mcpTools.handleToolCall(toolName, input);
      return {
        toolName,
        result,
        timestamp: new Date().toISOString()
      };
    } catch (err) {
      logger.error('[MCPServer] Tool call failed:', toolName, err);
      return {
        toolName,
        error: {
          message: err.message,
          code: 'TOOL_EXECUTION_ERROR'
        },
        timestamp: new Date().toISOString()
      };
    }
  }

  async ensureInitialized() {
    if (!this.isInitialized) {
      await this.initialize();
    }
  }

  async startup() {
    logger.info('[MCPServer] Starting MCP server startup...');

    try {
      await this.initialize();
      const info = this.getServerInfo();
      logger.info(`[MCPServer] Server ready: ${info.serverName}/${info.serverVersion}`);
      return {
        success: true,
        message: 'MCP server initialized successfully',
        serverInfo: info
      };
    } catch (err) {
      logger.error('[MCPServer] Startup failed:', err);
      throw err;
    }
  }

  async shutdown() {
    logger.info('[MCPServer] Shutting down MCP server...');

    try {
      if (serverLifecycle.isRunning) {
        await serverLifecycle.stop();
      }
      logger.info('[MCPServer] Shutdown complete');
      return { success: true, message: 'MCP server shutdown successfully' };
    } catch (err) {
      logger.error('[MCPServer] Shutdown error:', err);
      throw err;
    }
  }

  async handleJsonRpc(request) {
    const { jsonrpc, id, method, params } = request;

    if (jsonrpc !== '2.0') {
      return {
        jsonrpc: '2.0',
        id,
        error: { code: -32700, message: 'Invalid JSON-RPC version' }
      };
    }

    try {
      let result;

      switch (method) {
        case 'initialize':
          result = await this.startup();
          break;

        case 'shutdown':
          result = await this.shutdown();
          break;

        case 'resources/list':
          result = await this.listResources();
          break;

        case 'resources/read':
          result = await this.readResource(params.uri);
          break;

        case 'tools/list':
          result = await this.listTools();
          break;

        case 'tools/call':
          result = await this.callTool(params.name, params.arguments || {});
          break;

        case 'tools/call/async':
          result = await this.callTool(params.name, params.arguments || {});
          break;

        default:
          return {
            jsonrpc: '2.0',
            id,
            error: { code: -32601, message: `Unknown method: ${method}` }
          };
      }

      return {
        jsonrpc: '2.0',
        id,
        result
      };
    } catch (err) {
      logger.error('[MCPServer] Request handling error:', err);
      return {
        jsonrpc: '2.0',
        id,
        error: { code: -32603, message: err.message || 'Internal server error' }
      };
    }
  }
}

export const mcpServer = new MCPServer();

export async function createMCPServer() {
  const server = new MCPServer();
  await server.initialize();
  return server;
}
