/**
 * agent-manager.js
 *
 * Agent creation and retrieval
 */

import { generateId } from './utils.js';

export function createAgentManager() {
  const agents = new Map();

  return {
    async create(config = {}) {
      const agentId = generateId();
      const agent = {
        id: agentId,
        name: config.name || `agent-${agentId}`,
        systemPrompt: config.systemPrompt,
        context: config.context || {},
        toolContext: new Map(),
        conversationHistory: []
      };
      agents.set(agentId, agent);
      return agent;
    },

    get(agentId) {
      return agents.get(agentId);
    },

    has(agentId) {
      return agents.has(agentId);
    }
  };
}
