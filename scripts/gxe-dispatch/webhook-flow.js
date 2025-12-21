#!/usr/bin/env node
/**
 * GXE Dispatcher: Webhook Flow Trigger
 * Triggers flow execution via webhook-style invocation
 * 
 * Usage: gxe . webhook:flow --flowName=myFlow --input='{"data":"value"}'
 */

import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

async function executeFlow() {
  let flowName = process.env.FLOW_NAME;
  let flowInput = process.env.FLOW_INPUT;
  const flowId = process.env.FLOW_ID;
  
  // Parse CLI args
  for (let i = 0; i < process.argv.length; i++) {
    if (process.argv[i].startsWith('--flowName=')) {
      flowName = process.argv[i].split('=')[1];
    } else if (process.argv[i].startsWith('--input=')) {
      flowInput = process.argv[i].split('=')[1];
    }
  }
  
  if (!flowName) {
    console.error('Error: flowName required');
    console.error('Usage: gxe . webhook:flow --flowName=myFlow --input=\'{...}\'');
    process.exit(1);
  }
  
  try {
    let input = {};
    if (flowInput) {
      try {
        input = JSON.parse(flowInput);
      } catch (e) {
        try {
          const fileContent = fs.readFileSync(flowInput, 'utf-8');
          input = JSON.parse(fileContent);
        } catch (fileErr) {
          console.error('Invalid JSON input or file:', flowInput);
          process.exit(1);
        }
      }
    }
    
    // Import FlowService
    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    const flowServicePath = path.join(__dirname, '../../packages/@sequentialos/task-execution-service/src/services/flow-service.js');
    const FlowServiceModule = await import(`file://${flowServicePath}`);
    const FlowService = FlowServiceModule.FlowService || FlowServiceModule.default;
    
    if (!FlowService) {
      throw new Error('Could not import FlowService');
    }
    
    const flowService = new FlowService();
    const result = await flowService.executeFlow(flowName, input, {
      flowId: flowId,
      broadcast: true
    });
    
    console.log(JSON.stringify(result, null, 2));
    process.exit(0);
  } catch (error) {
    console.error(JSON.stringify({
      success: false,
      error: {
        message: error.message,
        code: 'FLOW_EXECUTION_ERROR'
      }
    }, null, 2));
    process.exit(1);
  }
}

executeFlow();
