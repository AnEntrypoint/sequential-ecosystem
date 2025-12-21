/**
 * Usage Examples for @sequentialos/task-execution-service
 *
 * Run this file: node examples.js
 */

import { TaskService, FlowService } from './src/index.js';

async function runExamples() {
  console.log('=== Task Execution Service Examples ===\n');

  // ============================================
  // Example 1: Basic Task Registration and Execution
  // ============================================
  console.log('Example 1: Basic Task Execution');
  const taskService = new TaskService();

  taskService.registerTask('greet', async (input) => {
    return {
      message: `Hello, ${input.name}!`,
      timestamp: new Date().toISOString()
    };
  });

  const greetResult = await taskService.executeTask('greet', { name: 'World' });
  console.log('Result:', JSON.stringify(greetResult, null, 2));
  console.log();

  // ============================================
  // Example 2: Task with Options
  // ============================================
  console.log('Example 2: Task with Custom Options');

  taskService.registerTask('calculate', async (input) => {
    const { operation, a, b } = input;
    let result;

    switch (operation) {
      case 'add': result = a + b; break;
      case 'subtract': result = a - b; break;
      case 'multiply': result = a * b; break;
      case 'divide': result = a / b; break;
      default: throw new Error('Unknown operation');
    }

    return { operation, result };
  });

  const calcResult = await taskService.executeTask('calculate', {
    operation: 'multiply',
    a: 7,
    b: 6
  }, {
    runId: 'calc-001',
    broadcast: true,
    timeout: 5000
  });

  console.log('Result:', calcResult.data);
  console.log('Duration:', calcResult.duration, 'ms');
  console.log();

  // ============================================
  // Example 3: Unregistered Task (Mock Response)
  // ============================================
  console.log('Example 3: Unregistered Task (Mock)');

  const mockResult = await taskService.executeTask('non-existent-task', {
    test: 'data'
  });

  console.log('Is mock:', mockResult.data.mock);
  console.log('Message:', mockResult.data.message);
  console.log();

  // ============================================
  // Example 4: Flow Execution
  // ============================================
  console.log('Example 4: Flow Execution');
  const flowService = new FlowService();

  flowService.registerFlow('data-processing-pipeline', async (input, context) => {
    const steps = [];

    // Step 1: Validate input
    steps.push({
      name: 'validate',
      status: 'completed',
      output: { valid: true, fields: Object.keys(input) }
    });

    // Step 2: Transform data
    const transformed = {
      ...input,
      processed: true,
      timestamp: new Date().toISOString()
    };
    steps.push({
      name: 'transform',
      status: 'completed',
      output: transformed
    });

    // Step 3: Store results
    steps.push({
      name: 'store',
      status: 'completed',
      output: { stored: true, recordId: 'rec_123' }
    });

    return {
      pipelineId: context.flowId,
      status: 'success',
      steps,
      finalOutput: transformed
    };
  });

  const flowResult = await flowService.executeFlow('data-processing-pipeline', {
    userId: 123,
    data: { name: 'John Doe', email: 'john@example.com' }
  }, {
    flowId: 'flow-pipeline-001',
    broadcast: false
  });

  console.log('Flow status:', flowResult.data.status);
  console.log('Steps completed:', flowResult.data.steps.length);
  console.log('Final output:', flowResult.data.finalOutput);
  console.log();

  // ============================================
  // Example 5: Error Handling
  // ============================================
  console.log('Example 5: Error Handling');

  taskService.registerTask('risky-operation', async (input) => {
    if (input.shouldFail) {
      throw new Error('Operation failed as requested');
    }
    return { success: true };
  });

  try {
    await taskService.executeTask('risky-operation', { shouldFail: true });
  } catch (error) {
    console.log('Caught error:', error.message);

    // Error is also in execution history
    const history = taskService.getExecutionHistory({ success: false });
    console.log('Failed executions in history:', history.length);
  }
  console.log();

  // ============================================
  // Example 6: Execution History
  // ============================================
  console.log('Example 6: Execution History');

  const allHistory = taskService.getExecutionHistory();
  console.log('Total task executions:', allHistory.length);

  const successfulTasks = taskService.getExecutionHistory({ success: true });
  console.log('Successful executions:', successfulTasks.length);

  const calcHistory = taskService.getExecutionHistory({ taskName: 'calculate' });
  console.log('Calculate task executions:', calcHistory.length);
  console.log();

  // ============================================
  // Example 7: Integration with GXE Webhook
  // ============================================
  console.log('Example 7: GXE Webhook Simulation');
  console.log('To execute via GXE webhook:');
  console.log('  gxe . webhook:task --taskName=greet --input=\'{"name":"Alice"}\'');
  console.log('  gxe . webhook:flow --flowName=data-processing-pipeline --input=\'{"userId":456}\'');
  console.log();

  console.log('=== Examples Complete ===');
}

// Run examples
runExamples().catch(err => {
  console.error('Example failed:', err);
  process.exit(1);
});
