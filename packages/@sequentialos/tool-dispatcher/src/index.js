import { toolRegistry } from '@sequentialos/tool-registry';
import { executeTool } from '@sequentialos/tool-executor';
import logger from '@sequentialos/sequential-logging';

export async function __callHostTool__(category, toolName, input = {}) {
  const fullName = `${category}:${toolName}`;

  logger.debug(`[ToolDispatcher] Calling: ${fullName}`, { input });

  try {
    await toolRegistry.loadAll();
    const tool = toolRegistry.get(fullName);

    if (!tool) {
      throw new Error(`Tool not found: ${fullName}. Available tools: ${Array.from(toolRegistry.list()).join(', ')}`);
    }

    const result = await executeTool(category, toolName, input);

    return result;

  } catch (error) {
    logger.error(`[ToolDispatcher] Tool failed: ${fullName}`, error);
    throw error;
  }
}

export { toolRegistry };

// Make globally available for task code
globalThis.__callHostTool__ = __callHostTool__;

export default __callHostTool__;
