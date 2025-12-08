import path from 'path';
import fs from 'fs-extra';

export function createConfigManager() {
  const loadedConfigs = new Map();
  const schemas = new Map();

  return {
    registerSchema(resourceType, schema) {
      schemas.set(resourceType, schema);
      return this;
    },

    async loadConfig(resourceType, resourcePath) {
      const cacheKey = `${resourceType}:${resourcePath}`;

      if (loadedConfigs.has(cacheKey)) {
        return loadedConfigs.get(cacheKey);
      }

      let config = {};
      const searchPaths = [
        resourcePath,
        path.join(resourcePath, '..'),
        path.join(resourcePath, '../..'),
        process.cwd()
      ];

      for (const dir of searchPaths) {
        const configFile = path.join(dir, '.sequentialrc.json');
        const resourceConfigFile = path.join(dir, `${resourceType}.config.json`);

        if (fs.existsSync(configFile)) {
          const global = await fs.readJson(configFile);
          config = { ...config, ...global };
        }

        if (fs.existsSync(resourceConfigFile)) {
          const specific = await fs.readJson(resourceConfigFile);
          config = { ...config, ...specific };
        }
      }

      const envConfig = this.loadEnvConfig(resourceType);
      config = { ...config, ...envConfig };

      const validation = this.validateConfig(resourceType, config);
      if (!validation.valid) {
        throw new Error(`Invalid config: ${validation.errors.join(', ')}`);
      }

      loadedConfigs.set(cacheKey, config);
      return config;
    },

    loadEnvConfig(resourceType) {
      const env = process.env.NODE_ENV || 'development';
      const config = {};

      const envVars = {
        database: ['DATABASE_URL', 'DB_HOST', 'DB_PORT', 'DB_USER', 'DB_PASSWORD'],
        api: ['API_KEY', 'API_BASE_URL', 'API_TIMEOUT'],
        auth: ['AUTH_SECRET', 'JWT_SECRET', 'OAUTH_CLIENT_ID', 'OAUTH_CLIENT_SECRET'],
        storage: ['STORAGE_PATH', 'CLOUD_BUCKET', 'CLOUD_KEY'],
        services: ['OPENAI_API_KEY', 'GAPI_KEY', 'SLACK_TOKEN', 'ANTHROPIC_API_KEY']
      };

      const relevantVars = envVars[resourceType] || [];
      for (const key of relevantVars) {
        if (process.env[key]) {
          config[key.toLowerCase()] = process.env[key];
        }
      }

      return config;
    },

    validateConfig(resourceType, config) {
      const schema = schemas.get(resourceType);
      if (!schema) return { valid: true, errors: [] };

      const errors = [];

      if (schema.required) {
        for (const field of schema.required) {
          if (config[field] === undefined) {
            errors.push(`Missing required config: ${field}`);
          }
        }
      }

      for (const [field, constraint] of Object.entries(schema.properties || {})) {
        if (config[field] === undefined) continue;

        if (constraint.type === 'string' && typeof config[field] !== 'string') {
          errors.push(`${field} must be a string`);
        }

        if (constraint.type === 'number' && typeof config[field] !== 'number') {
          errors.push(`${field} must be a number`);
        }

        if (constraint.pattern && !new RegExp(constraint.pattern).test(config[field])) {
          errors.push(`${field} does not match pattern: ${constraint.pattern}`);
        }

        if (constraint.enum && !constraint.enum.includes(config[field])) {
          errors.push(`${field} must be one of: ${constraint.enum.join(', ')}`);
        }
      }

      return { valid: errors.length === 0, errors };
    },

    mergeConfig(...configs) {
      return configs.reduce((merged, config) => ({
        ...merged,
        ...(config || {})
      }), {});
    },

    getEnvironmentConfig() {
      const env = process.env.NODE_ENV || 'development';
      return {
        environment: env,
        isDevelopment: env === 'development',
        isStaging: env === 'staging',
        isProduction: env === 'production',
        debug: process.env.DEBUG === '1'
      };
    },

    async createDefaultConfig(resourceType) {
      const defaults = {
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

      return defaults[resourceType] || {};
    }
  };
}

export function registerDefaultSchemas(configManager) {
  configManager
    .registerSchema('task', {
      type: 'object',
      properties: {
        timeout: { type: 'number', minimum: 0 },
        retryable: { type: 'boolean' },
        maxRetries: { type: 'number', minimum: 0, maximum: 10 },
        cacheEnabled: { type: 'boolean' },
        cacheTTL: { type: 'number', minimum: 1000 },
        errorHandler: { type: 'string', enum: ['throw', 'log', 'fallback'] }
      }
    })
    .registerSchema('tool', {
      type: 'object',
      properties: {
        timeout: { type: 'number', minimum: 0 },
        retryable: { type: 'boolean' },
        category: { type: 'string' },
        tags: { type: 'array' },
        rateLimit: { type: 'number', minimum: 0 }
      }
    })
    .registerSchema('flow', {
      type: 'object',
      properties: {
        timeout: { type: 'number', minimum: 0 },
        parallel: { type: 'boolean' },
        checkpointEnabled: { type: 'boolean' },
        errorHandler: { type: 'string', enum: ['throw', 'fallback', 'recover'] }
      }
    })
    .registerSchema('app', {
      type: 'object',
      properties: {
        port: { type: 'number', minimum: 1024, maximum: 65535 },
        realtime: { type: 'boolean' },
        storage: { type: 'string', enum: ['folder', 'sqlite', 'postgres', 'supabase'] },
        cacheSize: { type: 'number', minimum: 100 },
        apiTimeout: { type: 'number', minimum: 1000 }
      }
    });

  return configManager;
}
