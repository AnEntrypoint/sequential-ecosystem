#!/usr/bin/env node
/**
 * GXE Dispatcher: Webhook Flow Trigger
 * Triggers flow execution via webhook-style invocation
 *
 * Usage: gxe . webhook:flow --flowName=myFlow --input='{"data":"value"}'
 */

import { createFlowService } from '@sequentialos/execution-service-unified';
import { flowRegistry } from '@sequentialos/flow-registry';
import logger from '@sequentialos/sequential-logging';

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

// Load flow registry and execute
await flowRegistry.loadAll();
const flowService = createFlowService();

const result = await flowService.execute(args.flowName, args.input || {}, {
  id: args.flowId,
  broadcast: true
});

logger.info(JSON.stringify(result, null, 2));
process.exit(result.success ? 0 : 1);
