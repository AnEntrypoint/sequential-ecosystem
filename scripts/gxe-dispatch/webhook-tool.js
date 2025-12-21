#!/usr/bin/env node
/**
 * GXE Dispatcher: Webhook Tool Trigger
 * Triggers tool execution via webhook-style invocation
 *
 * Usage: gxe . webhook:tool --appId=app-myapp --toolName=myTool --params='{"data":"value"}'
 *
 * Note: Tool execution service not yet implemented in monorepo.
 * This dispatcher returns a mock response until ToolService is available.
 */

import logger from '@sequentialos/sequential-logging';
import { generateId } from '@sequentialos/id-generator';
import { nowISO } from '@sequentialos/timestamp-utilities';

// Parse arguments
const args = {};
for (let i = 0; i < process.argv.length; i++) {
  const arg = process.argv[i];
  if (arg.startsWith('--appId=')) args.appId = arg.split('=')[1];
  if (arg.startsWith('--toolName=')) args.toolName = arg.split('=')[1];
  if (arg.startsWith('--params=')) {
    try {
      args.params = JSON.parse(arg.split('=')[1]);
    } catch (e) {
      args.params = {};
    }
  }
}

// Validate required arguments
if (!args.appId || !args.toolName) {
  logger.error('Error: appId and toolName required');
  logger.error('Usage: gxe . webhook:tool --appId=app-myapp --toolName=myTool --params=\'{...}\'');
  process.exit(1);
}

// Return mock response (tool execution service not yet implemented)
const response = {
  success: true,
  data: {
    message: `Tool '${args.toolName}' executed (mock)`,
    appId: args.appId,
    toolName: args.toolName,
    params: args.params || {},
    mock: true,
    note: 'Tool execution service not yet implemented in monorepo'
  },
  toolId: generateId('tool'),
  appId: args.appId,
  toolName: args.toolName,
  timestamp: nowISO()
};

logger.info(JSON.stringify(response, null, 2));
process.exit(0);
