import { generateId } from './utils.js';
import { nowISO, createTimestamps, updateTimestamp } from '@sequentialos/timestamp-utilities';

let Anthropic = null;
try {
  const module = await import('@anthropic-ai/sdk');
  Anthropic = module.default;
} catch (e) {
  // SDK not installed, will operate in degraded mode
}

export class AgentBackend {
  constructor(config = {}) {
    this.apiKey = config.apiKey || process.env.ANTHROPIC_API_KEY;
    this.model = config.model || 'claude-3-5-sonnet-20241022';
    this.client = Anthropic ? new Anthropic({ apiKey: this.apiKey }) : null;
    this.agents = new Map();
    this.tools = new Map();
    this.maxTokens = config.maxTokens || 4096;
    this.sdkAvailable = !!Anthropic;
  }

  registerTool(toolDef) {
    this.tools.set(toolDef.name, toolDef);
  }

  async createAgent(config = {}) {
    const agentId = generateId();
    const agent = {
      id: agentId,
      name: config.name || `agent-${agentId}`,
      systemPrompt: config.systemPrompt || this.defaultSystemPrompt(),
      context: config.context || {},
      toolContext: new Map(),
      conversationHistory: []
    };
    this.agents.set(agentId, agent);
    return agent;
  }

  async callTool(agentId, toolName, args) {
    const agent = this.agents.get(agentId);
    if (!agent) throw new Error(`Agent ${agentId} not found`);

    const tool = this.tools.get(toolName);
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

  async executeAgentLoop(agentId, userMessage, maxIterations = 10) {
    const agent = this.agents.get(agentId);
    if (!agent) throw new Error(`Agent ${agentId} not found`);

    if (!this.sdkAvailable) {
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

    const tools = Array.from(this.tools.values()).map(t => ({
      name: t.name,
      description: t.description,
      input_schema: {
        type: 'object',
        properties: t.parameters || {},
        required: t.required || []
      }
    }));

    let iterations = 0;
    const results = [];

    while (iterations < maxIterations) {
      iterations++;

      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: this.maxTokens,
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
        const toolResult = await this.callTool(agentId, toolUse.name, toolUse.input);

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

  defaultSystemPrompt() {
    return `You are a helpful agent that can use tools to accomplish tasks.
When you need to perform actions, use the available tools.
Always be clear about what you're doing and provide helpful responses to the user.
Think step-by-step before taking actions.`;
  }

  getAgent(agentId) {
    return this.agents.get(agentId);
  }

  listTools() {
    return Array.from(this.tools.values()).map(t => ({
      name: t.name,
      description: t.description,
      parameters: t.parameters || {}
    }));
  }
}

export { generateId };
