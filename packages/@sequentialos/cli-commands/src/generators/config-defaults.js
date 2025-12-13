/**
 * Config Defaults
 * Default configurations and schema definitions
 *
 * Delegates to:
 * - config-defaults-values: DEFAULT_CONFIGS constant
 * - config-defaults-schemas: DEFAULT_SCHEMAS constant
 */

import { DEFAULT_CONFIGS } from './config-defaults-values.js';
import { DEFAULT_SCHEMAS } from './config-defaults-schemas.js';

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
