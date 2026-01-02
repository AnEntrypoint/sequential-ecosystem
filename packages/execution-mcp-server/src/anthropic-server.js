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

const server = new Server({
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

server.setRequestHandler(InitializeRequestSchema, async (request) => {
  logger.info('[AnthropicServer] Initialize request received');

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
});

server.setRequestHandler(ListResourcesRequestSchema, async (request) => {
  logger.info('[AnthropicServer] Listing resources');
  return await mcpResources.getResourcesList();
});

server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  logger.info('[AnthropicServer] Reading resource:', request.params.uri);
  const resource = await mcpResources.readResource(request.params.uri);
  return {
    uri: resource.uri,
    mimeType: resource.mimeType,
    contents: typeof resource.contents === 'string'
      ? resource.contents
      : JSON.stringify(resource.contents)
  };
});

server.setRequestHandler(ListToolsRequestSchema, async (request) => {
  logger.info('[AnthropicServer] Listing tools');
  const definitions = mcpTools.getToolDefinitions();
  return {
    tools: definitions.map(def => ({
      name: def.name,
      description: def.description,
      inputSchema: def.inputSchema
    }))
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  logger.info('[AnthropicServer] Calling tool:', request.params.name);

  try {
    const result = await mcpTools.handleToolCall(request.params.name, request.params.arguments || {});
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2)
        }
      ]
    };
  } catch (err) {
    logger.error('[AnthropicServer] Tool call failed:', err);
    throw err;
  }
});

async function main() {
  const transport = new StdioServerTransport();

  logger.info('[AnthropicServer] Starting MCP stdio server with Anthropic SDK...');

  try {
    await server.connect(transport);
    logger.info('[AnthropicServer] MCP server connected to stdio transport');
  } catch (err) {
    logger.error('[AnthropicServer] Failed to connect:', err);
    process.exit(1);
  }

  process.on('SIGINT', () => {
    logger.info('[AnthropicServer] SIGINT received, shutting down gracefully');
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    logger.info('[AnthropicServer] SIGTERM received, shutting down gracefully');
    process.exit(0);
  });

  process.on('uncaughtException', (err) => {
    logger.error('[AnthropicServer] Uncaught exception:', err);
    process.exit(1);
  });

  process.on('unhandledRejection', (reason, promise) => {
    logger.error('[AnthropicServer] Unhandled rejection at:', promise, 'reason:', reason);
    process.exit(1);
  });
}

main().catch(err => {
  logger.error('[AnthropicServer] Fatal error:', err);
  process.exit(1);
});
