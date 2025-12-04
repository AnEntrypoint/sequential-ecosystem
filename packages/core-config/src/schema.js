/**
 * Environment variable schemas and validation
 * No external dependencies - pure JavaScript validation
 */

const EnvType = {
  STRING: 'string',
  NUMBER: 'number',
  BOOLEAN: 'boolean',
  URL: 'url',
  PORT: 'port',
  ENUM: 'enum',
  OPTIONAL: 'optional',
};

class ValidationError extends Error {
  constructor(messages) {
    super(messages.join('\n'));
    this.name = 'ValidationError';
    this.messages = messages;
  }
}

class EnvSchema {
  constructor() {
    this.rules = new Map();
  }

  define(key, config) {
    this.rules.set(key, config);
    return this;
  }

  validate(env = process.env) {
    const errors = [];
    const result = {};

    for (const [key, config] of this.rules) {
      const value = env[key];
      const { type, required, default: defaultVal, description, values } = config;

      if (value === undefined || value === '') {
        if (required) {
          errors.push(`❌ ${key}: required but not provided${description ? ` (${description})` : ''}`);
        } else {
          result[key] = defaultVal;
        }
        continue;
      }

      try {
        result[key] = this._coerce(value, type, key, values);
      } catch (e) {
        errors.push(`❌ ${key}: ${e.message}${description ? ` (${description})` : ''}`);
      }
    }

    if (errors.length > 0) {
      throw new ValidationError(errors);
    }

    return result;
  }

  _coerce(value, type, key, allowedValues) {
    switch (type) {
      case EnvType.STRING:
        return String(value);

      case EnvType.NUMBER: {
        const num = Number(value);
        if (isNaN(num)) {
          throw new Error(`must be a valid number, got "${value}"`);
        }
        return num;
      }

      case EnvType.BOOLEAN:
        return value === 'true' || value === '1' || value === 'yes';

      case EnvType.PORT: {
        const port = Number(value);
        if (isNaN(port) || port < 1 || port > 65535) {
          throw new Error(`must be a valid port number (1-65535), got "${value}"`);
        }
        return port;
      }

      case EnvType.URL: {
        try {
          new URL(value);
          return value;
        } catch {
          throw new Error(`must be a valid URL, got "${value}"`);
        }
      }

      case EnvType.ENUM: {
        if (!allowedValues || !allowedValues.includes(value)) {
          throw new Error(`must be one of ${allowedValues.join(', ')}, got "${value}"`);
        }
        return value;
      }

      default:
        return value;
    }
  }
}

export const schema = new EnvSchema();

