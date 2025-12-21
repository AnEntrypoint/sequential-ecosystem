#!/usr/bin/env node
/**
 * GXE Dispatcher: Webhook Flow Trigger
 * Triggers flow execution via webhook-style invocation
 *
 * Usage: gxe . webhook:flow --flowName=myFlow --input='{"data":"value"}'
 */

import { executeWebhook } from './lib/webhook-executor.js';

executeWebhook({
  argMapping: {
    flowName: 'FLOW_NAME',
    input: 'FLOW_INPUT',
    flowId: 'FLOW_ID'
  },
  requiredArgs: ['flowName'],
  usageExample: 'gxe . webhook:flow --flowName=myFlow --input=\'{...}\'',
  servicePath: 'packages/@sequentialos/task-execution-service/src/services/flow-service.js',
  methodName: 'executeFlow',
  errorCode: 'FLOW_EXECUTION_ERROR',
  buildMethodArgs: (args) => [
    args.flowName,
    args.input || {},
    { flowId: args.flowId, broadcast: true }
  ]
});
