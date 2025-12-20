#!/usr/bin/env node
/**
 * GXE Dispatcher: Webhook Tool Trigger
 * Triggers tool execution via webhook-style invocation
 * 
 * Usage: gxe . webhook:tool --appId=app-myapp --toolName=myTool --params='{"data":"value"}'
 */

const path = require('path');
const fs = require('fs');

async function executeTool() {
  let appId = process.env.APP_ID;
  let toolName = process.env.TOOL_NAME;
  let toolParams = process.env.TOOL_PARAMS;
  
  // Parse CLI args
  for (let i = 0; i < process.argv.length; i++) {
    if (process.argv[i].startsWith('--appId=')) {
      appId = process.argv[i].split('=')[1];
    } else if (process.argv[i].startsWith('--toolName=')) {
      toolName = process.argv[i].split('=')[1];
    } else if (process.argv[i].startsWith('--params=')) {
      toolParams = process.argv[i].split('=')[1];
    }
  }
  
  if (!appId || !toolName) {
    console.error('Error: appId and toolName required');
    console.error('Usage: gxe . webhook:tool --appId=app-myapp --toolName=myTool --params=\'{...}\'');
    process.exit(1);
  }
  
  try {
    let params = {};
    if (toolParams) {
      try {
        params = JSON.parse(toolParams);
      } catch (e) {
        try {
          const fileContent = fs.readFileSync(toolParams, 'utf-8');
          params = JSON.parse(fileContent);
        } catch (fileErr) {
          console.error('Invalid JSON params or file:', toolParams);
          process.exit(1);
        }
      }
    }
    
    // Import ToolRegistry
    const ToolRegistryModule = require(path.join(__dirname, '../../packages/@sequentialos/app-sdk/src/tool-registry.js'));
    const ToolRegistry = ToolRegistryModule.ToolRegistry || ToolRegistryModule.default;
    
    if (!ToolRegistry) {
      throw new Error('Could not import ToolRegistry');
    }
    
    const registry = ToolRegistry.getInstance();
    const result = await registry.executeTool(appId, toolName, params);
    
    console.log(JSON.stringify(result, null, 2));
    process.exit(0);
  } catch (error) {
    console.error(JSON.stringify({
      success: false,
      error: {
        message: error.message,
        code: 'TOOL_EXECUTION_ERROR'
      }
    }, null, 2));
    process.exit(1);
  }
}

executeTool();
