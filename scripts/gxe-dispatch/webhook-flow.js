#!/usr/bin/env node
/**
 * GXE Dispatcher: Webhook Flow Trigger
 * Triggers flow execution via webhook-style invocation
 *
 * Usage: gxe . webhook:flow --flowName=myFlow --input='{"data":"value"}'
 */

import { flowRegistry } from '@sequentialos/flow-registry';
import { executeFlow } from '@sequentialos/flow-executor';
import { taskRegistry } from '@sequentialos/task-registry';
import logger from '@sequentialos/sequential-logging';
import { nanoid } from 'nanoid';

// Parse arguments
const args = {};
for (let i = 0; i < process.argv.length; i++) {
  const arg = process.argv[i];
  if (arg.startsWith('--flowName=')) args.flowName = arg.split('=')[1];
  if (arg.startsWith('--input=')) {
    try {
      args.input = JSON.parse(arg.split('=').slice(1).join('='));
    } catch (e) {
      args.input = {};
    }
  }
  if (arg.startsWith('--flowId=')) args.flowId = arg.split('=')[1];
}

// Validate required arguments
if (!args.flowName) {
  logger.error('Error: flowName is required');
  logger.error('Usage: gxe . webhook:flow --flowName=myFlow --input=\'{...}\'');
  process.exit(1);
}

// Load registries and execute
await flowRegistry.loadAll();
await taskRegistry.loadAll();

const flowEntry = flowRegistry.get(args.flowName);
if (!flowEntry) {
  logger.error(`Flow not found: ${args.flowName}`);
  process.exit(1);
}

const startTime = new Date().toISOString();
try {
  const flowResult = await executeFlow(flowEntry.config, args.input || {});
  const endTime = new Date().toISOString();

  const result = {
    success: flowResult.success,
    data: flowResult,
    id: `flow-${args.flowId || nanoid(9)}`,
    name: args.flowName,
    type: 'flow',
    startTime,
    endTime,
    duration: new Date(endTime) - new Date(startTime)
  };

  logger.info(JSON.stringify(result, null, 2));
  process.exit(result.success ? 0 : 1);
} catch (err) {
  const endTime = new Date().toISOString();
  const result = {
    success: false,
    error: { message: err.message },
    id: `flow-${args.flowId || nanoid(9)}`,
    name: args.flowName,
    type: 'flow',
    startTime,
    endTime,
    duration: new Date(endTime) - new Date(startTime)
  };

  logger.error(`Flow execution failed: ${err.message}`);
  logger.info(JSON.stringify(result, null, 2));
  process.exit(1);
}
