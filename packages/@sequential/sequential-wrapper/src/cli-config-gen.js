import { detectCredentials } from './auto-detect.js';

export function generateServiceConfig(libraryName, port) {
  const credentials = detectCredentials(libraryName);

  return {
    library: libraryName,
    version: '1.0.0',
    description: `HTTP wrapper for ${libraryName} SDK`,
    port,
    initialization: {
      auto: true,
      timeout: 5000
    },
    credentials: credentials.reduce((acc, cred) => {
      acc[cred] = `keystore:${cred.toLowerCase()}`;
      return acc;
    }, {}),
    pause: {
      enabled: true,
      timeout: 30000,
      maxPayload: 1048576
    },
    retry: {
      enabled: true,
      maxAttempts: 3
    },
    cache: {
      enabled: false,
      ttl: 0
    },
    endpoints: {
      health: '/health',
      call: '/call'
    }
  };
}
