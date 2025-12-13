/**
 * Config Environment Loader
 * Loads configuration from environment variables
 */

const ENV_VARS_MAP = {
  database: ['DATABASE_URL', 'DB_HOST', 'DB_PORT', 'DB_USER', 'DB_PASSWORD'],
  api: ['API_KEY', 'API_BASE_URL', 'API_TIMEOUT'],
  auth: ['AUTH_SECRET', 'JWT_SECRET', 'OAUTH_CLIENT_ID', 'OAUTH_CLIENT_SECRET'],
  storage: ['STORAGE_PATH', 'CLOUD_BUCKET', 'CLOUD_KEY'],
  services: ['OPENAI_API_KEY', 'GAPI_KEY', 'SLACK_TOKEN', 'ANTHROPIC_API_KEY']
};

export function createConfigEnvLoader() {
  return {
    loadFromEnv(resourceType) {
      const config = {};

      const relevantVars = ENV_VARS_MAP[resourceType] || [];
      for (const key of relevantVars) {
        if (process.env[key]) {
          config[key.toLowerCase()] = process.env[key];
        }
      }

      return config;
    },

    getEnvVarsMap() {
      return ENV_VARS_MAP;
    }
  };
}
