/**
 * Config Loader
 * Load configuration from files and environment
 *
 * Delegates to:
 * - config-file-loader: File system configuration loading
 * - config-env-loader: Environment variable configuration loading
 */

import { createConfigFileLoader } from './config-file-loader.js';
import { createConfigEnvLoader } from './config-env-loader.js';

export function createConfigLoader() {
  const loadedConfigs = new Map();
  const fileLoader = createConfigFileLoader();
  const envLoader = createConfigEnvLoader();

  return {
    async loadConfig(resourceType, resourcePath, validator) {
      const cacheKey = `${resourceType}:${resourcePath}`;

      if (loadedConfigs.has(cacheKey)) {
        return loadedConfigs.get(cacheKey);
      }

      let config = {};

      const fileConfig = await fileLoader.loadFromFiles(resourceType, resourcePath);
      config = { ...config, ...fileConfig };

      const envConfig = envLoader.loadFromEnv(resourceType);
      config = { ...config, ...envConfig };

      const validation = validator.validateConfig(resourceType, config);
      if (!validation.valid) {
        throw new Error(`Invalid config: ${validation.errors.join(', ')}`);
      }

      loadedConfigs.set(cacheKey, config);
      return config;
    },

    loadEnvConfig: envLoader.loadFromEnv.bind(envLoader)
  };
}
