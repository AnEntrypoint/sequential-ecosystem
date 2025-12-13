/**
 * config-utilities.js
 *
 * Configuration utility functions
 */

export function createConfigUtilities() {
  return {
    mergeConfig(...configs) {
      return configs.reduce((merged, config) => ({
        ...merged,
        ...(config || {})
      }), {});
    },

    getEnvironmentConfig() {
      const env = process.env.NODE_ENV || 'development';
      return {
        environment: env,
        isDevelopment: env === 'development',
        isStaging: env === 'staging',
        isProduction: env === 'production',
        debug: process.env.DEBUG === '1'
      };
    }
  };
}
