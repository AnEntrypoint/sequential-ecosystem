import { detectInitializationPattern } from './auto-detect-patterns.js';
import { detectCredentials } from './auto-detect-credentials.js';

function normalizeConfig(input) {
  if (typeof input === 'string') {
    if (input.includes('/')) {
      const [type, name] = input.split('/');
      if (type === 'service') {
        return {
          service: name,
          mode: 'service'
        };
      }
    } else if (input.includes(':')) {
      const [module, factory] = input.split(':');
      return {
        module,
        factory,
        mode: 'explicit'
      };
    } else {
      return {
        module: input,
        factory: null,
        mode: 'auto'
      };
    }
  }

  if (typeof input === 'object' && input !== null) {
    return {
      ...input,
      mode: input.mode || (input.factory ? 'explicit' : 'auto')
    };
  }

  throw new Error('Invalid configuration format');
}

function generateDefaults(moduleName, pattern, detectedCreds) {
  const config = {
    module: moduleName,
    factory: pattern.factory,
    mode: 'auto',
    type: pattern.type,
    credentials: detectedCreds,
    pause: {
      enabled: true,
      timeout: 30000,
      maxPayload: 1048576
    },
    retry: {
      enabled: true,
      maxAttempts: 3,
      backoff: 'exponential'
    },
    cache: {
      enabled: false,
      ttl: 0
    }
  };

  if (moduleName.includes('openai') || moduleName.includes('anthropic')) {
    config.pause.enabled = true;
    config.cache.enabled = false;
  } else if (moduleName.includes('redis') || moduleName.includes('mongodb')) {
    config.connectionPool = { enabled: true, size: 5 };
  } else if (moduleName.includes('google') || moduleName.includes('aws')) {
    config.auth = { type: 'service_account' };
  }

  return config;
}

export async function resolveConfig(input, loadedModule = null) {
  const normalized = normalizeConfig(input);

  if (normalized.mode === 'service') {
    return normalized;
  }

  if (normalized.mode === 'auto' && loadedModule) {
    const pattern = detectInitializationPattern(loadedModule);
    const credentials = detectCredentials(normalized.module, loadedModule);
    const defaults = generateDefaults(normalized.module, pattern, credentials);

    return {
      ...defaults,
      ...normalized,
      detected: true
    };
  }

  return {
    ...normalized,
    credentials: detectCredentials(normalized.module),
    detected: false
  };
}
