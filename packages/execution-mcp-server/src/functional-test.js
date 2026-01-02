import logger from 'sequential-logging';
import { mcpServer } from './mcp-server.js';
import { mcpTools } from './mcp-tools.js';
import { mcpResources } from './mcp-resources.js';

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function testResourceOperations() {
  console.log('\n=== Testing Resource Operations ===\n');

  logger.info('Testing resource listing...');
  const resourcesList = await mcpResources.getResourcesList();
  console.log(`Total resources: ${resourcesList.resources.length}`);

  const taskResources = resourcesList.resources.filter(r => r.uri.startsWith('task://'));
  const flowResources = resourcesList.resources.filter(r => r.uri.startsWith('flow://'));
  const toolResources = resourcesList.resources.filter(r => r.uri.startsWith('tool://'));

  console.log(`Task resources: ${taskResources.length}`);
  console.log(`Flow resources: ${flowResources.length}`);
  console.log(`Tool resources: ${toolResources.length}`);

  if (taskResources.length === 0) {
    throw new Error('Should have task resources');
  }

  logger.info('Testing resource read for first task...');
  const taskUri = taskResources[0].uri;
  const taskResource = await mcpResources.readResource(taskUri);
  console.log(`Read resource: ${taskUri}`);
  console.log(`Content preview: ${taskResource.contents.slice(0, 100)}...`);

  if (!taskResource.contents) {
    throw new Error('Resource should have contents');
  }

  console.log('✓ Resource operations test passed\n');
}

async function testToolListing() {
  console.log('\n=== Testing Tool Definitions ===\n');

  logger.info('Getting tool definitions...');
  const tools = mcpTools.getToolDefinitions();
  console.log(`Total MCP tools: ${tools.length}`);

  const requiredTools = [
    'execute_task',
    'execute_flow',
    'execute_tool',
    'list_tasks',
    'list_flows',
    'list_tools',
    'get_execution_history',
    'get_server_status',
    'start_server',
    'stop_server',
    'restart_server'
  ];

  for (const requiredTool of requiredTools) {
    const found = tools.find(t => t.name === requiredTool);
    if (!found) {
      throw new Error(`Missing required tool: ${requiredTool}`);
    }
    console.log(`✓ ${requiredTool}`);
  }

  const exampleTool = tools.find(t => t.name === 'execute_task');
  console.log(`\nExample tool schema (execute_task):`);
  console.log(JSON.stringify(exampleTool.inputSchema, null, 2).slice(0, 300) + '...');

  console.log('\n✓ Tool definition test passed\n');
}

async function testTaskFlowToolListing() {
  console.log('\n=== Testing Entity Listing ===\n');

  logger.info('Listing registered tasks...');
  const tasks = mcpTools.listTasks();
  console.log(`Tasks: ${tasks.count}`);
  if (tasks.tasks.length > 0) {
    console.log(`  Example: ${tasks.tasks[0].name}`);
  }

  logger.info('Listing registered flows...');
  const flows = mcpTools.listFlows();
  console.log(`Flows: ${flows.count}`);
  if (flows.flows.length > 0) {
    console.log(`  Example: ${flows.flows[0].name}`);
  }

  logger.info('Listing registered tools...');
  const tools = mcpTools.listTools();
  console.log(`Tools: ${tools.count}`);
  if (tools.tools.length > 0) {
    console.log(`  Example: ${tools.tools[0].fullName}`);
  }

  if (tasks.count < 1) {
    throw new Error('Should have at least 1 task');
  }

  if (flows.count < 1) {
    throw new Error('Should have at least 1 flow');
  }

  if (tools.count < 1) {
    throw new Error('Should have at least 1 tool');
  }

  console.log('\n✓ Entity listing test passed\n');
}

