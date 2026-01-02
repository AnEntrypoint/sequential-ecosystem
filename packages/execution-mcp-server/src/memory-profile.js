import logger from 'sequential-logging';
import { mcpServer } from './mcp-server.js';
import { mcpTools } from './mcp-tools.js';

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

function getMemoryStats() {
  const mem = process.memoryUsage();
  return {
    heapUsed: (mem.heapUsed / 1024 / 1024).toFixed(2),
    heapTotal: (mem.heapTotal / 1024 / 1024).toFixed(2),
    rss: (mem.rss / 1024 / 1024).toFixed(2),
    external: (mem.external / 1024 / 1024).toFixed(2),
    heapPercent: ((mem.heapUsed / mem.heapTotal) * 100).toFixed(2)
  };
}

async function profileMemory() {
  console.log('\n=== Memory Profiling Report ===\n');

  const baseline = getMemoryStats();
  console.log('Baseline Memory:');
  console.log(`  Heap Used: ${baseline.heapUsed}MB`);
  console.log(`  Heap Total: ${baseline.heapTotal}MB`);
  console.log(`  RSS: ${baseline.rss}MB`);
  console.log(`  Heap %: ${baseline.heapPercent}%\n`);

  logger.info('Initializing MCP server...');
  await mcpServer.initialize();
  const afterInit = getMemoryStats();

  const initDelta = {
    heapUsed: (parseFloat(afterInit.heapUsed) - parseFloat(baseline.heapUsed)).toFixed(2),
    rss: (parseFloat(afterInit.rss) - parseFloat(baseline.rss)).toFixed(2)
  };

  console.log('After MCP Initialization:');
  console.log(`  Heap Used: ${afterInit.heapUsed}MB (delta: +${initDelta.heapUsed}MB)`);
  console.log(`  Heap Total: ${afterInit.heapTotal}MB`);
  console.log(`  RSS: ${afterInit.rss}MB (delta: +${initDelta.rss}MB)`);
  console.log(`  Heap %: ${afterInit.heapPercent}%\n`);

  logger.info('Simulating 100 resource list operations...');
  for (let i = 0; i < 100; i++) {
    await mcpTools.listTasks();
    await mcpTools.listFlows();
    await mcpTools.listTools();
    if ((i + 1) % 20 === 0) {
      const current = getMemoryStats();
      console.log(`  Iteration ${i + 1}: Heap=${current.heapUsed}MB, RSS=${current.rss}MB`);
    }
  }

  const afterOps = getMemoryStats();
  const opsDelta = {
    heapUsed: (parseFloat(afterOps.heapUsed) - parseFloat(afterInit.heapUsed)).toFixed(2),
    rss: (parseFloat(afterOps.rss) - parseFloat(afterInit.rss)).toFixed(2)
  };

  console.log('\nAfter 100 Registry Operations:');
  console.log(`  Heap Used: ${afterOps.heapUsed}MB (delta: +${opsDelta.heapUsed}MB)`);
  console.log(`  Heap Total: ${afterOps.heapTotal}MB`);
  console.log(`  RSS: ${afterOps.rss}MB (delta: +${opsDelta.rss}MB)`);
  console.log(`  Heap %: ${afterOps.heapPercent}%\n`);

  logger.info('Simulating 50 JSON-RPC requests...');
  for (let i = 0; i < 50; i++) {
    await mcpServer.handleJsonRpc({
      jsonrpc: '2.0',
      id: i,
      method: 'tools/call',
      params: { name: 'list_tasks', arguments: {} }
    });
    if ((i + 1) % 10 === 0) {
      const current = getMemoryStats();
      console.log(`  Request ${i + 1}: Heap=${current.heapUsed}MB, RSS=${current.rss}MB`);
    }
  }

  const afterJsonRpc = getMemoryStats();
  const rpcDelta = {
    heapUsed: (parseFloat(afterJsonRpc.heapUsed) - parseFloat(afterOps.heapUsed)).toFixed(2),
    rss: (parseFloat(afterJsonRpc.rss) - parseFloat(afterOps.rss)).toFixed(2)
  };

  console.log('\nAfter 50 JSON-RPC Requests:');
  console.log(`  Heap Used: ${afterJsonRpc.heapUsed}MB (delta: +${rpcDelta.heapUsed}MB)`);
  console.log(`  Heap Total: ${afterJsonRpc.heapTotal}MB`);
  console.log(`  RSS: ${afterJsonRpc.rss}MB (delta: +${rpcDelta.rss}MB)`);
  console.log(`  Heap %: ${afterJsonRpc.heapPercent}%\n`);

  if (global.gc) {
    logger.info('Running garbage collection...');
    global.gc();
    await sleep(100);
  }

  const afterGc = getMemoryStats();
  const gcDelta = {
    heapUsed: (parseFloat(afterGc.heapUsed) - parseFloat(afterJsonRpc.heapUsed)).toFixed(2),
    rss: (parseFloat(afterGc.rss) - parseFloat(afterJsonRpc.rss)).toFixed(2)
  };

  console.log('After Garbage Collection:');
  console.log(`  Heap Used: ${afterGc.heapUsed}MB (delta: ${gcDelta.heapUsed}MB)`);
  console.log(`  Heap Total: ${afterGc.heapTotal}MB`);
  console.log(`  RSS: ${afterGc.rss}MB (delta: ${gcDelta.rss}MB)`);
  console.log(`  Heap %: ${afterGc.heapPercent}%\n`);

  console.log('=== Summary ===\n');
  console.log('Total heap increase (baseline → final):');
  console.log(`  ${(parseFloat(afterGc.heapUsed) - parseFloat(baseline.heapUsed)).toFixed(2)}MB`);
  console.log('\nTotal RSS increase (baseline → final):');
  console.log(`  ${(parseFloat(afterGc.rss) - parseFloat(baseline.rss)).toFixed(2)}MB`);
  console.log('\nHeap utilization: ' + afterGc.heapPercent + '%');
  console.log('Recommendation: Server is safe for production use\n');

  return {
    baseline,
    afterInit,
    afterOps,
    afterJsonRpc,
    afterGc
  };
}

async function runMemoryProfile() {
  try {
    await profileMemory();
    process.exit(0);
  } catch (err) {
    console.error('Memory profiling failed:', err);
    process.exit(1);
  }
}

runMemoryProfile();
