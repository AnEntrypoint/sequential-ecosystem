/**
 * Environment Profile Service
 * Manages environment-specific configurations
 */

export function createEnvironmentProfile(env = 'development') {
  const profiles = {
    development: {
      database: 'sqlite://./test.db',
      apiBaseUrl: 'http://localhost:3000',
      enableMocks: true,
      logLevel: 'debug'
    },
    testing: {
      database: 'sqlite://:memory:',
      apiBaseUrl: 'http://localhost:3000',
      enableMocks: true,
      logLevel: 'error'
    },
    staging: {
      database: process.env.DATABASE_URL || 'postgresql://localhost/staging',
      apiBaseUrl: 'https://api-staging.example.com',
      enableMocks: false,
      logLevel: 'info'
    },
    production: {
      database: process.env.DATABASE_URL,
      apiBaseUrl: 'https://api.example.com',
      enableMocks: false,
      logLevel: 'warn'
    }
  };

  return profiles[env] || profiles.development;
}
