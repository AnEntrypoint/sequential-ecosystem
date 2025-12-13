import { createConfigLoader } from './config-loader.js';
import { createConfigValidator } from './config-validator.js';
import { createDefaultConfig, registerDefaultSchemas } from './config-defaults.js';
import { createConfigUtilities } from './config-utilities.js';

/**
 * config-management-core.js - Facade for configuration management
 *
 * Delegates to focused modules:
 * - config-loader: File and environment loading
 * - config-validator: Schema-based validation
 * - config-defaults: Default configurations and schemas
 * - config-utilities: Merge and environment utilities
 */

export function createConfigManager() {
  const loader = createConfigLoader();
  const validator = createConfigValidator();
  const defaults = createDefaultConfig();
  const utilities = createConfigUtilities();

  return {
    registerSchema(resourceType, schema) {
      return validator.registerSchema(resourceType, schema);
    },

    async loadConfig(resourceType, resourcePath) {
      return loader.loadConfig(resourceType, resourcePath, validator);
    },

    loadEnvConfig(resourceType) {
      return loader.loadEnvConfig(resourceType);
    },

    validateConfig(resourceType, config) {
      return validator.validateConfig(resourceType, config);
    },

    mergeConfig(...configs) {
      return utilities.mergeConfig(...configs);
    },

    getEnvironmentConfig() {
      return utilities.getEnvironmentConfig();
    },

    async createDefaultConfig(resourceType) {
      return defaults.createDefaultConfig(resourceType);
    }
  };
}

export function registerDefaultSchemas(configManager) {
  return registerDefaultSchemas(configManager.registerSchema ? configManager : configManager.validator);
}