async function testJsonRpcProtocol() {
  console.log('\n=== Testing JSON-RPC Protocol ===\n');

  const testCases = [
    {
      name: 'initialize',
      request: { jsonrpc: '2.0', id: 1, method: 'initialize', params: {} }
    },
    {
      name: 'resources/list',
      request: { jsonrpc: '2.0', id: 2, method: 'resources/list', params: {} }
    },
    {
      name: 'tools/list',
      request: { jsonrpc: '2.0', id: 3, method: 'tools/list', params: {} }
    },
    {
      name: 'tools/call (list_tasks)',
      request: {
        jsonrpc: '2.0',
        id: 4,
        method: 'tools/call',
        params: { name: 'list_tasks', arguments: {} }
      }
    },
    {
      name: 'tools/call (get_server_status)',
      request: {
        jsonrpc: '2.0',
        id: 5,
        method: 'tools/call',
        params: { name: 'get_server_status', arguments: {} }
      }
    },
    {
      name: 'invalid method (error case)',
      request: {
        jsonrpc: '2.0',
        id: 6,
        method: 'invalid/method',
        params: {}
      }
    }
  ];

  for (const testCase of testCases) {
    const response = await mcpServer.handleJsonRpc(testCase.request);

    if (testCase.name.includes('error')) {
      if (!response.error) {
        throw new Error(`Should have error for: ${testCase.name}`);
      }
      console.log(`✓ ${testCase.name} (error code: ${response.error.code})`);
    } else {
      if (!response.result && !response.error) {
        throw new Error(`Invalid response for: ${testCase.name}`);
      }
      if (response.error) {
        throw new Error(`Unexpected error for ${testCase.name}: ${response.error.message}`);
      }
      console.log(`✓ ${testCase.name}`);
    }
  }

  console.log('\n✓ JSON-RPC protocol test passed\n');
}

async function testExecutionHistory() {
  console.log('\n=== Testing Execution History ===\n');

  logger.info('Getting task execution history...');
  const taskHistory = await mcpTools.getExecutionHistory('task', 10);
  console.log(`Task history entries: ${taskHistory.count}`);
  console.log(`Total task executions tracked: ${taskHistory.totalCount}`);

  logger.info('Getting flow execution history...');
  const flowHistory = await mcpTools.getExecutionHistory('flow', 10);
  console.log(`Flow history entries: ${flowHistory.count}`);
  console.log(`Total flow executions tracked: ${flowHistory.totalCount}`);

  if (!Array.isArray(taskHistory.history)) {
    throw new Error('Task history should be an array');
  }

  if (!Array.isArray(flowHistory.history)) {
    throw new Error('Flow history should be an array');
  }

  console.log('\n✓ Execution history test passed\n');
}

async function testServerStatus() {
  console.log('\n=== Testing Server Status Endpoint ===\n');

  logger.info('Getting server status...');
  const status = mcpTools.getServerStatus();

  console.log(`Status: ${status.status}`);
  console.log(`Running: ${status.isRunning}`);
  console.log(`Uptime: ${status.uptime}s`);
  console.log(`Heap Used: ${status.heapUsedMB.toFixed(2)}MB`);
  console.log(`RSS: ${status.rssMB.toFixed(2)}MB`);
  console.log(`Startup Attempts: ${status.startupAttempts}`);
  console.log(`Restart Count: ${status.restartCount}`);

  if (typeof status.isRunning !== 'boolean') {
    throw new Error('Status should have isRunning boolean');
  }

  if (typeof status.heapUsedMB !== 'number') {
    throw new Error('Status should have heapUsedMB');
  }

  console.log('\n✓ Server status test passed\n');
}

async function runFunctionalTests() {
  try {
    logger.info('Starting functional test suite...\n');

    await mcpServer.initialize();
    logger.info('MCP Server initialized\n');

    await testResourceOperations();
    await testToolListing();
    await testTaskFlowToolListing();
    await testJsonRpcProtocol();
    await testExecutionHistory();
    await testServerStatus();

    console.log('='.repeat(60));
    console.log('All functional tests PASSED!');
    console.log('='.repeat(60));
    process.exit(0);
  } catch (err) {
    console.error('\n' + '='.repeat(60));
    console.error('Functional test FAILED:', err.message);
    console.error('='.repeat(60));
    process.exit(1);
  }
}

runFunctionalTests();
