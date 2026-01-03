import readline from 'readline';
import logger from 'sequential-logging';
import { mcpServer } from './mcp-server.js';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

async function handleLine(line) {
  if (!line.trim()) {
    return;
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
    return;
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

async function main() {
  logger.info('[MCP] Starting MCP stdio server...');

  try {
    await mcpServer.initialize();
    logger.info('[MCP] MCP server initialized, ready for requests');
  } catch (err) {
    logger.error('[MCP] Initialization failed:', err);
    process.exit(1);
  }

  rl.on('line', (line) => {
    handleLine(line).catch(err => {
      logger.error('[MCP] Unhandled error:', err);
    });
  });

  rl.on('close', () => {
    logger.info('[MCP] Input stream closed, shutting down');
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    logger.info('[MCP] SIGTERM received, shutting down');
    rl.close();
    process.exit(0);
  });

  process.on('SIGINT', () => {
    logger.info('[MCP] SIGINT received, shutting down');
    rl.close();
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
