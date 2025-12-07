import path from 'path';
import { existsSync } from 'fs';
import fse from 'fs-extra';
import logger from '@sequential/sequential-logging';

export async function runTool(options) {
  const { toolName, input = {}, verbose = false } = options;

  const toolsDir = path.resolve(process.cwd(), 'tools');
  const toolFile = path.join(toolsDir, `${toolName}.json`);

  if (!existsSync(toolFile)) {
    throw new Error(`Tool '${toolName}' not found at ${toolFile}`);
  }

  if (verbose) {
    logger.info(`Running tool: ${toolName}`);
    logger.info(`Input:`, input);
  }

  try {
    const toolConfig = JSON.parse(await fse.readFile(toolFile, 'utf-8'));

    if (!toolConfig.implementation) {
      throw new Error(`Tool '${toolName}' has no implementation defined`);
    }

    if (verbose) {
      logger.info('✓ Tool config loaded');
      logger.info('Executing tool implementation...');
    }

    let toolFunction;
    try {
      const impl = toolConfig.implementation;
      const match = impl.match(/^export\s+(async\s+)?function\s+\w+\s*\((.*?)\)\s*\{([\s\S]*)\}$/);

      if (!match) {
        throw new Error('Tool implementation must be a function definition');
      }

      const isAsync = impl.includes('async');
      const params = match[2];
      const body = match[3];

      const fnStr = `${isAsync ? 'async ' : ''}function (${params}) {${body}}`;
      toolFunction = new Function(`return (${fnStr})`)();
    } catch (parseErr) {
      throw new Error(`Failed to parse tool implementation: ${parseErr.message}`);
    }

    if (typeof toolFunction !== 'function') {
      throw new Error(`Tool '${toolName}' implementation is not a function`);
    }

    const result = await toolFunction(input);

    if (verbose) {
      logger.info('✓ Tool executed successfully');
      logger.info('Result:', JSON.stringify(result, null, 2));
    }

    return {
      valid: true,
      executed: true,
      result
    };
  } catch (e) {
    const error = e instanceof Error ? e.message : String(e);
    logger.error('✗ Tool execution failed:', error);
    if (verbose && e instanceof Error && e.stack) {
      logger.error('Stack trace:', e.stack);
    }
    return {
      valid: false,
      executed: false,
      error
    };
  }
}
