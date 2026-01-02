/**
 * Service-specific configuration for wrapped services
 */

/**
 * Create service configuration object with standard properties
 * @param {string} name - Service name (uppercase with underscores)
 * @param {number} defaultPort - Default port number
 * @param {object} extras - Additional service-specific properties
 * @returns {object} Service configuration object
 */
const createServiceConfig = (name, defaultPort, extras = {}) => ({
  PORT: parseInt(process.env[`${name}_PORT`] || String(defaultPort)),
  URL: process.env[`${name}_URL`] || `http://localhost:${defaultPort}`,
  TIMEOUT: parseInt(process.env[`${name}_TIMEOUT`] || '30000'),
  ...extras
});

/**
 * Service definitions: [name, defaultPort, extras]
 */
const SERVICE_DEFINITIONS = [
  ['DENO_EXECUTOR', 3100],
  ['STACK_PROCESSOR', 3101, { LOCK_TIMEOUT: parseInt(process.env.STACK_PROCESSOR_LOCK_TIMEOUT || '60000') }],
  ['TASK_EXECUTOR', 3102],
  ['GAPI', 3103, { KEY: process.env.GAPI_KEY, ADMIN_EMAIL: process.env.GAPI_ADMIN_EMAIL }],
  ['KEYSTORE', 3104],
  ['SUPABASE', 3105],
  ['OPENAI', 3106, { API_KEY: process.env.OPENAI_API_KEY }],
  ['WEBSEARCH', 3107, { API_KEY: process.env.WEBSEARCH_API_KEY }],
  ['ADMIN_DEBUG', 3108]
];

/**
 * Build services config object from definitions
 */
export const SERVICES_CONFIG = SERVICE_DEFINITIONS.reduce((config, [name, port, extras = {}]) => {
  config[name] = createServiceConfig(name, port, extras);
  return config;
}, {});

export default SERVICES_CONFIG;
