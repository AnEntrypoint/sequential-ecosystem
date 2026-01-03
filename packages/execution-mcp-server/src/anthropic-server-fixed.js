import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  InitializeRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
  ListToolsRequestSchema,
  CallToolRequestSchema
} from '@modelcontextprotocol/sdk/types.js';
import logger from 'sequential-logging';
import { mcpResources } from './mcp-resources.js';
import { mcpTools } from './mcp-tools.js';
import { mcpServer } from './mcp-server.js';

let serverInstance;

async function createAndConnectServer() {
  serverInstance = new Server({
    name: 'sequential-ecosystem',
    version: '1.0.0'
  }, {
    capabilities: {
      resources: {
        listChanged: true,
        subscribe: true
      },
      tools: {
        listChanged: true
      }
    }
  });

  serverInstance.setRequestHandler(InitializeRequestSchema, async (request) => {
    logger.info('[MCP] Initialize request received');

    try {
      await mcpServer.initialize();

      return {
        protocolVersion: '2024-11-05',
        capabilities: {
          resources: {
            listChanged: true,
            subscribe: true
          },
          tools: {
            listChanged: true
          }
        },
        serverInfo: {
          name: 'sequential-ecosystem',
          version: '1.0.0'
        }
      };
    } catch (err) {
      logger.error('[MCP] Initialize failed:', err);
      throw err;
    }
  });

  serverInstance.setRequestHandler(ListResourcesRequestSchema, async (request) => {
    logger.info('[MCP] Listing resources');

    try {
      const result = await mcpResources.getResourcesList();
      return result;
    } catch (err) {
      logger.error('[MCP] List resources failed:', err);
      throw err;
    }
  });

  serverInstance.setRequestHandler(ReadResourceRequestSchema, async (request) => {
    logger.info('[MCP] Reading resource:', request.params.uri);

    try {
      const resource = await mcpResources.readResource(request.params.uri);
      return {
        uri: resource.uri,
        mimeType: resource.mimeType,
        contents: typeof resource.contents === 'string'
          ? resource.contents
          : JSON.stringify(resource.contents)
      };
    } catch (err) {
      logger.error('[MCP] Read resource failed:', err);
      throw err;
    }
  });

  serverInstance.setRequestHandler(ListToolsRequestSchema, async (request) => {
    logger.info('[MCP] Listing tools');

    try {
      const definitions = mcpTools.getToolDefinitions();
      return {
        tools: definitions.map(def => ({
          name: def.name,
          description: def.description,
          inputSchema: def.inputSchema
        }))
      };
    } catch (err) {
      logger.error('[MCP] List tools failed:', err);
      throw err;
    }
  });

  serverInstance.setRequestHandler(CallToolRequestSchema, async (request) => {
    logger.info('[MCP] Calling tool:', request.params.name);

    try {
      const result = await mcpTools.handleToolCall(request.params.name, request.params.arguments || {});
      return {
        content: [
          {
            type: 'text',
            text: typeof result === 'string' ? result : JSON.stringify(result, null, 2)
          }
        ]
      };
    } catch (err) {
      logger.error('[MCP] Tool call failed:', err);
      throw err;
    }
  });

  const transport = new StdioServerTransport();

  logger.info('[MCP] Starting MCP stdio server...');

  try {
    await serverInstance.connect(transport);
    logger.info('[MCP] MCP server connected to stdio transport');
  } catch (err) {
    logger.error('[MCP] Failed to connect:', err);
    globalThis.process.exit(1);
  }
}

async function setupSignalHandlers() {
  const gracefulShutdown = async (signal) => {
    logger.info(`[MCP] ${signal} received, shutting down gracefully`);

    try {
      if (serverInstance) {
        logger.info('[MCP] Closing server connections...');
      }

      logger.info('[MCP] Shutdown complete');
      globalThis.process.exit(0);
    } catch (err) {
      logger.error('[MCP] Shutdown error:', err);
      globalThis.process.exit(1);
    }
  };

  globalThis.process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  globalThis.process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

  globalThis.process.on('uncaughtException', (err) => {
    logger.error('[MCP] Uncaught exception:', err);
    globalThis.process.exit(1);
  });

  globalThis.process.on('unhandledRejection', (reason) => {
    logger.error('[MCP] Unhandled rejection:', reason);
    globalThis.process.exit(1);
  });

  globalThis.process.stdout.on('error', (err) => {
    if (err.code !== 'EPIPE') {
      logger.error('[MCP] stdout error:', err);
    }
  });

  globalThis.process.stderr.on('error', (err) => {
    if (err.code !== 'EPIPE') {
      logger.error('[MCP] stderr error:', err);
    }
  });
}

async function main() {
  try {
    await setupSignalHandlers();
    await createAndConnectServer();
  } catch (err) {
    logger.error('[MCP] Fatal error:', err);
    globalThis.process.exit(1);
  }
}

main();
