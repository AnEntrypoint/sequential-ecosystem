/**
 * agent-loop.js
 *
 * Agent reasoning loop orchestration with tool use
 */

export function createAgentLoop(client, agentManager, toolExecutor, toolRegistry) {
  return {
    async execute(agentId, userMessage, maxIterations = 10, config = {}) {
      const agent = agentManager.get(agentId);
      if (!agent) throw new Error(`Agent ${agentId} not found`);

      if (!client) {
        return {
          success: false,
          error: 'Anthropic SDK not available',
          agentId,
          message: 'Agent backend requires @anthropic-ai/sdk to be installed'
        };
      }

      agent.conversationHistory.push({
        role: 'user',
        content: userMessage
      });

      const tools = toolRegistry.toMCPFormat();
      let iterations = 0;
      const results = [];

      while (iterations < maxIterations) {
        iterations++;

        const response = await client.messages.create({
          model: config.model || 'claude-3-5-sonnet-20241022',
          max_tokens: config.maxTokens || 4096,
          system: agent.systemPrompt,
          tools: tools.length > 0 ? tools : undefined,
          messages: agent.conversationHistory
        });

        results.push({
          iteration: iterations,
          stopReason: response.stop_reason,
          usage: {
            inputTokens: response.usage.input_tokens,
            outputTokens: response.usage.output_tokens
          }
        });

        if (response.stop_reason === 'end_turn') {
          const finalMessage = response.content
            .filter(b => b.type === 'text')
            .map(b => b.text)
            .join('');

          agent.conversationHistory.push({
            role: 'assistant',
            content: finalMessage
          });

          return {
            success: true,
            agentId,
            finalMessage,
            iterations,
            results
          };
        }

        agent.conversationHistory.push({
          role: 'assistant',
          content: response.content
        });

        const toolUses = response.content.filter(b => b.type === 'tool_use');
        if (toolUses.length === 0) break;

        for (const toolUse of toolUses) {
          const toolResult = await toolExecutor.call(agentId, toolUse.name, toolUse.input);

          agent.conversationHistory.push({
            role: 'user',
            content: [{
              type: 'tool_result',
              tool_use_id: toolUse.id,
              content: JSON.stringify(toolResult)
            }]
          });
        }
      }

      return {
        success: false,
        agentId,
        error: `Max iterations (${maxIterations}) exceeded`,
        iterations,
        results
      };
    }
  };
}
