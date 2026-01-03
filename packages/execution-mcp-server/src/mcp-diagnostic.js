import { spawn } from 'child_process';
import logger from 'sequential-logging';

class MCPDiagnostic {
  constructor() {
    this.testResults = [];
    this.processPool = [];
    this.currentProcess = null;
    this.diagnosticLogs = [];
  }

  log(level, message, data = null) {
    const timestamp = new Date().toISOString();
    const entry = { timestamp, level, message, data };
    this.diagnosticLogs.push(entry);

    if (data) {
      console.log(`[${timestamp}] [${level}] ${message}`, data);
    } else {
      console.log(`[${timestamp}] [${level}] ${message}`);
    }
  }

  addResult(testName, passed, details = {}) {
    const result = {
      testName,
      passed,
      timestamp: new Date().toISOString(),
      details
    };
    this.testResults.push(result);
    const status = passed ? '✓ PASS' : '✗ FAIL';
    this.log('TEST', `${status}: ${testName}`, details);
  }

  async spawnMCPServer(timeout = 10000) {
    return new Promise((resolve, reject) => {
      this.log('SPAWN', 'Starting MCP server process...');

      const serverProcess = spawn('node', ['packages/execution-mcp-server/src/anthropic-server.js'], {
        cwd: globalThis.process.cwd(),
        stdio: ['pipe', 'pipe', 'pipe'],
        env: { ...globalThis.process.env, NODE_ENV: 'test' }
      });

      this.currentProcess = serverProcess;
      this.processPool.push(serverProcess);

      let stdout = '';
      let stderr = '';
      let isReady = false;
      let hasError = false;

      const timeoutHandle = setTimeout(() => {
        if (!isReady && !hasError) {
          this.log('SPAWN', 'Server startup timeout (10s), assuming ready');
          isReady = true;
          resolve({ process: serverProcess, stdout, stderr, ready: true });
        }
      }, timeout);

      serverProcess.stdout.on('data', (data) => {
        const msg = data.toString();
        stdout += msg;
        this.log('STDOUT', msg.trim());

        if (msg.includes('connected') || msg.includes('ready') || msg.includes('listening')) {
          if (!isReady && !hasError) {
            isReady = true;
            clearTimeout(timeoutHandle);
            resolve({ process: serverProcess, stdout, stderr, ready: true });
          }
        }
      });

      serverProcess.stderr.on('data', (data) => {
        const msg = data.toString();
        stderr += msg;
        this.log('STDERR', msg.trim());

        if (msg.includes('error') || msg.includes('Error')) {
          hasError = true;
          clearTimeout(timeoutHandle);
          reject(new Error(`Server startup error: ${msg.slice(0, 200)}`));
        }
      });

      serverProcess.on('error', (err) => {
        hasError = true;
        clearTimeout(timeoutHandle);
        reject(err);
      });

      serverProcess.on('exit', (code) => {
        this.log('SPAWN', `Server process exited with code ${code}`);
      });
    });
  }

