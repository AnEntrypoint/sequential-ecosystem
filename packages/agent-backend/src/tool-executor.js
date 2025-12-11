/**
 * tool-executor.js
 *
 * Tool invocation with timing and error handling
 */

import { nowISO } from '@sequentialos/timestamp-utilities';

export function createToolExecutor(toolRegistry, agentManager) {
  return {
    async call(agentId, toolName, args) {
      const agent = agentManager.get(agentId);
      if (!agent) throw new Error(`Agent ${agentId} not found`);

      const tool = toolRegistry.get(toolName);
      if (!tool) throw new Error(`Tool ${toolName} not found`);

      const startTime = Date.now();
      try {
        const result = await tool.handler(args, agent.toolContext);
        const duration = Date.now() - startTime;

        return {
          success: true,
          result,
          duration,
          timestamp: nowISO(),
          tool: toolName
        };
      } catch (error) {
        const duration = Date.now() - startTime;
        return {
          success: false,
          error: error.message,
          duration,
          timestamp: nowISO(),
          tool: toolName
        };
      }
    }
  };
}
