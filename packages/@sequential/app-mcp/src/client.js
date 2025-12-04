import { generateMCPTool, generateMCPResource } from './schema.js';

export class AppMCPClient {
  constructor(appId) {
    this.appId = appId;
    this.tools = new Map();
    this.resources = new Map();
  }

  tool(name, fn, description = '') {
    this.tools.set(name, { fn, description });
    const mcpDef = generateMCPTool(name, fn, description);
    const resource = generateMCPResource(this.appId, name, { description });
    this.resources.set(name, resource);
    return this;
  }

  async callTool(name, input) {
    const tool = this.tools.get(name);
    if (!tool) throw new Error(`Tool not found: ${name}`);

    try {
      const result = await tool.fn(input);
      return { success: true, result };
    } catch (e) {
      return { success: false, error: e.message, stack: e.stack };
    }
  }

  getMCPDefinition() {
    return {
      name: `${this.appId}-tools`,
      description: `Tools from app: ${this.appId}`,
      tools: Array.from(this.tools.entries()).map(([name, { description }]) => ({
        name,
        description,
        inputSchema: this.tools.get(name).fn
      })),
      resources: Array.from(this.resources.values())
    };
  }

  getToolsForContext() {
    return Array.from(this.tools.entries()).map(([name, { description, fn }]) => ({
      name,
      description,
      schema: fn.toString()
    }));
  }

  toJSON() {
    return {
      appId: this.appId,
      tools: Array.from(this.tools.keys()),
      resources: Array.from(this.resources.keys())
    };
  }
}

export default AppMCPClient;