export const envSchema = {
  // Core server configuration
  PORT: { type: EnvType.PORT, required: false, default: 3000, description: 'HTTP server port' },
  HOST: { type: EnvType.STRING, required: false, default: 'localhost', description: 'HTTP server host' },
  NODE_ENV: { type: EnvType.ENUM, required: false, default: 'development', values: ['development', 'production', 'test'], description: 'Environment' },
  DEBUG: { type: EnvType.BOOLEAN, required: false, default: false, description: 'Enable debug logging' },

  // CORS configuration
  CORS_ORIGIN: { type: EnvType.STRING, required: false, default: '*', description: 'CORS origin' },
  CORS_CREDENTIALS: { type: EnvType.BOOLEAN, required: false, default: false, description: 'CORS credentials' },

  // Request handling
  REQUEST_LOG_THRESHOLD: { type: EnvType.NUMBER, required: false, default: 1000, description: 'Request logging threshold (ms)' },
  REQUEST_SIZE_LIMIT: { type: EnvType.STRING, required: false, default: '50mb', description: 'Request size limit' },
  REQUEST_TIMEOUT: { type: EnvType.NUMBER, required: false, default: 30000, description: 'Request timeout (ms)' },

  // Rate limiting
  RATE_LIMIT_WINDOW: { type: EnvType.NUMBER, required: false, default: 60000, description: 'Rate limit window (ms)' },
  RATE_LIMIT_MAX: { type: EnvType.NUMBER, required: false, default: 100, description: 'Max requests per window' },
  RATE_LIMIT_CLEANUP: { type: EnvType.NUMBER, required: false, default: 120000, description: 'Rate limit cleanup interval (ms)' },

  // File operations
  ECOSYSTEM_PATH: { type: EnvType.STRING, required: false, default: process.cwd(), description: 'Root ecosystem path' },
  VFS_DIR: { type: EnvType.STRING, required: false, default: '.vfs', description: 'Virtual filesystem directory' },
  MAX_FILE_SIZE_BYTES: { type: EnvType.NUMBER, required: false, default: 10485760, description: 'Max file size (bytes)' },
  MAX_FILE_NAME_LENGTH: { type: EnvType.NUMBER, required: false, default: 255, description: 'Max filename length' },
  MAX_TASK_NAME_LENGTH: { type: EnvType.NUMBER, required: false, default: 100, description: 'Max task name length' },

  // Hot reload
  HOT_RELOAD: { type: EnvType.BOOLEAN, required: false, default: true, description: 'Enable file watching and hot reload' },

  // Service configuration
  DENO_EXECUTOR_PORT: { type: EnvType.PORT, required: false, default: 3100, description: 'Deno executor port' },
  DENO_EXECUTOR_URL: { type: EnvType.STRING, required: false, default: 'http://localhost:3100', description: 'Deno executor URL' },
  DENO_EXECUTOR_TIMEOUT: { type: EnvType.NUMBER, required: false, default: 30000, description: 'Deno executor timeout (ms)' },

  STACK_PROCESSOR_PORT: { type: EnvType.PORT, required: false, default: 3101, description: 'Stack processor port' },
  STACK_PROCESSOR_URL: { type: EnvType.STRING, required: false, default: 'http://localhost:3101', description: 'Stack processor URL' },
  STACK_PROCESSOR_TIMEOUT: { type: EnvType.NUMBER, required: false, default: 30000, description: 'Stack processor timeout (ms)' },
  STACK_PROCESSOR_LOCK_TIMEOUT: { type: EnvType.NUMBER, required: false, default: 60000, description: 'Stack processor lock timeout (ms)' },

  TASK_EXECUTOR_PORT: { type: EnvType.PORT, required: false, default: 3102, description: 'Task executor port' },
  TASK_EXECUTOR_URL: { type: EnvType.STRING, required: false, default: 'http://localhost:3102', description: 'Task executor URL' },
  TASK_EXECUTOR_TIMEOUT: { type: EnvType.NUMBER, required: false, default: 30000, description: 'Task executor timeout (ms)' },
  TASK_EXECUTION_TIMEOUT_MS: { type: EnvType.NUMBER, required: false, default: 300000, description: 'Task execution timeout (ms)' },

  GAPI_PORT: { type: EnvType.PORT, required: false, default: 3103, description: 'Google API port' },
  GAPI_URL: { type: EnvType.STRING, required: false, default: 'http://localhost:3103', description: 'Google API URL' },
  GAPI_TIMEOUT: { type: EnvType.NUMBER, required: false, default: 30000, description: 'Google API timeout (ms)' },
  GAPI_KEY: { type: EnvType.STRING, required: false, description: 'Google API key' },
  GAPI_ADMIN_EMAIL: { type: EnvType.STRING, required: false, description: 'Google admin email' },

  KEYSTORE_PORT: { type: EnvType.PORT, required: false, default: 3104, description: 'Keystore port' },
  KEYSTORE_URL: { type: EnvType.STRING, required: false, default: 'http://localhost:3104', description: 'Keystore URL' },
  KEYSTORE_TIMEOUT: { type: EnvType.NUMBER, required: false, default: 30000, description: 'Keystore timeout (ms)' },

  SUPABASE_PORT: { type: EnvType.PORT, required: false, default: 3105, description: 'Supabase port' },
  SUPABASE_URL: { type: EnvType.STRING, required: false, description: 'Supabase URL' },
  SUPABASE_SERVICE_KEY: { type: EnvType.STRING, required: false, description: 'Supabase service key' },
  SUPABASE_ANON_KEY: { type: EnvType.STRING, required: false, description: 'Supabase anonymous key' },
  SUPABASE_TIMEOUT: { type: EnvType.NUMBER, required: false, default: 30000, description: 'Supabase timeout (ms)' },

  OPENAI_PORT: { type: EnvType.PORT, required: false, default: 3106, description: 'OpenAI port' },
  OPENAI_URL: { type: EnvType.STRING, required: false, default: 'http://localhost:3106', description: 'OpenAI URL' },
  OPENAI_TIMEOUT: { type: EnvType.NUMBER, required: false, default: 30000, description: 'OpenAI timeout (ms)' },
  OPENAI_API_KEY: { type: EnvType.STRING, required: false, description: 'OpenAI API key' },

  WEBSEARCH_PORT: { type: EnvType.PORT, required: false, default: 3107, description: 'Web search port' },
  WEBSEARCH_URL: { type: EnvType.STRING, required: false, default: 'http://localhost:3107', description: 'Web search URL' },
  WEBSEARCH_TIMEOUT: { type: EnvType.NUMBER, required: false, default: 30000, description: 'Web search timeout (ms)' },
  WEBSEARCH_API_KEY: { type: EnvType.STRING, required: false, description: 'Web search API key' },

  ADMIN_DEBUG_PORT: { type: EnvType.PORT, required: false, default: 3108, description: 'Admin debug port' },
  ADMIN_DEBUG_URL: { type: EnvType.STRING, required: false, default: 'http://localhost:3108', description: 'Admin debug URL' },
  ADMIN_DEBUG_TIMEOUT: { type: EnvType.NUMBER, required: false, default: 30000, description: 'Admin debug timeout (ms)' },

  // Sequential-specific configuration
  SEQUENTIAL_MACHINE_WORK: { type: EnvType.STRING, required: false, description: 'Sequential machine work directory' },
  SEQUENTIAL_MACHINE_DIR: { type: EnvType.STRING, required: false, description: 'Sequential machine state directory' },

  // Database
  DATABASE_URL: { type: EnvType.STRING, required: false, description: 'Database connection URL' },

  // Zellous
  ZELLOUS_DATA: { type: EnvType.STRING, required: false, description: 'Zellous data directory' },

  // WebSocket
  WS_MAX_CONNECTIONS_PER_IP: { type: EnvType.NUMBER, required: false, default: 10, description: 'Max WebSocket connections per IP' },
  WS_CLEANUP_INTERVAL_MS: { type: EnvType.NUMBER, required: false, default: 300000, description: 'WebSocket cleanup interval (ms)' },

  // Other
  USER_AGENT_MAX_LENGTH: { type: EnvType.NUMBER, required: false, default: 500, description: 'Max user agent length' },
  PROTOCOL: { type: EnvType.ENUM, required: false, default: 'http', values: ['http', 'https'], description: 'Protocol' },
  HOSTNAME: { type: EnvType.STRING, required: false, default: 'localhost', description: 'Hostname' },
  OP_LOG_MAX_SIZE: { type: EnvType.NUMBER, required: false, default: 10000, description: 'Operations log max size' },
  REQUEST_LOG_MAX_SIZE: { type: EnvType.NUMBER, required: false, default: 10000, description: 'Request log max size' },
  DEFAULT_LOG_LIMIT: { type: EnvType.NUMBER, required: false, default: 100, description: 'Default log limit' },
  CACHE_TTL_MS: { type: EnvType.NUMBER, required: false, default: 300000, description: 'Cache TTL (ms)' },
  SERVICE_BASE_URL: { type: EnvType.STRING, required: false, description: 'Service base URL' },
  SERVICE_AUTH_TOKEN: { type: EnvType.STRING, required: false, description: 'Service auth token' },
};

export { EnvSchema, EnvType, ValidationError };
