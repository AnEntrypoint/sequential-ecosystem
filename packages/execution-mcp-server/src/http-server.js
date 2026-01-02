import http from 'http';
import logger from 'sequential-logging';
import { mcpServer } from './mcp-server.js';
import { serverLifecycle } from './server-lifecycle.js';

const PORT_MCP = parseInt(process.env.PORT_MCP || '9000');
const HOST = process.env.HOST || 'localhost';

let server = null;

async function handleJsonRpcRequest(req, res) {
  if (req.method !== 'POST') {
    res.writeHead(405, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Method Not Allowed' }));
    return;
  }

  let body = '';

  req.on('data', chunk => {
    body += chunk.toString();
  });

  req.on('end', async () => {
    try {
      let request;
      try {
        request = JSON.parse(body);
      } catch {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          jsonrpc: '2.0',
          id: null,
          error: { code: -32700, message: 'Parse error' }
        }));
        return;
      }

      const response = await mcpServer.handleJsonRpc(request);

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(response));
    } catch (err) {
      logger.error('[HTTPServer] Request handling error:', err);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        jsonrpc: '2.0',
        id: null,
        error: { code: -32603, message: 'Internal server error' }
      }));
    }
  });
}

export async function startHttpServer() {
  return new Promise((resolve, reject) => {
    try {
      server = http.createServer(handleJsonRpcRequest);

      server.listen(PORT_MCP, HOST, async () => {
        try {
          await mcpServer.initialize();
          logger.info(`[HTTPServer] MCP HTTP server listening on http://${HOST}:${PORT_MCP}`);
          resolve({
            success: true,
            message: 'MCP HTTP server started',
            host: HOST,
            port: PORT_MCP,
            url: `http://${HOST}:${PORT_MCP}`
          });
        } catch (err) {
          logger.error('[HTTPServer] Failed to initialize MCP server:', err);
          reject(err);
        }
      });

      server.on('error', (err) => {
        logger.error('[HTTPServer] Server error:', err);
        reject(err);
      });
    } catch (err) {
      logger.error('[HTTPServer] Failed to create server:', err);
      reject(err);
    }
  });
}

export async function stopHttpServer() {
  return new Promise((resolve, reject) => {
    if (!server) {
      resolve({ success: true, message: 'Server not running' });
      return;
    }

    server.close((err) => {
      if (err) {
        logger.error('[HTTPServer] Error closing server:', err);
        reject(err);
      } else {
        logger.info('[HTTPServer] MCP HTTP server stopped');
        resolve({ success: true, message: 'MCP HTTP server stopped' });
      }
    });
  });
}

async function main() {
  try {
    await startHttpServer();
    logger.info('[HTTPServer] Ready for JSON-RPC 2.0 requests');

    process.on('SIGTERM', async () => {
      logger.info('[HTTPServer] SIGTERM received, shutting down...');
      await stopHttpServer();
      process.exit(0);
    });

    process.on('SIGINT', async () => {
      logger.info('[HTTPServer] SIGINT received, shutting down...');
      await stopHttpServer();
      process.exit(0);
    });
  } catch (err) {
    logger.error('[HTTPServer] Fatal error:', err);
    process.exit(1);
  }
}

main();
