#!/usr/bin/env node
/**
 * GXE Dispatcher: Main Entry Point
 * Routes GXE commands to appropriate handlers
 *
 * Available commands:
 * - desktop-server: Start desktop server
 * - webhook:task: Trigger task execution
 * - webhook:flow: Trigger flow execution
 * - webhook:tool: Trigger tool execution
 * - cli: Start interactive CLI
 */

import { spawn } from 'child_process';
import path from 'path';
import { getModulePaths } from '@sequentialos/es-module-utils';
import logger from '@sequentialos/sequential-logging';

const { __dirname, __filename } = getModulePaths(import.meta.url);

const args = process.argv.slice(2);
const command = args[0] || 'desktop-server';
const commandArgs = args.slice(1);

const dispatchers = {
  'desktop-server': 'desktop-server.js',
  'webhook:task': 'webhook-task.js',
  'webhook:flow': 'webhook-flow.js',
  'webhook:tool': 'webhook-tool.js',
  'cli': 'cli.js'
};

const dispatcher = dispatchers[command];

if (!dispatcher) {
  logger.error(`Unknown command: ${command}`);
  logger.error(`Available commands: ${Object.keys(dispatchers).join(', ')}`);
  process.exit(1);
}

const dispatcherPath = path.join(__dirname, 'gxe-dispatch', dispatcher);
const proc = spawn('node', [dispatcherPath, ...commandArgs], {
  stdio: 'inherit'
});

proc.on('exit', (code) => {
  process.exit(code || 0);
});

proc.on('error', (err) => {
  logger.error(`Error running ${command}:`, err.message);
  process.exit(1);
});
