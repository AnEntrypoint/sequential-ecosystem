#!/usr/bin/env node
/**
 * GXE Dispatcher: Webhook Task Trigger
 * Triggers task execution via webhook-style invocation
 * 
 * Usage: gxe . webhook:task --taskName=myTask --input='{"data":"value"}'
 * 
 * Environment Variables:
 * - TASK_NAME: The task to execute
 * - TASK_INPUT: JSON input for the task (string or file path)
 * - TASK_ID: Optional run ID (auto-generated if omitted)
 * - AWAIT_RESULT: Wait for completion (true/false)
 */

const path = require('path');
const fs = require('fs');

async function executeTask() {
  // Parse arguments
  let taskName = process.env.TASK_NAME;
  let taskInput = process.env.TASK_INPUT;
  const taskId = process.env.TASK_ID;
  const awaitResult = (process.env.AWAIT_RESULT || 'true').toLowerCase() === 'true';
  
  // Parse CLI args for gxe compatibility
  for (let i = 0; i < process.argv.length; i++) {
    if (process.argv[i].startsWith('--taskName=')) {
      taskName = process.argv[i].split('=')[1];
    } else if (process.argv[i].startsWith('--input=')) {
      taskInput = process.argv[i].split('=')[1];
    }
  }
  
  if (!taskName) {
    console.error('Error: taskName required');
    console.error('Usage: gxe . webhook:task --taskName=myTask --input=\'{...}\'');
    process.exit(1);
  }
  
  try {
    // Parse input JSON
    let input = {};
    if (taskInput) {
      try {
        // Try to parse as JSON
        input = JSON.parse(taskInput);
      } catch (e) {
        // Try to read from file
        try {
          const fileContent = fs.readFileSync(taskInput, 'utf-8');
          input = JSON.parse(fileContent);
        } catch (fileErr) {
          console.error('Invalid JSON input or file:', taskInput);
          process.exit(1);
        }
      }
    }
    
    // Import TaskService
    const TaskServiceModule = require(path.join(__dirname, '../../packages/@sequentialos/task-execution-service/src/services/task-service.js'));
    const TaskService = TaskServiceModule.TaskService || TaskServiceModule.default;
    
    if (!TaskService) {
      throw new Error('Could not import TaskService');
    }
    
    // Execute task
    const taskService = new TaskService();
    const result = await taskService.executeTask(taskName, input, {
      runId: taskId,
      broadcast: true
    });
    
    // Output result
    console.log(JSON.stringify(result, null, 2));
    process.exit(0);
  } catch (error) {
    console.error(JSON.stringify({
      success: false,
      error: {
        message: error.message,
        code: 'TASK_EXECUTION_ERROR'
      }
    }, null, 2));
    process.exit(1);
  }
}

executeTask();
