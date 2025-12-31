#!/usr/bin/env node
/**
 * GXE Dispatcher: Webhook Tool Trigger
 * Triggers tool execution via webhook-style invocation
 *
 * Usage: gxe . webhook:tool --category=myCategory --toolName=myTool --input='{"data":"value"}'
 */

import { toolRegistry } from '@sequentialos/tool-registry';
import { executeTool } from '@sequentialos/tool-executor';
import { nanoid } from 'nanoid';
import logger from '@sequentialos/sequential-logging';

// Parse arguments
const args = {};
for (let i = 0; i < process.argv.length; i++) {
  const arg = process.argv[i];
  if (arg.startsWith('--category=')) args.category = arg.split('=')[1];
  if (arg.startsWith('--toolName=')) args.toolName = arg.split('=')[1];
  if (arg.startsWith('--input=')) {
    try {
      args.input = JSON.parse(arg.split('=').slice(1).join('='));
    } catch (e) {
      args.input = {};
    }
  }
  if (arg.startsWith('--toolId=')) args.toolId = arg.split('=')[1];
}

// Default category
args.category = args.category || 'default';

// Validate required arguments
if (!args.toolName) {
  logger.error('Error: toolName is required');
  logger.error('Usage: gxe . webhook:tool --category=myCategory --toolName=myTool --input=\'{...}\'');
  process.exit(1);
}

// Load tool registry and execute
await toolRegistry.loadAll();

const startTime = new Date().toISOString();
try {
  const toolResult = await executeTool(args.category, args.toolName, args.input || {});
  const endTime = new Date().toISOString();

  const result = {
    success: true,
    data: toolResult,
    id: `tool-${args.toolId || nanoid(9)}`,
    name: args.toolName,
    category: args.category,
    type: 'tool',
    startTime,
    endTime,
    duration: new Date(endTime) - new Date(startTime)
  };

  logger.info(JSON.stringify(result, null, 2));
  process.exit(0);
} catch (err) {
  const endTime = new Date().toISOString();
  const result = {
    success: false,
    error: { message: err.message },
    id: `tool-${args.toolId || nanoid(9)}`,
    name: args.toolName,
    category: args.category,
    type: 'tool',
    startTime,
    endTime,
    duration: new Date(endTime) - new Date(startTime)
  };

  logger.error(`Tool execution failed: ${err.message}`);
  logger.info(JSON.stringify(result, null, 2));
  process.exit(1);
}
