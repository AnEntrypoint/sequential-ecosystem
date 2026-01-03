import { spawn } from 'child_process';

class ClaudeCodeIntegrationTest {
  constructor() {
    this.serverProcess = null;
    this.tests = [];
  }

  log(level, message) {
    console.log(`[${new Date().toISOString()}] [${level}] ${message}`);
  }

  async startServer() {
    return new Promise((resolve, reject) => {
      this.log('INFO', 'Starting MCP server for Claude Code integration tests...');

      this.serverProcess = spawn('node', ['packages/execution-mcp-server/src/anthropic-server.js'], {
        cwd: globalThis.process.cwd(),
        stdio: ['pipe', 'pipe', 'pipe'],
        env: { ...globalThis.process.env }
      });

      let ready = false;
      const timeout = setTimeout(() => {
        if (!ready) {
          ready = true;
          resolve();
        }
      }, 3000);

      this.serverProcess.stdout.on('data', (data) => {
        const msg = data.toString();
        if (msg.includes('connected')) {
          if (!ready) {
            ready = true;
            clearTimeout(timeout);
            resolve();
          }
        }
      });

      this.serverProcess.on('error', (err) => {
        if (!ready) {
          ready = true;
          clearTimeout(timeout);
          reject(err);
        }
      });
    });
  }

