/**
 * config-defaults.js
 *
 * Default configurations and schema definitions
 */

const DEFAULT_CONFIGS = {
  task: {
    timeout: 300000,
    retryable: true,
    maxRetries: 3,
    cacheEnabled: false
  },
  tool: {
    timeout: 60000,
    retryable: false,
    category: 'general',
    tags: []
  },
  flow: {
    timeout: null,
    parallel: false,
    errorHandler: 'throw'
  },
  app: {
    port: 3001,
    realtime: true,
    storage: 'folder',
    cacheSize: 1000
  }
};

const DEFAULT_SCHEMAS = {
  task: {
    type: 'object',
    properties: {
      timeout: { type: 'number', minimum: 0 },
      retryable: { type: 'boolean' },
      maxRetries: { type: 'number', minimum: 0, maximum: 10 },
      cacheEnabled: { type: 'boolean' },
      cacheTTL: { type: 'number', minimum: 1000 },
      errorHandler: { type: 'string', enum: ['throw', 'log', 'fallback'] }
    }
  },
  tool: {
    type: 'object',
    properties: {
      timeout: { type: 'number', minimum: 0 },
      retryable: { type: 'boolean' },
      category: { type: 'string' },
      tags: { type: 'array' },
      rateLimit: { type: 'number', minimum: 0 }
    }
  },
  flow: {
    type: 'object',
    properties: {
      timeout: { type: 'number', minimum: 0 },
      parallel: { type: 'boolean' },
      checkpointEnabled: { type: 'boolean' },
      errorHandler: { type: 'string', enum: ['throw', 'fallback', 'recover'] }
    }
  },
  app: {
    type: 'object',
    properties: {
      port: { type: 'number', minimum: 1024, maximum: 65535 },
      realtime: { type: 'boolean' },
      storage: { type: 'string', enum: ['folder', 'sqlite', 'postgres', 'supabase'] },
      cacheSize: { type: 'number', minimum: 100 },
      apiTimeout: { type: 'number', minimum: 1000 }
    }
  }
};

export function createDefaultConfig() {
  return {
    async createDefaultConfig(resourceType) {
      return DEFAULT_CONFIGS[resourceType] || {};
    }
  };
}

export function registerDefaultSchemas(configValidator) {
  for (const [resourceType, schema] of Object.entries(DEFAULT_SCHEMAS)) {
    configValidator.registerSchema(resourceType, schema);
  }
  return configValidator;
}
