import logger from 'sequential-logging';
import { mcpServer } from './mcp-server.js';

let buffer = '';
const requestQueue = [];
let isProcessing = false;

async function processQueue() {
  while (requestQueue.length > 0) {
    isProcessing = true;
    const line = requestQueue.shift();

    if (!line.trim()) {
      continue;
    }

    let request;
    try {
      request = JSON.parse(line);
    } catch (err) {
      const response = {
        jsonrpc: '2.0',
        id: null,
        error: { code: -32700, message: 'Parse error' }
      };
      process.stdout.write(JSON.stringify(response) + '\n');
      continue;
    }

    try {
      const response = await mcpServer.handleJsonRpc(request);
      process.stdout.write(JSON.stringify(response) + '\n');
    } catch (err) {
      logger.error('[MCP] Request handling error:', err);
      const response = {
        jsonrpc: '2.0',
        id: request.id || null,
        error: { code: -32603, message: 'Internal server error' }
      };
      process.stdout.write(JSON.stringify(response) + '\n');
    }
  }
  isProcessing = false;
}

async function main() {
  logger.info('[MCP] Starting MCP stdio server...');

  try {
    await mcpServer.initialize();
    logger.info('[MCP] MCP server initialized, ready for requests');
  } catch (err) {
    logger.error('[MCP] Initialization failed:', err);
    process.exit(1);
  }

  process.stdin.on('data', (chunk) => {
    buffer += chunk.toString();
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      if (line.trim()) {
        requestQueue.push(line);
      }
    }

    if (!isProcessing) {
      processQueue().catch(err => {
        logger.error('[MCP] Queue processing error:', err);
      });
    }
  });

  process.stdin.on('end', () => {
    if (buffer.trim()) {
      requestQueue.push(buffer);
    }
    logger.info('[MCP] Input stream closed (keeping process alive for new connections)');
    process.stdin.pause();
  });

  setInterval(() => {}, 60000);

  process.on('SIGTERM', () => {
    logger.info('[MCP] SIGTERM received, shutting down');
    process.stdin.destroy();
    process.exit(0);
  });

  process.on('SIGINT', () => {
    logger.info('[MCP] SIGINT received, shutting down');
    process.stdin.destroy();
    process.exit(0);
  });

  process.on('uncaughtException', (err) => {
    logger.error('[MCP] Uncaught exception:', err);
    process.exit(1);
  });

  process.on('unhandledRejection', (reason) => {
    logger.error('[MCP] Unhandled rejection:', reason);
    process.exit(1);
  });
}

main().catch(err => {
  logger.error('[MCP] Fatal error:', err);
  process.exit(1);
});
