/**
 * Default configuration values for sequential-ecosystem
 * Centralized to avoid hardcoded values across packages
 */

export const DEFAULTS = {
  // HTTP & Server
  HTTP: {
    DEFAULT_PORT: 3000,
    DEFAULT_LISTEN_HOST: 'localhost',
    DEFAULT_CORS_ORIGIN: '*',
    REQUEST_TIMEOUT: 30000,
    RESPONSE_TIMEOUT: 30000,
    JSON_LIMIT: '50mb'
  },

  // Service Ports
  SERVICES: {
    DENO_EXECUTOR: 3100,
    STACK_PROCESSOR: 3101,
    TASK_EXECUTOR: 3102,
    GAPI: 3103,
    KEYSTORE: 3104,
    SUPABASE: 3105,
    OPENAI: 3106,
    WEBSEARCH: 3107,
    ADMIN_DEBUG: 3108
  },

  // Timeouts (milliseconds)
  TIMEOUTS: {
    SERVICE_CALL: 30000,
    EXTERNAL_API: 30000,
    EXECUTION: 30000,
    RECONNECT: 3000,
    HEALTH_CHECK: 5000,
    WEBSOCKET_PING: 5000
  },

  // Pagination & Limits
  PAGINATION: {
    DEFAULT_LIMIT: 50,
    DEFAULT_OFFSET: 0,
    MAX_LIMIT: 100
  },

  // Retry Configuration
  RETRY: {
    MAX_ATTEMPTS: 3,
    INITIAL_DELAY: 1000,
    MAX_DELAY: 30000,
    BACKOFF_MULTIPLIER: 2,
    JITTER_FRACTION: 0.1
  },

  // Cache Configuration
  CACHE: {
    DEFAULT_TTL: 300000, // 5 minutes
    KEYSTORE_TTL: 3600000, // 1 hour for credentials
    TOKEN_REFRESH_BUFFER: 300000 // 5 minutes before expiry
  },

  // Logging
  LOG_LEVELS: {
    DEBUG: 0,
    INFO: 1,
    WARN: 2,
    ERROR: 3
  }
};

export default DEFAULTS;
