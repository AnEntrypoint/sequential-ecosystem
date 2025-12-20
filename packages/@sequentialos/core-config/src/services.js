/**
 * Service-specific configuration for wrapped services
 */

export const SERVICES_CONFIG = {
  DENO_EXECUTOR: {
    PORT: parseInt(process.env.DENO_EXECUTOR_PORT || '3100'),
    URL: process.env.DENO_EXECUTOR_URL || 'http://localhost:3100',
    TIMEOUT: parseInt(process.env.DENO_EXECUTOR_TIMEOUT || '30000')
  },

  STACK_PROCESSOR: {
    PORT: parseInt(process.env.STACK_PROCESSOR_PORT || '3101'),
    URL: process.env.STACK_PROCESSOR_URL || 'http://localhost:3101',
    TIMEOUT: parseInt(process.env.STACK_PROCESSOR_TIMEOUT || '30000'),
    LOCK_TIMEOUT: parseInt(process.env.STACK_PROCESSOR_LOCK_TIMEOUT || '60000')
  },

  TASK_EXECUTOR: {
    PORT: parseInt(process.env.TASK_EXECUTOR_PORT || '3102'),
    URL: process.env.TASK_EXECUTOR_URL || 'http://localhost:3102',
    TIMEOUT: parseInt(process.env.TASK_EXECUTOR_TIMEOUT || '30000')
  },

  GAPI: {
    PORT: parseInt(process.env.GAPI_PORT || '3103'),
    URL: process.env.GAPI_URL || 'http://localhost:3103',
    TIMEOUT: parseInt(process.env.GAPI_TIMEOUT || '30000'),
    KEY: process.env.GAPI_KEY,
    ADMIN_EMAIL: process.env.GAPI_ADMIN_EMAIL
  },

  KEYSTORE: {
    PORT: parseInt(process.env.KEYSTORE_PORT || '3104'),
    URL: process.env.KEYSTORE_URL || 'http://localhost:3104',
    TIMEOUT: parseInt(process.env.KEYSTORE_TIMEOUT || '30000')
  },

  SUPABASE: {
    PORT: parseInt(process.env.SUPABASE_PORT || '3105'),
    URL: process.env.SUPABASE_URL || 'http://localhost:3105',
    TIMEOUT: parseInt(process.env.SUPABASE_TIMEOUT || '30000')
  },

  OPENAI: {
    PORT: parseInt(process.env.OPENAI_PORT || '3106'),
    URL: process.env.OPENAI_URL || 'http://localhost:3106',
    TIMEOUT: parseInt(process.env.OPENAI_TIMEOUT || '30000'),
    API_KEY: process.env.OPENAI_API_KEY
  },

  WEBSEARCH: {
    PORT: parseInt(process.env.WEBSEARCH_PORT || '3107'),
    URL: process.env.WEBSEARCH_URL || 'http://localhost:3107',
    TIMEOUT: parseInt(process.env.WEBSEARCH_TIMEOUT || '30000'),
    API_KEY: process.env.WEBSEARCH_API_KEY
  },

  ADMIN_DEBUG: {
    PORT: parseInt(process.env.ADMIN_DEBUG_PORT || '3108'),
    URL: process.env.ADMIN_DEBUG_URL || 'http://localhost:3108',
    TIMEOUT: parseInt(process.env.ADMIN_DEBUG_TIMEOUT || '30000')
  }
};

export default SERVICES_CONFIG;