  async stopServer() {
    if (!this.serverProcess) return;

    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        this.serverProcess.kill('SIGKILL');
        resolve();
      }, 3000);

      this.serverProcess.once('exit', () => {
        clearTimeout(timeout);
        resolve();
      });

      this.serverProcess.kill('SIGTERM');
    });
  }

  async sendRequest(method, params = {}) {
    return new Promise((resolve, reject) => {
      const request = {
        jsonrpc: '2.0',
        id: Math.floor(Math.random() * 10000000),
        method,
        params
      };

      let buffer = '';
      const handler = (data) => {
        buffer += data.toString();

        try {
          let text = buffer;
          let start = 0;

          while (start < text.length) {
            let braceCount = 0;
            let inString = false;
            let escaped = false;
            let objStart = -1;

            for (let i = start; i < text.length; i++) {
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
                        this.serverProcess.stdout.removeListener('data', handler);
                        const timeout = setTimeout(() => {}, 100);
                        clearTimeout(timeout);
                        resolve(parsed);
                        return;
                      }
                    } catch (e) {
                    }
                    start = i + 1;
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

      const timeout = setTimeout(() => {
        this.serverProcess.stdout.removeListener('data', handler);
        reject(new Error(`Request timeout for ${method}`));
      }, 5000);

      this.serverProcess.stdout.on('data', handler);

      this.serverProcess.stdin.write(JSON.stringify(request) + '\n');
    });
  }

  async test_MCP_Lists_Resources() {
    this.log('TEST', 'MCP lists resources via resources/list');

    try {
      const initResp = await this.sendRequest('initialize', {
        protocolVersion: '2024-11-05',
        capabilities: {},
        clientInfo: { name: 'test', version: '1.0.0' }
      });

      if (!initResp.result) {
        throw new Error('Initialize failed');
      }

      const resp = await this.sendRequest('resources/list');

      const passed = resp.result &&
                     Array.isArray(resp.result.resources) &&
                     resp.result.resources.length > 0;

      this.tests.push({
        name: 'MCP lists resources',
        passed,
        details: {
          resource_count: resp.result?.resources?.length || 0,
          has_tasks: resp.result?.resources?.some(r => r.uri?.startsWith('task://')) || false,
          has_flows: resp.result?.resources?.some(r => r.uri?.startsWith('flow://')) || false,
          has_tools: resp.result?.resources?.some(r => r.uri?.startsWith('tool://')) || false
        }
      });

      return passed;
    } catch (err) {
      this.tests.push({
        name: 'MCP lists resources',
        passed: false,
        details: { error: err.message }
      });
      return false;
    }
  }

  async test_MCP_Lists_Tools() {
    this.log('TEST', 'MCP lists tools via tools/list');

    try {
      const initResp = await this.sendRequest('initialize', {
        protocolVersion: '2024-11-05',
        capabilities: {},
        clientInfo: { name: 'test', version: '1.0.0' }
      });

      if (!initResp.result) {
        throw new Error('Initialize failed');
      }

      const resp = await this.sendRequest('tools/list');

      const passed = resp.result &&
                     Array.isArray(resp.result.tools) &&
                     resp.result.tools.length > 0;

      const expectedTools = [
        'execute_task',
        'execute_flow',
        'execute_tool',
        'list_tasks',
        'list_flows',
        'list_tools'
      ];

      const hasExpectedTools = expectedTools.every(toolName =>
        resp.result?.tools?.some(t => t.name === toolName)
      );

      this.tests.push({
        name: 'MCP lists tools',
        passed: passed && hasExpectedTools,
        details: {
          tool_count: resp.result?.tools?.length || 0,
          has_expected_tools: hasExpectedTools,
          missing_tools: expectedTools.filter(name =>
            !resp.result?.tools?.some(t => t.name === name)
          )
        }
      });

      return passed && hasExpectedTools;
    } catch (err) {
      this.tests.push({
        name: 'MCP lists tools',
        passed: false,
        details: { error: err.message }
      });
      return false;
    }
  }

  async test_MCP_Calls_Tool() {
    this.log('TEST', 'MCP executes tool call');

    try {
      const initResp = await this.sendRequest('initialize', {
        protocolVersion: '2024-11-05',
        capabilities: {},
        clientInfo: { name: 'test', version: '1.0.0' }
      });

      if (!initResp.result) {
        throw new Error('Initialize failed');
      }

      const resp = await this.sendRequest('tools/call', {
        name: 'list_tasks',
        arguments: {}
      });

      const passed = resp.result &&
                     resp.result.content &&
                     Array.isArray(resp.result.content);

      this.tests.push({
        name: 'MCP executes tool call',
        passed,
        details: {
          has_content: !!resp.result?.content,
          content_type: resp.result?.content?.[0]?.type,
          has_result_text: !!resp.result?.content?.[0]?.text
        }
      });

      return passed;
    } catch (err) {
      this.tests.push({
        name: 'MCP executes tool call',
        passed: false,
        details: { error: err.message }
      });
      return false;
    }
  }

  async test_MCP_Reads_Resource() {
    this.log('TEST', 'MCP reads resource via resources/read');

    try {
      const initResp = await this.sendRequest('initialize', {
        protocolVersion: '2024-11-05',
        capabilities: {},
        clientInfo: { name: 'test', version: '1.0.0' }
      });

      if (!initResp.result) {
        throw new Error('Initialize failed');
      }

      const listResp = await this.sendRequest('resources/list');
      const firstResource = listResp.result?.resources?.[0];

      if (!firstResource) {
        throw new Error('No resources found');
      }

      const readResp = await this.sendRequest('resources/read', {
        uri: firstResource.uri
      });

      const passed = readResp.result &&
                     readResp.result.uri &&
                     readResp.result.mimeType &&
                     readResp.result.contents;

      this.tests.push({
        name: 'MCP reads resource',
        passed,
        details: {
          uri: firstResource.uri,
          resource_readable: passed,
          content_type: readResp.result?.mimeType
        }
      });

      return passed;
    } catch (err) {
      this.tests.push({
        name: 'MCP reads resource',
        passed: false,
        details: { error: err.message }
      });
      return false;
    }
  }

  async test_MCP_Handles_Errors_Gracefully() {
    this.log('TEST', 'MCP handles errors gracefully');

    try {
      const initResp = await this.sendRequest('initialize', {
        protocolVersion: '2024-11-05',
        capabilities: {},
        clientInfo: { name: 'test', version: '1.0.0' }
      });

      if (!initResp.result) {
        throw new Error('Initialize failed');
      }

      const readResp = await this.sendRequest('resources/read', {
        uri: 'task://nonexistent-task-xyz'
      });

      const passed = readResp.jsonrpc === '2.0' &&
                     readResp.id !== undefined &&
                     (readResp.error || readResp.result);

      this.tests.push({
        name: 'MCP handles errors gracefully',
        passed,
        details: {
          error_response: !!readResp.error,
          proper_json_rpc: !!readResp.jsonrpc,
          has_id: readResp.id !== undefined
        }
      });

      return passed;
    } catch (err) {
      this.tests.push({
        name: 'MCP handles errors gracefully',
        passed: false,
        details: { error: err.message }
      });
      return false;
    }
  }

  async test_MCP_Stays_Alive_During_Multiple_Requests() {
    this.log('TEST', 'MCP stays alive during multiple sequential requests');

    try {
      const initResp = await this.sendRequest('initialize', {
        protocolVersion: '2024-11-05',
        capabilities: {},
        clientInfo: { name: 'test', version: '1.0.0' }
      });

      if (!initResp.result) {
        throw new Error('Initialize failed');
      }

      let failedReqs = 0;

      for (let i = 0; i < 5; i++) {
        const resp = await this.sendRequest('tools/list');
        if (!resp.result || !Array.isArray(resp.result.tools)) {
          failedReqs++;
        }
      }

      const passed = failedReqs === 0;

      this.tests.push({
        name: 'MCP stays alive during multiple requests',
        passed,
        details: {
          requests_sent: 5,
          requests_failed: failedReqs,
          server_alive: failedReqs === 0
        }
      });

      return passed;
    } catch (err) {
      this.tests.push({
        name: 'MCP stays alive during multiple requests',
        passed: false,
        details: { error: err.message }
      });
      return false;
    }
  }

  printResults() {
    console.log('\n' + '='.repeat(70));
    console.log('CLAUDE CODE MCP INTEGRATION TEST RESULTS');
    console.log('='.repeat(70));

    const passed = this.tests.filter(t => t.passed).length;
    const total = this.tests.length;

    console.log(`\nTotal Tests: ${total}`);
    console.log(`Passed: ${passed} (${Math.round(passed / total * 100)}%)`);
    console.log(`Failed: ${total - passed}`);

    console.log('\nDetailed Results:');
    this.tests.forEach(test => {
      const status = test.passed ? '✓' : '✗';
      console.log(`${status} ${test.name}`);
      if (test.details) {
        Object.entries(test.details).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            console.log(`    ${key}: ${JSON.stringify(value)}`);
          }
        });
      }
    });

    console.log('\n' + '='.repeat(70));
  }

  async runAll() {
    try {
      await this.startServer();
      this.log('INFO', 'Server started, running tests...');

      await this.test_MCP_Lists_Resources();
      await this.test_MCP_Lists_Tools();
      await this.test_MCP_Calls_Tool();
      await this.test_MCP_Reads_Resource();
      await this.test_MCP_Handles_Errors_Gracefully();
      await this.test_MCP_Stays_Alive_During_Multiple_Requests();

      this.printResults();
    } catch (err) {
      this.log('ERROR', `Test suite failed: ${err.message}`);
    } finally {
      await this.stopServer();
    }
  }
}

const test = new ClaudeCodeIntegrationTest();
await test.runAll();