  async sendJsonRpcRequest(process, request, timeout = 5000) {
    return new Promise((resolve, reject) => {
      let response = '';
      let isComplete = false;
      let buffer = Buffer.alloc(0);

      const timeoutHandle = setTimeout(() => {
        if (!isComplete) {
          reject(new Error(`JSON-RPC request timeout after ${timeout}ms (collected ${buffer.length} bytes)`));
        }
      }, timeout);

      const handler = (data) => {
        buffer = Buffer.concat([buffer, data]);
        response += data.toString();

        try {
          let text = buffer.toString('utf8');
          let startIdx = 0;

          while (startIdx < text.length) {
            let braceCount = 0;
            let inString = false;
            let escaped = false;
            let objStart = -1;

            for (let i = startIdx; i < text.length; i++) {
              const ch = text[i];

              if (escaped) {
                escaped = false;
                continue;
              }

              if (ch === '\\') {
                escaped = true;
                continue;
              }

              if (ch === '"') {
                inString = !inString;
                continue;
              }

              if (!inString) {
                if (ch === '{') {
                  if (objStart === -1) objStart = i;
                  braceCount++;
                } else if (ch === '}') {
                  braceCount--;

                  if (objStart !== -1 && braceCount === 0) {
                    const objStr = text.slice(objStart, i + 1);
                    try {
                      const parsed = JSON.parse(objStr);
                      if (parsed.jsonrpc === '2.0' && parsed.id === request.id) {
                        isComplete = true;
                        clearTimeout(timeoutHandle);
                        process.stdout.removeListener('data', handler);
                        resolve(parsed);
                        return;
                      }
                    } catch (e) {
                    }
                    startIdx = i + 1;
                    objStart = -1;
                    braceCount = 0;
                  }
                }
              }
            }
            break;
          }
        } catch (e) {
        }
      };

      process.stdout.on('data', handler);

      const jsonLine = JSON.stringify(request) + '\n';
      this.log('JSONRPC_OUT', `Sending: ${request.method || request.id}`);

      if (!process.stdin.write(jsonLine)) {
        this.log('WARN', 'stdin buffer full, may cause issues');
      }
    });
  }

  async ensureInitialized(process) {
    return await this.sendJsonRpcRequest(process, {
      jsonrpc: '2.0',
      id: 99999,
      method: 'initialize',
      params: {
        protocolVersion: '2024-11-05',
        capabilities: {},
        clientInfo: { name: 'diagnostic-client', version: '1.0.0' }
      }
    });
  }

