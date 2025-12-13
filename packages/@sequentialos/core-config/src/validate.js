import logger from '@sequentialos/sequential-logging';
import { delay, withRetry } from '@sequentialos/async-patterns';
/**
 * Configuration validator with detailed error reporting
 */

import { EnvSchema, envSchema, ValidationError } from './schema.js';

class ConfigValidator {
  constructor() {
    this.schema = new EnvSchema();
    this._defineRules();
    this.validated = false;
    this.config = null;
  }

  _defineRules() {
    for (const [key, config] of Object.entries(envSchema)) {
      this.schema.define(key, config);
    }
  }

  validate(env = process.env, throwOnError = true) {
    try {
      this.config = this.schema.validate(env);
      this.validated = true;
      return {
        success: true,
        config: this.config
      };
    } catch (err) {
      if (err instanceof ValidationError) {
        if (throwOnError) {
          logger.error('\n❌ ENVIRONMENT CONFIGURATION ERROR\n');
          logger.error(err.message);
          logger.error('\n📖 Expected environment variables:\n');
          this._printSchema();
          process.exit(1);
        }
        return {
          success: false,
          errors: err.messages
        };
      }
      throw err;
    }
  }

  validateAsync(env = process.env) {
    return Promise.resolve(this.validate(env));
  }

  get(key, defaultValue) {
    if (!this.validated) {
      throw new Error('Configuration not validated. Call validate() first.');
    }
    return this.config[key] ?? defaultValue;
  }

  getAll() {
    if (!this.validated) {
      throw new Error('Configuration not validated. Call validate() first.');
    }
    return { ...this.config };
  }

  _printSchema() {
    const categories = {
      'Core Server': ['PORT', 'HOST', 'NODE_ENV', 'DEBUG'],
      'CORS': ['CORS_ORIGIN', 'CORS_CREDENTIALS'],
      'Request Handling': ['REQUEST_LOG_THRESHOLD', 'REQUEST_SIZE_LIMIT', 'REQUEST_TIMEOUT'],
      'Rate Limiting': ['RATE_LIMIT_WINDOW', 'RATE_LIMIT_MAX', 'RATE_LIMIT_CLEANUP'],
      'File Operations': ['ECOSYSTEM_PATH', 'VFS_DIR', 'MAX_FILE_SIZE_BYTES', 'MAX_FILE_NAME_LENGTH', 'MAX_TASK_NAME_LENGTH'],
      'Hot Reload': ['HOT_RELOAD'],
      'Services': [
        'DENO_EXECUTOR_PORT', 'DENO_EXECUTOR_URL', 'DENO_EXECUTOR_TIMEOUT',
        'STACK_PROCESSOR_PORT', 'STACK_PROCESSOR_URL', 'STACK_PROCESSOR_TIMEOUT', 'STACK_PROCESSOR_LOCK_TIMEOUT',
        'TASK_EXECUTOR_PORT', 'TASK_EXECUTOR_URL', 'TASK_EXECUTOR_TIMEOUT', 'TASK_EXECUTION_TIMEOUT_MS',
        'GAPI_PORT', 'GAPI_URL', 'GAPI_TIMEOUT', 'GAPI_KEY', 'GAPI_ADMIN_EMAIL',
        'KEYSTORE_PORT', 'KEYSTORE_URL', 'KEYSTORE_TIMEOUT',
        'SUPABASE_PORT', 'SUPABASE_URL', 'SUPABASE_SERVICE_KEY', 'SUPABASE_ANON_KEY', 'SUPABASE_TIMEOUT',
        'OPENAI_PORT', 'OPENAI_URL', 'OPENAI_TIMEOUT', 'OPENAI_API_KEY',
        'WEBSEARCH_PORT', 'WEBSEARCH_URL', 'WEBSEARCH_TIMEOUT', 'WEBSEARCH_API_KEY',
        'ADMIN_DEBUG_PORT', 'ADMIN_DEBUG_URL', 'ADMIN_DEBUG_TIMEOUT'
      ],
      'Other': ['SEQUENTIAL_MACHINE_WORK', 'SEQUENTIAL_MACHINE_DIR', 'DATABASE_URL', 'ZELLOUS_DATA', 'WS_MAX_CONNECTIONS_PER_IP', 'WS_CLEANUP_INTERVAL_MS', 'USER_AGENT_MAX_LENGTH', 'PROTOCOL', 'HOSTNAME', 'OP_LOG_MAX_SIZE', 'REQUEST_LOG_MAX_SIZE', 'DEFAULT_LOG_LIMIT', 'CACHE_TTL_MS', 'SERVICE_BASE_URL', 'SERVICE_AUTH_TOKEN']
    };

    for (const [category, keys] of Object.entries(categories)) {
      logger.error(`\n${category}:`);
      for (const key of keys) {
        const config = envSchema[key];
        if (config) {
          const required = config.required ? '(required)' : `(optional, default: ${config.default})`;
          logger.error(`  ${key} ${required}`);
          if (config.description) {
            logger.error(`    └─ ${config.description}`);
          }
        }
      }
    }
  }
}

export function createValidator() {
  return new ConfigValidator();
}

export const validator = new ConfigValidator();

export default validator;
