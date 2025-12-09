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

  validateType(value, expectedType) {
    const actualType = Array.isArray(value) ? 'array' : value === null ? 'null' : typeof value;
    return actualType === expectedType;
  }

  validateConstraints(value, constraints) {
    const errors = [];

    if (constraints.enum && !constraints.enum.includes(value)) {
      errors.push(`Value must be one of: ${constraints.enum.join(', ')}`);
    }

    if (constraints.minimum !== undefined && value < constraints.minimum) {
      errors.push(`Value must be >= ${constraints.minimum}`);
    }

    if (constraints.maximum !== undefined && value > constraints.maximum) {
      errors.push(`Value must be <= ${constraints.maximum}`);
    }

    if (constraints.minLength !== undefined && value.length < constraints.minLength) {
      errors.push(`String length must be >= ${constraints.minLength}`);
    }

    if (constraints.maxLength !== undefined && value.length > constraints.maxLength) {
      errors.push(`String length must be <= ${constraints.maxLength}`);
    }

    if (constraints.pattern) {
      const regex = new RegExp(constraints.pattern);
      if (!regex.test(value)) {
        errors.push(`Value must match pattern: ${constraints.pattern}`);
      }
    }

    return errors;
  }

  validateInputProperty(value, property, fieldName) {
    const errors = [];
    const actualType = Array.isArray(value) ? 'array' : value === null ? 'null' : typeof value;

    if (property.type && actualType !== property.type) {
      errors.push(`${fieldName}: Type mismatch - expected ${property.type}, got ${actualType}`);
      return { valid: false, errors };
    }

    if (actualType === 'string') {
      const strErrors = this.validateConstraints(value, {
        enum: property.enum,
        minLength: property.minLength,
        maxLength: property.maxLength,
        pattern: property.pattern
      });
      errors.push(...strErrors.map(e => `${fieldName}: ${e}`));
    }

    if (actualType === 'number') {
      const numErrors = this.validateConstraints(value, {
        enum: property.enum,
        minimum: property.minimum,
        maximum: property.maximum
      });
      errors.push(...numErrors.map(e => `${fieldName}: ${e}`));
    }

    if (actualType === 'array' && property.items) {
      if (!value.every(item => this.validateType(item, property.items.type))) {
        errors.push(`${fieldName}: Array items must be of type ${property.items.type}`);
      }
    }

    if (actualType === 'object' && property.properties) {
      for (const [key, subProp] of Object.entries(property.properties)) {
        if (value.hasOwnProperty(key)) {
          const subErrors = this.validateInputProperty(value[key], subProp, `${fieldName}.${key}`);
          if (!subErrors.valid) {
            errors.push(...subErrors.errors);
          }
        }
      }

      const required = property.required || [];
      for (const requiredKey of required) {
        if (!value.hasOwnProperty(requiredKey)) {
          errors.push(`${fieldName}: Missing required field: ${requiredKey}`);
        }
      }
    }

    return { valid: errors.length === 0, errors };
  }

  validateToolInputStrict(toolName, input) {
    const tool = this.findToolByName(toolName);
    if (!tool) return { valid: false, errors: [`Tool not found: ${toolName}`] };

    const schema = tool.mcp?.inputSchema;
    if (!schema) return { valid: false, errors: [`No schema found for tool: ${toolName}`] };

    const errors = [];
    const required = schema.required || [];

    for (const [fieldName, property] of Object.entries(schema.properties || {})) {
      if (!input.hasOwnProperty(fieldName)) {
        if (required.includes(fieldName)) {
          errors.push(`Missing required field: ${fieldName}`);
        }
        continue;
      }

      const validation = this.validateInputProperty(input[fieldName], property, fieldName);
      if (!validation.valid) {
        errors.push(...validation.errors);
      }
    }

    return { valid: errors.length === 0, errors };
  }

  coerceInputTypes(input, schema) {
    const coerced = {};

    for (const [fieldName, property] of Object.entries(schema.properties || {})) {
      if (!input.hasOwnProperty(fieldName)) continue;

      let value = input[fieldName];
      const inputType = Array.isArray(value) ? 'array' : typeof value;

      if (property.type === 'number' && inputType === 'string' && !isNaN(value)) {
        coerced[fieldName] = Number(value);
      } else if (property.type === 'string' && inputType === 'number') {
        coerced[fieldName] = String(value);
      } else if (property.type === 'boolean' && inputType === 'string') {
        coerced[fieldName] = ['true', '1', 'yes'].includes(value.toLowerCase());
      } else if (property.type === 'boolean' && inputType === 'number') {
        coerced[fieldName] = value !== 0 && value !== null;
      } else {
        coerced[fieldName] = value;
      }
    }

    return coerced;
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