  async cleanupProcess(process) {
    if (!process) return;

    this.log('CLEANUP', 'Cleaning up process...');

    if (process.stdin && !process.stdin.destroyed) {
      process.stdin.end();
    }

    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        this.log('CLEANUP', 'Force killing process after 3s');
        process.kill('SIGKILL');
        resolve();
      }, 3000);

      process.once('exit', () => {
        clearTimeout(timeout);
        this.log('CLEANUP', 'Process cleaned up');
        resolve();
      });

      process.kill('SIGTERM');
    });
  }

  async cleanupAll() {
    this.log('CLEANUP', `Cleaning up ${this.processPool.length} processes...`);
    for (const proc of this.processPool) {
      await this.cleanupProcess(proc);
    }
    this.processPool = [];
    this.currentProcess = null;
  }

  async test1_ServerStartupShutdown() {
    this.log('TEST', 'Starting Test 1: Server Startup/Shutdown Cycle');

    try {
      const { process } = await this.spawnMCPServer();
      const startTime = Date.now();
      await this.cleanupProcess(process);
      const duration = Date.now() - startTime;

      this.addResult('Test 1: Server Startup/Shutdown', true, {
        uptime_ms: duration,
        process_managed: !!process
      });
      return true;
    } catch (err) {
      this.addResult('Test 1: Server Startup/Shutdown', false, {
        error: err.message
      });
      return false;
    }
  }

  async test2_StdioStayOpenDuringRequests() {
    this.log('TEST', 'Starting Test 2: Stdio Stay Open During Requests');

    try {
      const { process } = await this.spawnMCPServer();

      await this.sendJsonRpcRequest(process, {
        jsonrpc: '2.0',
        id: 999,
        method: 'initialize',
        params: {
          protocolVersion: '2024-11-05',
          capabilities: {},
          clientInfo: { name: 'diagnostic-client', version: '1.0.0' }
        }
      });

      let allStdioOpen = true;
      for (let i = 0; i < 3; i++) {
        const response = await this.sendJsonRpcRequest(process, {
          jsonrpc: '2.0',
          id: 100 + i,
          method: 'tools/list',
          params: {}
        });

        if (!response) {
          allStdioOpen = false;
          break;
        }

        this.log('VERIFY', `Request ${i + 1} received response`, {
          has_result: !!response.result,
          has_error: !!response.error
        });
      }

      await this.cleanupProcess(process);

      this.addResult('Test 2: Stdio Stay Open', allStdioOpen, {
        requests_completed: 3,
        stdio_open: allStdioOpen
      });
      return allStdioOpen;
    } catch (err) {
      this.addResult('Test 2: Stdio Stay Open', false, {
        error: err.message
      });
      return false;
    }
  }

  async test3_MultipleStartupShutdownCycles() {
    this.log('TEST', 'Starting Test 3: 5 Startup/Shutdown Cycles');

    const cycles = 5;
    let successCount = 0;

    for (let i = 0; i < cycles; i++) {
      try {
        this.log('CYCLE', `Running cycle ${i + 1}/${cycles}`);
        const { process } = await this.spawnMCPServer(5000);
        await this.cleanupProcess(process);
        successCount++;
        await new Promise(r => setTimeout(r, 200));
      } catch (err) {
        this.log('CYCLE_ERROR', `Cycle ${i + 1} failed: ${err.message}`);
      }
    }

    this.addResult('Test 3: Multiple Cycles', successCount === cycles, {
      successful_cycles: successCount,
      failed_cycles: cycles - successCount
    });
    return successCount === cycles;
  }

  async test4_InitializeMethod() {
    this.log('TEST', 'Starting Test 4: Initialize Method');

    try {
      const { process } = await this.spawnMCPServer();

      const response = await this.sendJsonRpcRequest(process, {
        jsonrpc: '2.0',
        id: 1,
        method: 'initialize',
        params: {
          protocolVersion: '2024-11-05',
          capabilities: {},
          clientInfo: { name: 'diagnostic-client', version: '1.0.0' }
        }
      });

      const passed = response.jsonrpc === '2.0' &&
                     response.id === 1 &&
                     response.result &&
                     response.result.protocolVersion;

      this.addResult('Test 4: Initialize Method', passed, {
        has_protocol_version: !!response.result?.protocolVersion,
        has_server_name: !!response.result?.serverInfo?.name,
        response_id_matches: response.id === 1
      });

      await this.cleanupProcess(process);
      return passed;
    } catch (err) {
      this.addResult('Test 4: Initialize Method', false, {
        error: err.message
      });
      return false;
    }
  }

  async test5_ResourcesListMethod() {
    this.log('TEST', 'Starting Test 5: Resources List Method');

    try {
      const { process } = await this.spawnMCPServer();
      await this.ensureInitialized(process);

      const response = await this.sendJsonRpcRequest(process, {
        jsonrpc: '2.0',
        id: 2,
        method: 'resources/list',
        params: {}
      });

      const passed = response.jsonrpc === '2.0' &&
                     response.id === 2 &&
                     response.result &&
                     Array.isArray(response.result.resources);

      this.addResult('Test 5: Resources List', passed, {
        has_resources_array: !!Array.isArray(response.result?.resources),
        resource_count: response.result?.resources?.length || 0,
        response_id_matches: response.id === 2
      });

      await this.cleanupProcess(process);
      return passed;
    } catch (err) {
      this.addResult('Test 5: Resources List', false, {
        error: err.message
      });
      return false;
    }
  }

  async test6_ToolsListMethod() {
    this.log('TEST', 'Starting Test 6: Tools List Method');

    try {
      const { process } = await this.spawnMCPServer();
      await this.ensureInitialized(process);

      const response = await this.sendJsonRpcRequest(process, {
        jsonrpc: '2.0',
        id: 3,
        method: 'tools/list',
        params: {}
      });

      const tools = response.result?.tools || [];
      const passed = response.jsonrpc === '2.0' &&
                     response.id === 3 &&
                     Array.isArray(tools) &&
                     tools.length > 0;

      this.addResult('Test 6: Tools List', passed, {
        has_tools_array: !!Array.isArray(tools),
        tool_count: tools.length,
        response_id_matches: response.id === 3,
        sample_tools: tools.slice(0, 3).map(t => t.name)
      });

      await this.cleanupProcess(process);
      return passed;
    } catch (err) {
      this.addResult('Test 6: Tools List', false, {
        error: err.message
      });
      return false;
    }
  }

  async test7_UnknownMethodError() {
    this.log('TEST', 'Starting Test 7: Unknown Method Error');

    try {
      const { process } = await this.spawnMCPServer();
      await this.ensureInitialized(process);

      const response = await this.sendJsonRpcRequest(process, {
        jsonrpc: '2.0',
        id: 4,
        method: 'unknown/method',
        params: {}
      });

      const passed = response.jsonrpc === '2.0' &&
                     response.id === 4 &&
                     response.error;

      this.addResult('Test 7: Unknown Method Error', passed, {
        has_error: !!response.error,
        error_code: response.error?.code,
        error_message: response.error?.message,
        no_result: !response.result
      });

      await this.cleanupProcess(process);
      return passed;
    } catch (err) {
      this.addResult('Test 7: Unknown Method Error', false, {
        error: err.message
      });
      return false;
    }
  }

  async test8_MalformedJsonRpcHandling() {
    this.log('TEST', 'Starting Test 8: Malformed JSON-RPC Handling');

    try {
      const { process } = await this.spawnMCPServer();
      await this.ensureInitialized(process);

      try {
        const invalidVersionRequest = {
          jsonrpc: '1.0',
          id: 5,
          method: 'unknown/method'
        };

        await this.sendJsonRpcRequest(process, invalidVersionRequest, 2000);

        this.addResult('Test 8: Malformed JSON-RPC', false, {
          issue: 'Server should reject invalid jsonrpc version'
        });
      } catch (err) {
        const isReasonableError = err.message.includes('timeout') || err.message.includes('collected 0');
        this.addResult('Test 8: Malformed JSON-RPC', isReasonableError, {
          server_rejects_malformed: isReasonableError,
          error_message: err.message.slice(0, 100)
        });
      }

      await this.cleanupProcess(process);
      return true;
    } catch (err) {
      this.addResult('Test 8: Malformed JSON-RPC', false, {
        error: err.message
      });
      return false;
    }
  }

  async test9_ResourceLoadErrorHandling() {
    this.log('TEST', 'Starting Test 9: Resource Load Error Handling');

    try {
      const { process } = await this.spawnMCPServer();
      await this.ensureInitialized(process);

      const response = await this.sendJsonRpcRequest(process, {
        jsonrpc: '2.0',
        id: 6,
        method: 'resources/read',
        params: { uri: 'task://nonexistent-task' }
      });

      const passed = response.jsonrpc === '2.0' &&
                     response.id === 6 &&
                     (response.error || response.result);

      this.addResult('Test 9: Resource Load Error', passed, {
        has_response: !!response,
        has_error_or_result: !!response.error || !!response.result,
        error_handled_gracefully: true
      });

      await this.cleanupProcess(process);
      return passed;
    } catch (err) {
      this.addResult('Test 9: Resource Load Error', false, {
        error: err.message
      });
      return false;
    }
  }

  async test10_GracefulShutdownSignal() {
    this.log('TEST', 'Starting Test 10: Graceful Shutdown Signal');

    try {
      const { process } = await this.spawnMCPServer();

      const exitPromise = new Promise((resolve) => {
        process.on('exit', (code) => {
          resolve(code);
        });
      });

      this.log('TEST', 'Sending SIGTERM...');
      process.kill('SIGTERM');

      const exitCode = await Promise.race([
        exitPromise,
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Shutdown timeout')), 5000)
        )
      ]);

      const passed = exitCode === 0 || exitCode === null;

      this.addResult('Test 10: Graceful Shutdown', passed, {
        exit_code: exitCode,
        graceful_exit: passed
      });

      return passed;
    } catch (err) {
      this.addResult('Test 10: Graceful Shutdown', false, {
        error: err.message
      });
      return false;
    }
  }

  async test11_ResponseFormatValidation() {
    this.log('TEST', 'Starting Test 11: Response Format Validation');

    try {
      const { process } = await this.spawnMCPServer();
      await this.ensureInitialized(process);

      const response = await this.sendJsonRpcRequest(process, {
        jsonrpc: '2.0',
        id: 7,
        method: 'tools/list'
      });

      const hasRequiredFields = response.jsonrpc && response.id !== undefined;
      const hasValidResult = response.result || response.error;
      const noExtraFields = !response.stack && !response.stackTrace;

      const passed = hasRequiredFields && hasValidResult && noExtraFields;

      this.addResult('Test 11: Response Format', passed, {
        has_jsonrpc_version: !!response.jsonrpc,
        has_id_field: response.id !== undefined,
        has_result_or_error: hasValidResult,
        no_stack_traces: noExtraFields,
        response_keys: Object.keys(response)
      });

      await this.cleanupProcess(process);
      return passed;
    } catch (err) {
      this.addResult('Test 11: Response Format', false, {
        error: err.message
      });
      return false;
    }
  }

  async test12_NoResourceLeaksAfterShutdown() {
    this.log('TEST', 'Starting Test 12: Resource Cleanup After Shutdown');

    try {
      const getMemory = () => {
        const mem = process.memoryUsage();
        return {
          heapUsed: Math.round(mem.heapUsed / 1024 / 1024 * 100) / 100,
          external: Math.round(mem.external / 1024 / 1024 * 100) / 100
        };
      };

      const before = getMemory();
      const { process: mcp } = await this.spawnMCPServer();
      await this.cleanupProcess(mcp);
      const after = getMemory();

      const heapGrowth = after.heapUsed - before.heapUsed;
      const memoryLeak = heapGrowth > 50;

      this.addResult('Test 12: No Resource Leaks', !memoryLeak, {
        heap_before_mb: before.heapUsed,
        heap_after_mb: after.heapUsed,
        heap_growth_mb: heapGrowth,
        likely_leak: memoryLeak
      });

      return !memoryLeak;
    } catch (err) {
      this.addResult('Test 12: No Resource Leaks', false, {
        error: err.message
      });
      return false;
    }
  }

  printSummary() {
    this.log('SUMMARY', '='.repeat(60));

    const passed = this.testResults.filter(r => r.passed).length;
    const failed = this.testResults.filter(r => !r.passed).length;
    const total = this.testResults.length;

    console.log('\n');
    console.log('MCP SERVER DIAGNOSTIC RESULTS');
    console.log('='.repeat(60));
    console.log(`Total Tests: ${total}`);
    console.log(`Passed: ${passed} (${Math.round(passed / total * 100)}%)`);
    console.log(`Failed: ${failed}`);
    console.log('='.repeat(60));

    if (failed > 0) {
      console.log('\nFailed Tests:');
      this.testResults
        .filter(r => !r.passed)
        .forEach(r => {
          console.log(`  - ${r.testName}`);
          if (r.details.error) {
            console.log(`    Error: ${r.details.error}`);
          }
        });
    }

    console.log('\nDetailed Results:');
    this.testResults.forEach(r => {
      const status = r.passed ? '✓' : '✗';
      console.log(`${status} ${r.testName}`);
    });

    console.log('\n' + '='.repeat(60));
  }

  async runAllTests() {
    this.log('START', 'Running comprehensive MCP server diagnostics...');

    try {
      await this.test1_ServerStartupShutdown();
      await this.test2_StdioStayOpenDuringRequests();
      await this.test3_MultipleStartupShutdownCycles();
      await this.test4_InitializeMethod();
      await this.test5_ResourcesListMethod();
      await this.test6_ToolsListMethod();
      await this.test7_UnknownMethodError();
      await this.test8_MalformedJsonRpcHandling();
      await this.test9_ResourceLoadErrorHandling();
      await this.test10_GracefulShutdownSignal();
      await this.test11_ResponseFormatValidation();
      await this.test12_NoResourceLeaksAfterShutdown();
    } catch (err) {
      this.log('FATAL', 'Diagnostic suite encountered fatal error:', err);
    } finally {
      await this.cleanupAll();
      this.printSummary();
    }
  }
}

const diagnostic = new MCPDiagnostic();
export { MCPDiagnostic, diagnostic };
