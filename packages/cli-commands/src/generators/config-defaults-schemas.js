/**
 * Config Defaults Schemas
 * JSON Schema definitions for config validation
 */

export const DEFAULT_SCHEMAS = {
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
