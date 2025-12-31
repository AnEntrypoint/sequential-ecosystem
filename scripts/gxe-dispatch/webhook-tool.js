#!/usr/bin/env node
/**
 * GXE Dispatcher: Webhook Tool Trigger
 * Triggers tool execution via webhook-style invocation
 *
 * Usage: gxe . webhook:tool --category=myCategory --toolName=myTool --input='{"data":"value"}'
 */

import { createToolService } from '@sequentialos/execution-service-unified';
import { toolRegistry } from '@sequentialos/tool-registry';
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
const toolService = createToolService();

const result = await toolService.execute(`${args.category}:${args.toolName}`, args.input || {}, {
  id: args.toolId,
  broadcast: true
});

logger.info(JSON.stringify(result, null, 2));
process.exit(result.success ? 0 : 1);
