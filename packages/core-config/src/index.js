/**
 * @sequentialos/core-config - Centralized configuration for sequential-ecosystem
 */

export { DEFAULTS } from './defaults.js';
export { SERVER_CONFIG } from './server.js';
export { SERVICES_CONFIG } from './services.js';
export { createValidator, validator } from './validate.js';
export { EnvSchema, EnvType, ValidationError, envSchema } from './schema.js';

// Convenience re-exports
export * from './defaults.js';
export * from './server.js';
export * from './services.js';
export * from './validate.js';
export * from './schema.js';
