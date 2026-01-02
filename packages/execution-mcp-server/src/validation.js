import logger from 'sequential-logging';
import { mcpServer } from './mcp-server.js';
import { mcpTools } from './mcp-tools.js';
import { mcpResources } from './mcp-resources.js';
import { serverLifecycle } from './server-lifecycle.js';

const checks = [];

function check(name, result, message) {
  checks.push({ name, result, message });
  if (result) {
    console.log(`✓ ${name}`);
  } else {
    console.log(`✗ ${name}: ${message}`);
  }
}

async function validateMCPServer() {
  console.log('\n=== MCP Server Validation ===\n');

  try {
    // 1. Initialization
    logger.info('Checking server initialization...');
    await mcpServer.initialize();
    check('Server initialization', mcpServer.isInitialized, 'Should be initialized');

    // 2. Server info
    const info = mcpServer.getServerInfo();
    check('Server info protocol version', info.protocolVersion === '2024-11-05', 'Should have correct version');
    check('Server capabilities', info.capabilities?.resources && info.capabilities?.tools, 'Should have capabilities');

    // 3. Resources
    logger.info('Checking resources...');
    const resources = await mcpServer.listResources();
    check('Resource listing', Array.isArray(resources.resources), 'Should return resources array');
    check('Resource count', resources.resources.length > 0, 'Should have resources');

    const taskResources = resources.resources.filter(r => r.uri.startsWith('task://'));
    const flowResources = resources.resources.filter(r => r.uri.startsWith('flow://'));
    const toolResources = resources.resources.filter(r => r.uri.startsWith('tool://'));

    check('Task resources exist', taskResources.length > 0, 'Should have task resources');
    check('Flow resources exist', flowResources.length > 0, 'Should have flow resources');
    check('Tool resources exist', toolResources.length > 0, 'Should have tool resources');

    // 4. Resource reading
    if (taskResources.length > 0) {
      const resource = await mcpResources.readResource(taskResources[0].uri);
      check('Resource reading', !!resource.contents, 'Should have contents');
      check('Resource MIME type', resource.mimeType === 'application/json', 'Should have correct MIME type');
    }

    // 5. Tools
    logger.info('Checking tools...');
    const tools = await mcpServer.listTools();
    check('Tool listing', Array.isArray(tools.tools), 'Should return tools array');
    check('Tool count', tools.tools.length >= 11, 'Should have at least 11 tools');

    const requiredTools = [
      'execute_task', 'execute_flow', 'execute_tool',
      'list_tasks', 'list_flows', 'list_tools',
      'get_execution_history', 'get_server_status',
      'start_server', 'stop_server', 'restart_server'
    ];

    for (const toolName of requiredTools) {
      const found = tools.tools.find(t => t.name === toolName);
      check(`Tool ${toolName}`, !!found, `Should have ${toolName}`);
    }

    // 6. JSON-RPC
    logger.info('Checking JSON-RPC protocol...');
    const initReq = {
      jsonrpc: '2.0', id: 1, method: 'initialize', params: {}
    };
    const initResp = await mcpServer.handleJsonRpc(initReq);
    check('JSON-RPC initialize', initResp.result, 'Should initialize');
    check('JSON-RPC version', initResp.jsonrpc === '2.0', 'Should have correct version');

    const toolsReq = {
      jsonrpc: '2.0', id: 2, method: 'tools/list', params: {}
    };
    const toolsResp = await mcpServer.handleJsonRpc(toolsReq);
    check('JSON-RPC tools/list', toolsResp.result?.tools, 'Should list tools');

    const callReq = {
      jsonrpc: '2.0', id: 3, method: 'tools/call',
      params: { name: 'list_tasks', arguments: {} }
    };
    const callResp = await mcpServer.handleJsonRpc(callReq);
    check('JSON-RPC tools/call', callResp.result?.result?.tasks, 'Should call tools');

    // 7. Tool execution
    logger.info('Checking tool execution...');
    const taskList = mcpTools.listTasks();
    check('Task listing', Array.isArray(taskList.tasks), 'Should list tasks');
    check('Task count', taskList.count >= 0, 'Should have task count');

    const flowList = mcpTools.listFlows();
    check('Flow listing', Array.isArray(flowList.flows), 'Should list flows');
    check('Flow count', flowList.count >= 0, 'Should have flow count');

    const toolList = mcpTools.listTools();
    check('Tool listing', Array.isArray(toolList.tools), 'Should list tools');
    check('Tool count', toolList.count >= 0, 'Should have tool count');

    // 8. Execution history
    logger.info('Checking execution tracking...');
    const history = await mcpTools.getExecutionHistory('task', 10);
    check('Execution history', Array.isArray(history.history), 'Should have history array');
    check('History tracking', typeof history.totalCount === 'number', 'Should track total count');

    // 9. Server status
    logger.info('Checking server status...');
    const status = serverLifecycle.getStatus();
    check('Server status', typeof status.isRunning === 'boolean', 'Should have isRunning status');
    check('Port configuration', status.port === 3000, 'Should have correct port');
    check('Host configuration', status.host === 'localhost', 'Should have correct host');
    check('Memory tracking', typeof status.heapUsedMB === 'number', 'Should track heap memory');

    // 10. Error handling
    logger.info('Checking error handling...');
    const errorReq = {
      jsonrpc: '2.0', id: 4, method: 'invalid/method', params: {}
    };
    const errorResp = await mcpServer.handleJsonRpc(errorReq);
    check('Error response', errorResp.error, 'Should return error');
    check('Error code', errorResp.error?.code === -32601, 'Should have correct error code');

    // 11. Concurrent requests
    logger.info('Checking concurrent request handling...');
    const promises = [];
    for (let i = 0; i < 5; i++) {
      promises.push(mcpServer.handleJsonRpc({
        jsonrpc: '2.0', id: 100 + i, method: 'tools/list', params: {}
      }));
    }
    const results = await Promise.all(promises);
    const allSuccessful = results.every(r => r.result || r.error);
    check('Concurrent requests', allSuccessful, 'All requests should complete');

  } catch (err) {
    console.error('\nValidation error:', err.message);
    return false;
  }

  // Summary
  console.log('\n=== Validation Summary ===\n');
  const passed = checks.filter(c => c.result).length;
  const total = checks.length;
  const percentage = ((passed / total) * 100).toFixed(1);

  console.log(`Passed: ${passed}/${total} (${percentage}%)\n`);

  if (passed === total) {
    console.log('✓ All validation checks PASSED\n');
    console.log('MCP Server is production-ready');
    return true;
  } else {
    console.log('✗ Some validation checks FAILED\n');
    const failed = checks.filter(c => !c.result);
    for (const check of failed) {
      console.log(`  - ${check.name}: ${check.message}`);
    }
    return false;
  }
}

async function main() {
  try {
    const success = await validateMCPServer();
    process.exit(success ? 0 : 1);
  } catch (err) {
    console.error('Fatal error:', err);
    process.exit(1);
  }
}

main();
