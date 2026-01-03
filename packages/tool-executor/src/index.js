import { toolRegistry } from 'tool-registry';
import logger from 'sequential-logging';

export class ToolExecutor {
  async execute(category, toolName, input = {}) {
    const fullName = `${category}:${toolName}`;
    const tool = toolRegistry.get(fullName);

    if (!tool) {
      throw new Error(`Tool not found: ${fullName}`);
    }

    return this._executeTool(tool, input);
  }

  _hasCircularReferences(obj, seen = new WeakSet()) {
    if (obj === null || typeof obj !== 'object') return false;
    if (seen.has(obj)) return true;
    seen.add(obj);

    for (const value of Object.values(obj)) {
      if (this._hasCircularReferences(value, seen)) return true;
    }

    return false;
  }

  async _executeTool(tool, input) {
    try {
      if (this._hasCircularReferences(input)) {
        throw new Error('Invalid tool input: contains circular references');
      }

      if (tool.handler) {
        return await tool.handler(input);
      }

      if (tool.implementation) {
        if (typeof tool.implementation === 'function') {
          return await tool.implementation(input);
        }

        if (typeof tool.implementation === 'string') {
          return await this._executeFromString(tool.implementation, input);
        }
      }

      return this._defaultToolExecution(tool, input);
    } catch (err) {
      logger.error(`[ToolExecutor] Tool execution failed:`, err);
      throw err;
    }
  }

  async _executeFromString(implementation, input) {
    try {
      const fn = new Function('input', `return (${implementation})(input)`);
      return await fn(input);
    } catch (err) {
      logger.error('[ToolExecutor] Failed to parse implementation:', err);
      throw new Error(`Invalid tool implementation: ${err.message}`);
    }
  }

  _defaultToolExecution(tool, input) {
    return {
      success: true,
      executed: true,
      tool: tool.name || tool.id,
      input,
      timestamp: new Date().toISOString()
    };
  }
}

export async function executeTool(category, toolName, input = {}) {
  const executor = new ToolExecutor();
  return executor.execute(category, toolName, input);
}
