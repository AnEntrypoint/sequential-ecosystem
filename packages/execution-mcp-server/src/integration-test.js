import logger from 'sequential-logging';
import { mcpServer } from './mcp-server.js';
import { serverLifecycle } from './server-lifecycle.js';
import { mcpTools } from './mcp-tools.js';

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function testServerStartStop() {
  console.log('\n=== Testing Server Start/Stop ===\n');

  logger.info('Starting desktop-server...');
  const startResult = await serverLifecycle.start();
  console.log('Start result:', startResult);

  if (!startResult.success) {
    throw new Error('Failed to start server');
  }

  await sleep(2000);

  const status1 = serverLifecycle.getStatus();
  console.log('Server status after start:', {
    isRunning: status1.isRunning,
    pid: status1.pid,
    uptime: status1.uptime
  });

  if (!status1.isRunning) {
    throw new Error('Server should be running after start');
  }

  logger.info('Stopping desktop-server...');
  const stopResult = await serverLifecycle.stop();
  console.log('Stop result:', stopResult);

  if (!stopResult.success) {
    throw new Error('Failed to stop server');
  }

  await sleep(1000);

  const status2 = serverLifecycle.getStatus();
  console.log('Server status after stop:', {
    isRunning: status2.isRunning,
    pid: status2.pid,
    uptime: status2.uptime
  });

  if (status2.isRunning) {
    throw new Error('Server should be stopped');
  }

  console.log('✓ Server start/stop test passed\n');
}

async function testServerRestart() {
  console.log('\n=== Testing Server Restart ===\n');

  logger.info('Starting desktop-server for restart test...');
  const startResult = await serverLifecycle.start();
  console.log('Initial start:', startResult.success ? 'SUCCESS' : 'FAILED');

  await sleep(2000);

  const status1 = serverLifecycle.getStatus();
  const pid1 = status1.pid;
  console.log(`Server running with PID: ${pid1}`);

  logger.info('Restarting server...');
  const restartResult = await serverLifecycle.restart();
  console.log('Restart result:', restartResult);

  if (!restartResult.success) {
    throw new Error('Failed to restart server');
  }

  await sleep(2000);

  const status2 = serverLifecycle.getStatus();
  const pid2 = status2.pid;
  console.log(`Server now running with PID: ${pid2}`);
  console.log(`Restart count: ${restartResult.restartCount}`);

  if (!status2.isRunning) {
    throw new Error('Server should be running after restart');
  }

  if (pid1 === pid2) {
    logger.warn('PIDs are the same - process may have reused same PID (OK)');
  }

  logger.info('Stopping server after restart test...');
  await serverLifecycle.stop();
  await sleep(1000);

  console.log('✓ Server restart test passed\n');
}

async function testToolExecution() {
  console.log('\n=== Testing Tool Execution ===\n');

  logger.info('Starting server for execution test...');
  const startResult = await serverLifecycle.start();
  if (!startResult.success) {
    throw new Error('Failed to start server');
  }

  await sleep(2000);

  logger.info('Testing task listing...');
  const taskList = mcpTools.listTasks();
  console.log(`Available tasks: ${taskList.count}`);

  logger.info('Testing flow listing...');
  const flowList = mcpTools.listFlows();
  console.log(`Available flows: ${flowList.count}`);

  logger.info('Testing tool listing...');
  const toolList = mcpTools.listTools();
  console.log(`Available tools: ${toolList.count}`);

  const toolNames = mcpTools.getToolDefinitions().map(t => t.name);
  console.log(`MCP tool definitions: ${toolNames.join(', ')}`);

  logger.info('Stopping server after execution test...');
  await serverLifecycle.stop();
  await sleep(1000);

  console.log('✓ Tool execution test passed\n');
}

async function testJsonRpc() {
  console.log('\n=== Testing JSON-RPC Protocol ===\n');

  logger.info('Testing JSON-RPC tool call for server status...');

  const request = {
    jsonrpc: '2.0',
    id: 100,
    method: 'tools/call',
    params: {
      name: 'get_server_status',
      arguments: {}
    }
  };

  const response = await mcpServer.handleJsonRpc(request);
  console.log('JSON-RPC response:', JSON.stringify(response, null, 2));

  if (!response.result) {
    throw new Error('Should have result in response');
  }

  if (response.result.toolName !== 'get_server_status') {
    throw new Error('Tool name mismatch');
  }

  console.log('✓ JSON-RPC test passed\n');
}

async function testConcurrentRequests() {
  console.log('\n=== Testing Concurrent Requests ===\n');

  logger.info('Starting server...');
  await serverLifecycle.start();
  await sleep(2000);

  logger.info('Sending concurrent MCP tool calls...');

  const requests = [
    { method: 'tools/call', params: { name: 'list_tasks', arguments: {} } },
    { method: 'tools/call', params: { name: 'list_flows', arguments: {} } },
    { method: 'tools/call', params: { name: 'list_tools', arguments: {} } },
    { method: 'tools/call', params: { name: 'get_server_status', arguments: {} } }
  ];

  const promises = requests.map((req, idx) =>
    mcpServer.handleJsonRpc({
      jsonrpc: '2.0',
      id: 200 + idx,
      ...req
    })
  );

  const responses = await Promise.all(promises);
  console.log(`Received ${responses.length} concurrent responses`);

  for (const response of responses) {
    if (!response.result && !response.error) {
      throw new Error('Invalid response format');
    }
  }

  logger.info('Stopping server...');
  await serverLifecycle.stop();
  await sleep(1000);

  console.log('✓ Concurrent requests test passed\n');
}

async function runIntegrationTests() {
  try {
    await mcpServer.initialize();

    await testServerStartStop();
    await testServerRestart();
    await testToolExecution();
    await testJsonRpc();
    await testConcurrentRequests();

    console.log('='.repeat(60));
    console.log('All integration tests PASSED!');
    console.log('='.repeat(60));
    process.exit(0);
  } catch (err) {
    console.error('\n' + '='.repeat(60));
    console.error('Integration test FAILED:', err.message);
    console.error('='.repeat(60));
    process.exit(1);
  }
}

runIntegrationTests();
