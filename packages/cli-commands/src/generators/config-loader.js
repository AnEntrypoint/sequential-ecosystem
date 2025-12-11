import path from 'path';
import fs from 'fs-extra';

/**
 * config-loader.js
 *
 * Load configuration from files and environment
 */

export function createConfigLoader() {
  const loadedConfigs = new Map();

  return {
    async loadConfig(resourceType, resourcePath, validator) {
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

      const validation = validator.validateConfig(resourceType, config);
      if (!validation.valid) {
        throw new Error(`Invalid config: ${validation.errors.join(', ')}`);
      }

      loadedConfigs.set(cacheKey, config);
      return config;
    },

    loadEnvConfig(resourceType) {
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
    }
  };
}
