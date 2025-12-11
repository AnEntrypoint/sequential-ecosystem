/**
 * index.js - AgentBackend Facade
 *
 * Delegates to focused modules:
 * - agent-manager: Create and retrieve agents
 * - tool-registry: Register and list tools
 * - tool-executor: Execute tool calls
 * - agent-loop: Run reasoning loop with tools
 */

import { generateId } from './utils.js';
import { createAgentManager } from './agent-manager.js';
import { createToolRegistry } from './tool-registry.js';
import { createToolExecutor } from './tool-executor.js';
import { createAgentLoop } from './agent-loop.js';

let Anthropic = null;
try {
  const module = await import('@anthropic-ai/sdk');
  Anthropic = module.default;
} catch (e) {
  // SDK not installed, will operate in degraded mode
}

const DEFAULT_SYSTEM_PROMPT = `You are a helpful agent that can use tools to accomplish tasks.
When you need to perform actions, use the available tools.
Always be clear about what you're doing and provide helpful responses to the user.
Think step-by-step before taking actions.`;

export class AgentBackend {
  constructor(config = {}) {
    this.apiKey = config.apiKey || process.env.ANTHROPIC_API_KEY;
    this.model = config.model || 'claude-3-5-sonnet-20241022';
    this.client = Anthropic ? new Anthropic({ apiKey: this.apiKey }) : null;
    this.maxTokens = config.maxTokens || 4096;
    this.sdkAvailable = !!Anthropic;

    // Initialize modules
    this.agentManager = createAgentManager();
    this.toolRegistry = createToolRegistry();
    this.toolExecutor = createToolExecutor(this.toolRegistry, this.agentManager);
    this.agentLoop = createAgentLoop(this.client, this.agentManager, this.toolExecutor, this.toolRegistry);
  }

  registerTool(toolDef) {
    this.toolRegistry.register(toolDef);
  }

  async createAgent(config = {}) {
    const agent = await this.agentManager.create({
      name: config.name,
      systemPrompt: config.systemPrompt || DEFAULT_SYSTEM_PROMPT,
      context: config.context
    });
    return agent;
  }

  async callTool(agentId, toolName, args) {
    return this.toolExecutor.call(agentId, toolName, args);
  }

  async executeAgentLoop(agentId, userMessage, maxIterations = 10) {
    return this.agentLoop.execute(agentId, userMessage, maxIterations, {
      model: this.model,
      maxTokens: this.maxTokens
    });
  }

  getAgent(agentId) {
    return this.agentManager.get(agentId);
  }

  listTools() {
    return this.toolRegistry.list();
  }
}

export { generateId };
