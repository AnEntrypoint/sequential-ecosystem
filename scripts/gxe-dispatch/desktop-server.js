#!/usr/bin/env node
/**
 * GXE Dispatcher: Desktop Server
 * Starts the Sequential Ecosystem desktop server
 *
 * Usage: gxe . desktop-server [--port=3001] [--host=localhost]
 */

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import logger from '@sequentialos/sequential-logging';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const port = process.env.PORT || process.argv.find(arg => arg.startsWith('--port='))?.split('=')[1] || '8003';
  const host = process.env.HOST || 'localhost';

  logger.info(`Starting Sequential Ecosystem desktop server on ${host}:${port}`);

  // Start the server using the package's server.js
  const serverPath = path.join(__dirname, '../../packages/@sequentialos/desktop-server/src/server.js');

  const proc = spawn('node', [serverPath], {
    env: {
      ...process.env,
      PORT: port,
      HOST: host,
      NODE_ENV: process.env.NODE_ENV || 'development'
    },
    stdio: 'inherit'
  });

  proc.on('exit', (code) => {
    process.exit(code || 0);
  });

  proc.on('error', (err) => {
    logger.error('Server error:', err.message);
    process.exit(1);
  });
}

startServer().catch(err => {
  logger.error('Failed to start server:', err);
  process.exit(1);
});
