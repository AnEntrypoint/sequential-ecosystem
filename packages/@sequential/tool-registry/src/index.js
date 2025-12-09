export class ToolRegistry {
  static instance = null;

  constructor(repository = null) {
    this.apps = new Map();
    this.tools = new Map();
    this.repository = repository;
    this.persistedToolsLoaded = false;
  }

  static getInstance(repository = null) {
    if (!ToolRegistry.instance) {
      ToolRegistry.instance = new ToolRegistry(repository);
    } else if (repository && !ToolRegistry.instance.repository) {
      ToolRegistry.instance.repository = repository;
    }
    return ToolRegistry.instance;
  }

  async loadPersistedTools() {
    if (this.persistedToolsLoaded || !this.repository) return;

    try {
      const tools = await this.repository.getAll();
      tools.forEach(tool => {
        const key = `__persisted:${tool.id}`;
        this.tools.set(key, {
          id: tool.id,
          name: tool.name,
          description: tool.description || '',
          category: tool.category || 'Custom',
          implementation: tool.implementation,
          imports: tool.imports,
          isPersisted: true,
          appId: '__persisted',
          handler: null,
          mcp: {
            type: 'tool',
            name: tool.name,
            description: tool.description || '',
            inputSchema: {
              type: 'object',
              properties: {}
            }
          }
        });
      });
      this.persistedToolsLoaded = true;
    } catch (err) {
      console.error('Failed to load persisted tools:', err);
    }
  }

  async saveTool(toolData) {
    if (!this.repository) {
      throw new Error('No repository configured for tool persistence');
    }
    const id = toolData.id || toolData.name.toLowerCase().replace(/\s+/g, '-');
    await this.repository.save(id, toolData);

    const key = `__persisted:${id}`;
    this.tools.set(key, {
      id,
      name: toolData.name,
      description: toolData.description || '',
      category: toolData.category || 'Custom',
      implementation: toolData.implementation,
      imports: toolData.imports,
      isPersisted: true,
      appId: '__persisted',
      handler: null,
      createdAt: toolData.createdAt,
      updatedAt: toolData.updatedAt
    });
    return id;
  }

  async deleteTool(toolId) {
    if (!this.repository) {
      throw new Error('No repository configured for tool persistence');
    }
    await this.repository.delete(toolId);
    const key = `__persisted:${toolId}`;
    this.tools.delete(key);
  }

  registerApp(appId, sdk) {
    this.apps.set(appId, {
      id: appId,
      sdk,
      tools: sdk.getTools ? sdk.getTools() : [],
      registered: Date.now()
    });

    sdk.getTools?.().forEach(tool => {
      const key = `${appId}:${tool.name}`;
      this.tools.set(key, {
        appId,
        name: tool.name,
        description: tool.description,
        mcp: tool.mcp,
        handler: tool.handler,
        isPersisted: false
      });
    });
  }

  unregisterApp(appId) {
    this.apps.delete(appId);
    const keysToDelete = Array.from(this.tools.keys())
      .filter(k => k.startsWith(`${appId}:`));
    keysToDelete.forEach(k => this.tools.delete(k));
  }

  getAppTools(appId) {
    const app = this.apps.get(appId);
    if (!app) return [];
    return Array.from(this.tools.entries())
      .filter(([key]) => key.startsWith(`${appId}:`))
      .map(([, tool]) => tool);
  }

  getPersistedTools() {
    return Array.from(this.tools.entries())
      .filter(([key]) => key.startsWith('__persisted:'))
      .map(([, tool]) => tool);
  }

  getAllTools() {
    return Array.from(this.tools.values());
  }

  getToolsByApp() {
    const result = { __persisted: this.getPersistedTools() };
    this.apps.forEach((app, appId) => {
      result[appId] = this.getAppTools(appId);
    });
    return result;
  }

  findTool(appId, toolName) {
    if (appId === '__persisted') {
      const key = `__persisted:${toolName}`;
      return this.tools.get(key);
    }
    const key = `${appId}:${toolName}`;
    return this.tools.get(key);
  }

  findToolByName(toolName) {
    for (const [, tool] of this.tools.entries()) {
      if (tool.name === toolName || tool.id === toolName) {
        return tool;
      }
    }
    return null;
  }

  findToolsByName(toolName) {
    const matches = [];
    for (const [, tool] of this.tools.entries()) {
      if (tool.name === toolName || tool.id === toolName) {
        matches.push(tool);
      }
    }
    return matches;
  }

  searchTools(query) {
    const q = query.toLowerCase();
    return Array.from(this.tools.values()).filter(tool =>
      tool.name.toLowerCase().includes(q) ||
      tool.description?.toLowerCase().includes(q) ||
      tool.category?.toLowerCase().includes(q)
    );
  }

  detectCircularDependency(toolName, visited = new Set()) {
    if (visited.has(toolName)) return true;
    visited.add(toolName);

    const tool = this.findToolByName(toolName);
    if (!tool || !tool.dependencies) return false;

    for (const dep of tool.dependencies) {
      if (this.detectCircularDependency(dep, new Set(visited))) {
        return true;
      }
    }
    return false;
  }

  resolveDependencyOrder(toolName, resolved = [], visiting = new Set()) {
    if (visiting.has(toolName)) return null;

    if (resolved.includes(toolName)) return resolved;

    visiting.add(toolName);
    const tool = this.findToolByName(toolName);
    if (!tool) return null;

    const deps = tool.dependencies || [];
    for (const dep of deps) {
      const result = this.resolveDependencyOrder(dep, resolved, new Set(visiting));
      if (!result) return null;
      resolved = result;
    }

    resolved.push(toolName);
    return resolved;
  }

  validateToolChain(toolName) {
    const isCircular = this.detectCircularDependency(toolName);
    if (isCircular) {
      return { isValid: false, circular: true, order: null, error: `Circular dependency detected in ${toolName}` };
    }

    const order = this.resolveDependencyOrder(toolName);
    if (!order) {
      return { isValid: false, circular: false, order: null, error: `Failed to resolve dependencies for ${toolName}` };
    }

    return { isValid: true, circular: false, order };
  }

  getToolDependencies(toolName) {
    const tool = this.findToolByName(toolName);
    if (!tool) return null;
    return tool.dependencies || [];
  }

  getToolSchema(toolName, version = null) {
    const tool = this.findToolByName(toolName);
    if (!tool) return null;

    if (!tool.mcp || !tool.mcp.inputSchema) {
      return null;
    }

    const schema = tool.mcp.inputSchema;
    if (!version) return schema;

    return schema.version === version ? schema : null;
  }

  validateToolInput(toolName, input, version = null) {
    const schema = this.getToolSchema(toolName, version);
    if (!schema) return { valid: false, error: 'Tool or schema not found' };

    const errors = [];
    const required = schema.required || [];

    for (const field of required) {
      if (!input.hasOwnProperty(field)) {
        errors.push(`Missing required field: ${field}`);
      }
    }

    if (errors.length > 0) {
      return { valid: false, errors };
    }

    return { valid: true };
  }

  registerSchemaVersion(toolName, version, schema, changelog = []) {
    const tool = this.findToolByName(toolName);
    if (!tool) return { success: false, error: 'Tool not found' };

    if (!tool.mcp) tool.mcp = {};
    if (!tool.schemaHistory) tool.schemaHistory = [];

    const existingSchema = tool.mcp.inputSchema;
    if (existingSchema) {
      tool.schemaHistory.push({
        version: existingSchema.version || 1,
        schema: existingSchema,
        timestamp: Date.now()
      });
    }

    tool.mcp.inputSchema = {
      ...schema,
      version,
      changelog,
      timestamp: Date.now()
    };

    return { success: true, version };
  }

  migrateToolInput(toolName, input, fromVersion, toVersion) {
    const tool = this.findToolByName(toolName);
    if (!tool) return { success: false, error: 'Tool not found' };

    if (!tool.migrations) {
      return { success: false, error: 'No migrations defined for tool' };
    }

    const migrationKey = `${fromVersion}->${toVersion}`;
    const migration = tool.migrations[migrationKey];

    if (!migration) {
      return { success: false, error: `No migration path from ${fromVersion} to ${toVersion}` };
    }

    try {
      const migratedInput = typeof migration === 'function' ? migration(input) : input;
      return { success: true, data: migratedInput };
    } catch (err) {
      return { success: false, error: `Migration failed: ${err.message}` };
    }
  }

  getStats() {
    const persistedCount = this.getPersistedTools().length;
    const appCount = this.apps.size;
    return {
      totalApps: appCount,
      totalTools: this.tools.size,
      persistedTools: persistedCount,
      appTools: this.tools.size - persistedCount,
      apps: Array.from(this.apps.entries()).map(([id, app]) => ({
        id,
        toolCount: this.getAppTools(id).length,
        registered: app.registered
      }))
    };
  }

  toJSON() {
    return {
      apps: Array.from(this.apps.keys()),
      tools: this.getToolsByApp(),
      stats: this.getStats()
    };
  }
}

export default ToolRegistry.getInstance();
