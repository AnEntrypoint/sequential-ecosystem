#!/usr/bin/env node

import path from 'path';
import { fileURLToPath } from 'url';
import { SERVER_CONFIG } from 'core-config';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.join(__dirname, '..');
process.chdir(projectRoot);

const args = process.argv.slice(2);

if (args.length < 1) {
  console.error('Usage: flow <flow-name> [input-json]');
  console.error('');
  console.error('Examples:');
  console.error('  flow sample-flow \'{}\'');
  console.error('  flow sample-flow \'{"key":"value"}\'');
  console.error('  echo \'{"key":"value"}\' | flow sample-flow');
  process.exit(1);
}

const flowName = args[0];
let input = {};
let hasArgInput = false;

if (args[1]) {
  hasArgInput = true;
  try {
    input = JSON.parse(args[1]);
  } catch (err) {
    console.error(JSON.stringify({ success: false, error: { message: `Invalid JSON input: ${err.message}`, code: 'JSON_PARSE_ERROR' } }));
    process.exit(1);
  }
}

async function runFlow() {
  try {
    if (!hasArgInput && !process.stdin.isTTY) {
      const chunks = [];
      for await (const chunk of process.stdin) {
        chunks.push(chunk);
      }
      const stdinData = Buffer.concat(chunks).toString('utf-8').trim();
      if (stdinData) {
        try {
          input = JSON.parse(stdinData);
        } catch (err) {
          console.error(JSON.stringify({ success: false, error: { message: `Invalid JSON from stdin: ${err.message}`, code: 'JSON_PARSE_ERROR' } }));
          process.exit(1);
        }
      }
    }

    const port = process.env.PORT ? parseInt(process.env.PORT) : 8003;
    const host = process.env.HOST || SERVER_CONFIG.HOST;
    const serverUrl = `http://${host}:${port}`;
    const apiUrl = `${serverUrl}/api/flows/${flowName}/execute`;
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
      signal: AbortSignal.timeout(SERVER_CONFIG.REQUEST_TIMEOUT)
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { success: false, error: { message: errorText, code: `HTTP_${response.status}` } };
      }
      console.error(JSON.stringify(errorData));
      process.exit(1);
    }

    const result = await response.json();
    console.log(JSON.stringify(result, null, 2));

    if (!result.success) {
      process.exit(1);
    }
  } catch (err) {
    console.error(JSON.stringify({ success: false, error: { message: `Fatal error: ${err.message}`, code: 'EXECUTION_ERROR' } }));
    process.exit(1);
  }
}

runFlow();
