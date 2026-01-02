import logger from 'sequential-logging';
import { mcpServer } from './mcp-server.js';
import { serverLifecycle } from './server-lifecycle.js';
import { mcpTools } from './mcp-tools.js';
import { mcpResources } from './mcp-resources.js';

const tests = [];
let passCount = 0;
let failCount = 0;

function test(name, fn) {
  tests.push({ name, fn });
}

async function assertEqual(actual, expected, message) {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(`${message}\nExpected: ${JSON.stringify(expected)}\nActual: ${JSON.stringify(actual)}`);
  }
}

function assertTrue(value, message) {
  if (!value) {
    throw new Error(message);
  }
}

async function runTests() {
  logger.info('Starting MCP Server Test Suite...\n');

  for (const { name, fn } of tests) {
    try {
      process.stdout.write(`Testing: ${name}... `);
      await fn();
      passCount += 1;
      console.log('PASS');
    } catch (err) {
      failCount += 1;
      console.log(`FAIL\n  ${err.message}\n`);
    }
  }

  console.log(`\n${'='.repeat(60)}`);
  console.log(`Test Results: ${passCount} passed, ${failCount} failed`);
  console.log(`${'='.repeat(60)}\n`);

  return failCount === 0;
}

test('MCP Server initialization', async () => {
  await mcpServer.initialize();
  assertTrue(mcpServer.isInitialized, 'Server should be initialized');
});

test('Get server info', () => {
  const info = mcpServer.getServerInfo();
  assertTrue(info.protocolVersion === '2024-11-05', 'Should have correct protocol version');
  assertTrue(info.serverName === 'sequential-ecosystem', 'Should have correct server name');
  assertTrue(info.capabilities.resources, 'Should have resources capability');
  assertTrue(info.capabilities.tools, 'Should have tools capability');
});

test('List resources', async () => {
  const result = await mcpServer.listResources();
  assertTrue(result.resources, 'Should return resources array');
  assertTrue(Array.isArray(result.resources), 'Resources should be an array');
  assertTrue(result.resources.length > 0, 'Should have at least one resource');
});

test('List tools', async () => {
  const result = await mcpServer.listTools();
  assertTrue(result.tools, 'Should return tools array');
  assertTrue(Array.isArray(result.tools), 'Tools should be an array');
  assertTrue(result.tools.length >= 10, 'Should have at least 10 tools');

  const toolNames = result.tools.map(t => t.name);
  assertTrue(toolNames.includes('execute_task'), 'Should include execute_task');
  assertTrue(toolNames.includes('execute_flow'), 'Should include execute_flow');
  assertTrue(toolNames.includes('execute_tool'), 'Should include execute_tool');
  assertTrue(toolNames.includes('list_tasks'), 'Should include list_tasks');
  assertTrue(toolNames.includes('start_server'), 'Should include start_server');
});

test('List tasks via tool', async () => {
  const result = await mcpTools.listTasks();
  assertTrue(result.tasks, 'Should return tasks');
  assertTrue(result.count >= 0, 'Should have task count');
});

test('List flows via tool', async () => {
  const result = await mcpTools.listFlows();
  assertTrue(result.flows, 'Should return flows');
  assertTrue(result.count >= 0, 'Should have flow count');
});

test('List tools via tool', async () => {
  const result = await mcpTools.listTools();
  assertTrue(result.tools, 'Should return tools');
  assertTrue(result.count >= 0, 'Should have tool count');
});

test('Get server status', () => {
  const status = mcpTools.getServerStatus();
  assertTrue(typeof status.isRunning === 'boolean', 'Should have isRunning boolean');
  assertTrue(status.status === 'stopped' || status.status === 'running', 'Should have valid status');
  assertTrue(typeof status.uptime === 'number', 'Should have uptime');
});

test('JSON-RPC request handling - initialize', async () => {
  const request = {
    jsonrpc: '2.0',
    id: 1,
    method: 'initialize',
    params: {}
  };

  const response = await mcpServer.handleJsonRpc(request);
  assertTrue(response.jsonrpc === '2.0', 'Should have JSON-RPC version');
  assertTrue(response.id === 1, 'Should have correct request ID');
  assertTrue(response.result, 'Should have result');
  assertTrue(response.result.message, 'Result should have message');
});

test('JSON-RPC request handling - resources/list', async () => {
  const request = {
    jsonrpc: '2.0',
    id: 2,
    method: 'resources/list',
    params: {}
  };

  const response = await mcpServer.handleJsonRpc(request);
  assertTrue(response.jsonrpc === '2.0', 'Should have JSON-RPC version');
  assertTrue(response.id === 2, 'Should have correct request ID');
  assertTrue(response.result.resources, 'Should have resources in result');
});

test('JSON-RPC request handling - tools/list', async () => {
  const request = {
    jsonrpc: '2.0',
    id: 3,
    method: 'tools/list',
    params: {}
  };

  const response = await mcpServer.handleJsonRpc(request);
  assertTrue(response.jsonrpc === '2.0', 'Should have JSON-RPC version');
  assertTrue(response.id === 3, 'Should have correct request ID');
  assertTrue(response.result.tools, 'Should have tools in result');
});

test('JSON-RPC request handling - invalid method', async () => {
  const request = {
    jsonrpc: '2.0',
    id: 4,
    method: 'invalid/method',
    params: {}
  };

  const response = await mcpServer.handleJsonRpc(request);
  assertTrue(response.error, 'Should have error');
  assertTrue(response.error.code === -32601, 'Should have correct error code');
});

test('Server lifecycle - get initial status', () => {
  const status = serverLifecycle.getStatus();
  assertTrue(status.isRunning === false, 'Should not be running initially');
  assertTrue(status.status === 'stopped', 'Status should be stopped');
});

test('Execution history tracking', async () => {
  const result = await mcpTools.getExecutionHistory('task', 10);
  assertTrue(result.entityType === 'task', 'Should return task history');
  assertTrue(Array.isArray(result.history), 'History should be an array');
});

async function runAllTests() {
  try {
    const success = await runTests();
    process.exit(success ? 0 : 1);
  } catch (err) {
    console.error('Test suite error:', err);
    process.exit(1);
  }
}

runAllTests();
