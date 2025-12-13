/**
 * Config Defaults Values
 * Default configuration values for all resource types
 */

export const DEFAULT_CONFIGS = {
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
