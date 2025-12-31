#!/usr/bin/env node
/**
 * GXE Dispatcher: Webhook Task Trigger
 * Triggers task execution via webhook-style invocation
 *
 * Usage: gxe . webhook:task --taskName=myTask --input='{"data":"value"}'
 */

import { createTaskService } from '@sequentialos/execution-service-unified';
import { taskRegistry } from '@sequentialos/task-registry';
import { toolRegistry } from '@sequentialos/tool-registry';
import '@sequentialos/tool-dispatcher';
import logger from '@sequentialos/sequential-logging';

// Parse arguments
const args = {};
for (let i = 0; i < process.argv.length; i++) {
  const arg = process.argv[i];
  if (arg.startsWith('--taskName=')) args.taskName = arg.split('=')[1];
  if (arg.startsWith('--input=')) {
    try {
      args.input = JSON.parse(arg.split('=').slice(1).join('='));
    } catch (e) {
      console.error(JSON.stringify({
        success: false,
        error: {
          message: `Invalid JSON input: ${e.message}`,
          code: 'JSON_PARSE_ERROR'
        }
      }, null, 2));
      process.exit(1);
    }
  }
  if (arg.startsWith('--taskId=')) args.taskId = arg.split('=')[1];
}

// Validate required arguments
if (!args.taskName) {
  console.error(JSON.stringify({
    success: false,
    error: {
      message: 'taskName is required',
      code: 'MISSING_REQUIRED_PARAMETER'
    }
  }, null, 2));
  process.exit(1);
}

// Load registries and execute
await taskRegistry.loadAll();
await toolRegistry.loadAll();
const taskService = createTaskService();

// Register tasks from registry
for (const taskName of taskRegistry.list()) {
  const taskDef = taskRegistry.get(taskName);
  if (taskDef?.handler) {
    taskService.register(taskName, taskDef.handler);
  }
}

const result = await taskService.execute(args.taskName, args.input || {}, {
  id: args.taskId,
  broadcast: true
});

logger.info(JSON.stringify(result, null, 2));
process.exit(result.success ? 0 : 1);
