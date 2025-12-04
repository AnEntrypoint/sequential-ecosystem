/**
 * @module env-schema
 * Centralized environment variable schema and validation
 * All environment variables used across the Sequential Ecosystem are defined here
 */

/**
 * Environment variable schema with type validation and defaults
 * @type {Object.<string, {type: string, default: any, description: string, required: boolean}>}
 */
export const ENV_SCHEMA = {
  // Core server configuration
  NODE_ENV: {
    type: 'string',
    default: 'development',
    description: 'Node.js environment (development, production, test)',
    required: false,
    enum: ['development', 'production', 'test']
  },

  PORT: {
    type: 'number',
    default: 3000,
    description: 'Server port number',
    required: false
  },

  HOST: {
    type: 'string',
    default: 'localhost',
    description: 'Server hostname/IP to bind to',
    required: false
  },

  CORS_ORIGIN: {
    type: 'string',
    default: '*',
    description: 'CORS origin whitelist (comma-separated or wildcard)',
    required: false
  },

  // Sequential Machine (StateKit) configuration
  SEQUENTIAL_MACHINE_DIR: {
    type: 'string',
    default: null,
    description: 'Directory for Sequential Machine state (defaults to ~/.sequential-machine)',
    required: false
  },

  SEQUENTIAL_MACHINE_WORK: {
    type: 'string',
    default: null,
    description: 'Work directory for Sequential Machine (defaults to SEQUENTIAL_MACHINE_DIR/work)',
    required: false
  },

  // VFS and data storage
  VFS_DIR: {
    type: 'string',
    default: null,
    description: 'Virtual filesystem directory (defaults to ~/.sequential-vfs)',
    required: false
  },

  ZELLOUS_DATA: {
    type: 'string',
    default: null,
    description: 'Zellous collaboration data directory (defaults to ~/.zellous-data)',
    required: false
  },

  ECOSYSTEM_PATH: {
    type: 'string',
    default: null,
    description: 'Root path of Sequential Ecosystem installation',
    required: false
  },

  // Service integration
  SERVICE_BASE_URL: {
    type: 'string',
    default: 'http://localhost:3000',
    description: 'Base URL for service API calls',
    required: false
  },

  SERVICE_AUTH_TOKEN: {
    type: 'string',
    default: null,
    description: 'Authentication token for service API calls',
    required: false
  },

  // Supabase integration
  SUPABASE_URL: {
    type: 'string',
    default: null,
    description: 'Supabase project URL',
    required: false
  },

  SUPABASE_ANON_KEY: {
    type: 'string',
    default: null,
    description: 'Supabase anonymous/public API key',
    required: false
  },

  SUPABASE_SERVICE_KEY: {
    type: 'string',
    default: null,
    description: 'Supabase service role key (for server-side operations)',
    required: false
  },

  // Debugging and logging
  DEBUG: {
    type: 'boolean',
    default: false,
    description: 'Enable debug logging (true/false or 1/0)',
    required: false
  }
};

/**
 * Validate and parse an environment variable value
 * @param {string} name - Variable name
 * @param {any} value - Raw environment variable value
 * @param {Object} schema - Schema definition for the variable
 * @returns {any} Parsed and validated value
 * @throws {Error} If validation fails
 */
function validateEnvValue(name, value, schema) {
  const { type, enum: validValues, required } = schema;

  if (value === undefined || value === null || value === '') {
    if (required && schema.default === null) {
      throw new Error(`Required environment variable ${name} is not set`);
    }
    return schema.default;
  }

  switch (type) {
    case 'string':
      if (typeof value !== 'string') {
        throw new Error(`${name} must be a string, got ${typeof value}`);
      }
      if (validValues && !validValues.includes(value)) {
        throw new Error(`${name} must be one of: ${validValues.join(', ')}`);
      }
      return value;

    case 'number':
      const num = parseInt(value, 10);
      if (isNaN(num)) {
        throw new Error(`${name} must be a valid number, got "${value}"`);
      }
      return num;

    case 'boolean':
      if (typeof value === 'boolean') return value;
      if (typeof value === 'string') {
        if (['true', '1', 'yes', 'on'].includes(value.toLowerCase())) return true;
        if (['false', '0', 'no', 'off'].includes(value.toLowerCase())) return false;
      }
      throw new Error(`${name} must be a boolean (true/false, 1/0, yes/no), got "${value}"`);

    default:
      return value;
  }
}

/**
 * Load and validate all environment variables against schema
 * @param {Object} [envObj=process.env] - Environment object to validate (defaults to process.env)
 * @returns {Object} Validated environment object
 * @throws {Error} If any required variable is missing or validation fails
 */
export function loadEnv(envObj = process.env) {
  const config = {};
  const errors = [];

  for (const [name, schema] of Object.entries(ENV_SCHEMA)) {
    try {
      const rawValue = envObj[name];
      config[name] = validateEnvValue(name, rawValue, schema);
    } catch (error) {
      errors.push(error.message);
    }
  }

  if (errors.length > 0) {
    throw new Error(`Environment validation failed:\n  ${errors.join('\n  ')}`);
  }

  return config;
}

/**
 * Get environment schema for a specific variable
 * @param {string} name - Variable name
 * @returns {Object|null} Schema definition or null if not found
 */
export function getSchemaFor(name) {
  return ENV_SCHEMA[name] || null;
}

/**
 * List all environment variables defined in schema
 * @param {Object} [filter] - Filter options
 * @param {string} [filter.type] - Filter by type (string, number, boolean)
 * @param {boolean} [filter.required] - Filter by required flag
 * @returns {Array<{name: string, ...schema}>} Array of variable definitions
 */
export function listEnvVariables(filter = {}) {
  return Object.entries(ENV_SCHEMA)
    .filter(([, schema]) => {
      if (filter.type && schema.type !== filter.type) return false;
      if (filter.required !== undefined && schema.required !== filter.required) return false;
      return true;
    })
    .map(([name, schema]) => ({ name, ...schema }));
}

/**
 * Generate documentation for environment variables
 * @returns {string} Formatted documentation
 */
export function generateEnvDocs() {
  const lines = [
    '# Environment Variables',
    '',
    'All environment variables used in Sequential Ecosystem:',
    ''
  ];

  for (const [name, schema] of Object.entries(ENV_SCHEMA)) {
    lines.push(`## ${name}`);
    lines.push(`- **Type**: ${schema.type}`);
    lines.push(`- **Required**: ${schema.required}`);
    lines.push(`- **Default**: ${schema.default === null ? 'none' : JSON.stringify(schema.default)}`);
    lines.push(`- **Description**: ${schema.description}`);
    if (schema.enum) {
      lines.push(`- **Valid values**: ${schema.enum.join(', ')}`);
    }
    lines.push('');
  }

  return lines.join('\n');
}
