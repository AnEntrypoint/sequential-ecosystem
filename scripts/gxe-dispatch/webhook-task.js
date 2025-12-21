#!/usr/bin/env node
/**
 * GXE Dispatcher: Webhook Task Trigger
 * Triggers task execution via webhook-style invocation
 *
 * Usage: gxe . webhook:task --taskName=myTask --input='{"data":"value"}'
 */

import { executeWebhook } from './lib/webhook-executor.js';

executeWebhook({
  argMapping: {
    taskName: 'TASK_NAME',
    input: 'TASK_INPUT',
    taskId: 'TASK_ID'
  },
  requiredArgs: ['taskName'],
  usageExample: 'gxe . webhook:task --taskName=myTask --input=\'{...}\'',
  servicePath: 'packages/@sequentialos/task-execution-service/src/services/task-service.js',
  methodName: 'executeTask',
  errorCode: 'TASK_EXECUTION_ERROR',
  buildMethodArgs: (args) => [
    args.taskName,
    args.input || {},
    { runId: args.taskId, broadcast: true }
  ]
});
