import { createToolService } from '@sequentialos/execution-service-unified';
import { toolRegistry } from '@sequentialos/tool-registry';
import logger from '@sequentialos/sequential-logging';

const toolService = createToolService();

export async function __callHostTool__(category, toolName, input = {}) {
  const fullName = `${category}:${toolName}`;

  logger.debug(`[ToolDispatcher] Calling: ${fullName}`, { input });

  try {
    const tool = toolRegistry.get(fullName);

    if (!tool) {
      throw new Error(`Tool not found: ${fullName}. Available tools: ${Array.from(toolRegistry.list()).join(', ')}`);
    }

    const result = await toolService.execute(fullName, input);

    if (!result.success) {
      throw new Error(result.error?.message || 'Tool execution failed');
    }

    return result.data;

  } catch (error) {
    logger.error(`[ToolDispatcher] Tool failed: ${fullName}`, error);
    throw error;
  }
}

export { toolRegistry, toolService };

// Make globally available for task code
globalThis.__callHostTool__ = __callHostTool__;

export default __callHostTool__;
