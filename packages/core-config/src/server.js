/**
 * Server configuration - HTTP server and middleware settings
 */

export const SERVER_CONFIG = {
  // Port configuration
  PORT: parseInt(process.env.PORT || '3000'),
  HOST: process.env.HOST || 'localhost',

  // CORS configuration
  CORS_ORIGIN: process.env.CORS_ORIGIN || '*',
  CORS_CREDENTIALS: process.env.CORS_CREDENTIALS === 'true',

  // Request handling
  REQUEST_LOG_THRESHOLD: parseInt(process.env.REQUEST_LOG_THRESHOLD || '1000'), // ms
  REQUEST_SIZE_LIMIT: process.env.REQUEST_SIZE_LIMIT || '50mb',
  REQUEST_TIMEOUT: parseInt(process.env.REQUEST_TIMEOUT || '30000'), // ms

  // Rate limiting
  RATE_LIMIT: {
    WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW || '60000'), // 1 minute
    MAX_REQUESTS_PER_IP: parseInt(process.env.RATE_LIMIT_MAX || '100'),
    CLEANUP_INTERVAL: parseInt(process.env.RATE_LIMIT_CLEANUP || '120000') // 2 minutes
  },

  // Hot reload configuration
  HOT_RELOAD: {
    ENABLED: process.env.HOT_RELOAD !== 'false',
    DEBOUNCE_DELAY: 100 // ms
  },

  // Environment
  ENVIRONMENT: process.env.NODE_ENV || 'development',
  DEBUG: process.env.DEBUG === 'true'
};

export default SERVER_CONFIG;
