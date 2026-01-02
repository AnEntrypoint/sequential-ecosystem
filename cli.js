#!/usr/bin/env node
/**
 * Sequential Ecosystem CLI
 * Delegates to gxe-dispatch for all command execution
 * Commands:
 * - desktop-server: Start desktop server
 * - webhook:task: Trigger task via webhook
 * - webhook:flow: Trigger flow via webhook
 * - webhook:tool: Trigger tool via webhook
 */

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const args = process.argv.slice(2);

if (!args.length) {
  console.log('Sequential Ecosystem CLI');
  console.log('');
  console.log('Usage: seq [command] [options]');
  console.log('');
  console.log('Commands:');
  console.log('  desktop-server         Start desktop server');
  console.log('  webhook:task           Trigger task execution');
  console.log('  webhook:flow           Trigger flow execution');
  console.log('  webhook:tool           Trigger tool execution');
  console.log('');
  console.log('Examples:');
  console.log('  seq desktop-server --port=3000');
  console.log('  seq webhook:task --taskName=myTask --input=\'{}\'');
  process.exit(0);
}

const dispatcherScript = path.join(__dirname, 'scripts', 'gxe-dispatch.js');
const proc = spawn('node', [dispatcherScript, ...args], {
  stdio: 'inherit'
});

proc.on('exit', (code) => {
  process.exit(code || 0);
});

proc.on('error', (err) => {
  console.error('Error:', err.message);
  process.exit(1);
});
