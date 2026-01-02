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
    console.log(JSON.stringify(response));
    return;
  }

  try {
    const response = await mcpServer.handleJsonRpc(request);
    console.log(JSON.stringify(response));
  } catch (err) {
    logger.error('[StdioServer] Request handling error:', err);
    const response = {
      jsonrpc: '2.0',
      id: request.id || null,
      error: { code: -32603, message: 'Internal server error' }
    };
    console.log(JSON.stringify(response));
  }
}

async function main() {
  logger.info('[StdioServer] Starting MCP stdio server...');

  try {
    await mcpServer.initialize();
    logger.info('[StdioServer] MCP server initialized, waiting for input');
  } catch (err) {
    logger.error('[StdioServer] Initialization failed:', err);
    process.exit(1);
  }

  rl.on('line', (line) => {
    handleLine(line).catch(err => {
      logger.error('[StdioServer] Unhandled error:', err);
    });
  });

  rl.on('close', () => {
    logger.info('[StdioServer] Input stream closed, shutting down');
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    logger.info('[StdioServer] SIGTERM received, shutting down');
    rl.close();
    process.exit(0);
  });

  process.on('SIGINT', () => {
    logger.info('[StdioServer] SIGINT received, shutting down');
    rl.close();
    process.exit(0);
  });
}

main().catch(err => {
  logger.error('[StdioServer] Fatal error:', err);
  process.exit(1);
});
