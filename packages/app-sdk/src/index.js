import logger from '@sequential/sequential-logging';
export class AppSDK {
  constructor(config = {}) {
    this.appId = config.appId || `app-${Date.now()}`;
    this.agentBackend = config.agentBackend || null;
    this.tools = new Map();
    this.actions = new Map();
    this.eventHandlers = [];
    this.agentContext = {
      appId: this.appId,
      window: null,
      capabilities: [],
      toolsAvailable: [],
      maxConcurrent: config.maxConcurrent || 5
    };
  }

  registerTool(toolDef) {
    if (!toolDef.name || !toolDef.handler) {
      throw new Error('Tool must have name and handler');
    }

    this.tools.set(toolDef.name, {
      name: toolDef.name,
      description: toolDef.description || '',
      parameters: toolDef.parameters || {},
      required: toolDef.required || [],
      handler: toolDef.handler,
      metadata: toolDef.metadata || {}
    });

    this.agentContext.toolsAvailable.push(toolDef.name);

    if (this.agentBackend) {
      this.agentBackend.registerTool(this.tools.get(toolDef.name));
    }

    this.emit('tool:registered', { toolName: toolDef.name });
  }

  registerAction(actionName, handler) {
    this.actions.set(actionName, handler);
    this.agentContext.capabilities.push(actionName);
    this.emit('action:registered', { actionName });
  }

  async executeAction(action) {
    const startTime = Date.now();
    try {
      const handler = this.actions.get(action.type);
      if (!handler) {
        throw new Error(`Action ${action.type} not found`);
      }

      const result = await handler(action.data || {}, this.agentContext);
      const duration = Date.now() - startTime;

      this.emit('action:completed', {
        action: action.type,
        result,
        duration
      });

      return { success: true, result, duration };
    } catch (error) {
      const duration = Date.now() - startTime;
      this.emit('action:failed', {
        action: action.type,
        error: error.message,
        duration
      });

      return { success: false, error: error.message, duration };
    }
  }

  async callTool(toolName, args) {
    const tool = this.tools.get(toolName);
    if (!tool) {
      throw new Error(`Tool ${toolName} not found`);
    }

    const startTime = Date.now();
    try {
      const result = await tool.handler(args);
      const duration = Date.now() - startTime;

      this.emit('tool:executed', {
        tool: toolName,
        result,
        duration
      });

      return { success: true, result, duration };
    } catch (error) {
      const duration = Date.now() - startTime;
      this.emit('tool:failed', {
        tool: toolName,
        error: error.message,
        duration
      });

      return { success: false, error: error.message, duration };
    }
  }

  getAgentContext() {
    return {
      ...this.agentContext,
      timestamp: new Date().toISOString()
    };
  }

  setWindowContext(windowInfo) {
    this.agentContext.window = windowInfo;
    this.emit('window:context-set', windowInfo);
  }

  subscribeToEvents(handler) {
    this.eventHandlers.push(handler);
    return () => {
      const idx = this.eventHandlers.indexOf(handler);
      if (idx > -1) this.eventHandlers.splice(idx, 1);
    };
  }

  emit(eventType, data) {
    const event = {
      type: eventType,
      appId: this.appId,
      timestamp: new Date().toISOString(),
      data
    };

    this.eventHandlers.forEach(handler => {
      try {
        handler(event);
      } catch (error) {
        logger.error('Event handler error:', error);
      }
    });
  }

  listTools() {
    return Array.from(this.tools.values()).map(t => ({
      name: t.name,
      description: t.description,
      parameters: t.parameters,
      metadata: t.metadata
    }));
  }

  listActions() {
    return Array.from(this.actions.keys());
  }

  getToolInfo(toolName) {
    const tool = this.tools.get(toolName);
    if (!tool) return null;

    return {
      name: tool.name,
      description: tool.description,
      parameters: tool.parameters,
      required: tool.required,
      metadata: tool.metadata
    };
  }
}

export function createAppSDK(config) {
  return new AppSDK(config);
}
