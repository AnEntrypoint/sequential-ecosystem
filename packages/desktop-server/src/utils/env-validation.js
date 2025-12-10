import logger from '@sequentialos/sequential-logging';

const ENV_SCHEMA = {
  PORT: { default: 3000, type: 'number', description: 'Server port' },
  HOSTNAME: { default: 'localhost', type: 'string', description: 'Server hostname' },
  PROTOCOL: { default: 'http', type: 'string', description: 'Server protocol (http/https)' },
  NODE_ENV: { default: 'development', type: 'string', description: 'Node environment' },
  DEBUG: { default: false, type: 'boolean', description: 'Debug mode' },
  CORS_ORIGIN: { default: '*', type: 'string', description: 'CORS origin' },
  CORS_METHODS: { default: 'GET,POST,PUT,DELETE,OPTIONS', type: 'string', description: 'CORS methods' },
  CORS_HEADERS: { default: 'Content-Type,Authorization', type: 'string', description: 'CORS headers' },
  CORS_MAX_AGE: { default: 3600, type: 'number', description: 'CORS max age in seconds' },
  STATE_CACHE_SIZE: { default: 5000, type: 'number', description: 'State manager cache size' },
  STATE_TTL_MS: { default: 600000, type: 'number', description: 'State TTL in milliseconds' },
  STATE_CLEANUP_INTERVAL_MS: { default: 60000, type: 'number', description: 'State cleanup interval in ms' },
  TASK_TIMEOUT: { default: 300000, type: 'number', description: 'Task timeout in milliseconds' },
  FETCH_TIMEOUT: { default: 30000, type: 'number', description: 'Fetch timeout in milliseconds' },
  LOG_LEVEL: { default: 'info', type: 'string', description: 'Logging level' },
  ENABLE_REQUEST_LOGGING: { default: false, type: 'boolean', description: 'Enable request logging' },
  REQUEST_LOG_THRESHOLD: { default: 1000, type: 'number', description: 'Request log threshold in ms' },
  DATABASE_URL: { optional: true, type: 'string', description: 'Database URL' },
  STORAGE_TYPE: { default: 'folder', type: 'string', description: 'Storage type (folder/sqlite/postgres)' }
};

export function validateEnvironment() {
  const validated = {};
  const warnings = [];
  const errors = [];

  for (const [key, config] of Object.entries(ENV_SCHEMA)) {
    const value = process.env[key];

    if (value === undefined) {
      if (config.optional) {
        validated[key] = null;
        continue;
      }
      if (config.default !== undefined) {
        validated[key] = coerceValue(config.default, config.type);
        continue;
      }
      errors.push(`${key}: required but not set`);
      continue;
    }

    try {
      validated[key] = coerceValue(value, config.type);
    } catch (err) {
      errors.push(`${key}: ${err.message}`);
    }
  }

  if (errors.length > 0) {
    logger.error('Environment validation failed:');
    errors.forEach(e => logger.error(`  - ${e}`));
    throw new Error(`Invalid environment configuration (${errors.length} errors)`);
  }

  if (warnings.length > 0) {
    warnings.forEach(w => logger.warn(`  - ${w}`));
  }

  logger.info(`✓ Environment validation passed (${Object.keys(validated).length} vars)`);
  return validated;
}

function coerceValue(value, type) {
  switch (type) {
    case 'number':
      const num = Number(value);
      if (isNaN(num)) throw new Error(`expected number, got ${value}`);
      return num;
    case 'boolean':
      if (value === 'false' || value === '0' || value === '') return false;
      return Boolean(value);
    case 'string':
      return String(value);
    default:
      return value;
  }
}
