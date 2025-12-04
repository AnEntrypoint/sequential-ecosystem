export function detectInitializationPattern(module) {
  if (!module) return null;

  const factoryNames = ['createClient', 'create', 'init', 'initialize', 'setup'];
  for (const name of factoryNames) {
    if (typeof module[name] === 'function') {
      return {
        type: 'factory',
        factory: name,
        isAsync: isAsyncFunction(module[name]),
        confidence: 0.95
      };
    }
  }

  if (module.default) {
    if (typeof module.default === 'function') {
      if (isClass(module.default)) {
        return {
          type: 'constructor',
          factory: 'default',
          isAsync: false,
          confidence: 0.9
        };
      }
      if (isAsyncFunction(module.default)) {
        return {
          type: 'factory',
          factory: 'default',
          isAsync: true,
          confidence: 0.85
        };
      }
      return {
        type: 'function',
        factory: 'default',
        isAsync: false,
        confidence: 0.8
      };
    } else {
      return {
        type: 'instance',
        factory: 'default',
        isAsync: false,
        confidence: 0.95
      };
    }
  }

  const entries = Object.entries(module);
  for (const [name, value] of entries) {
    if (typeof value === 'function' && /^[A-Z]/.test(name) && !name.includes('Error')) {
      return {
        type: 'constructor',
        factory: name,
        isAsync: false,
        confidence: 0.85
      };
    }
  }

  return {
    type: 'instance',
    factory: null,
    isAsync: false,
    confidence: 0.3
  };
}

export function detectCredentials(moduleName, module) {
  const credentials = [];
  const normalized = moduleName.toLowerCase().replace(/[@/-]/g, '_');

  const patterns = {
    supabase: ['SUPABASE_URL', 'SUPABASE_KEY'],
    openai: ['OPENAI_API_KEY'],
    anthropic: ['ANTHROPIC_API_KEY'],
    stripe: ['STRIPE_SECRET_KEY'],
    twilio: ['TWILIO_ACCOUNT_SID', 'TWILIO_AUTH_TOKEN'],
    aws: ['AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY', 'AWS_REGION'],
    google: ['GOOGLE_SERVICE_ACCOUNT_EMAIL', 'GOOGLE_PRIVATE_KEY'],
    mongodb: ['MONGODB_URI'],
    redis: ['REDIS_URL'],
    elasticsearch: ['ELASTICSEARCH_URL', 'ELASTICSEARCH_USERNAME', 'ELASTICSEARCH_PASSWORD'],
    firebase: ['FIREBASE_SERVICE_ACCOUNT_JSON'],
    auth0: ['AUTH0_DOMAIN', 'AUTH0_CLIENT_ID', 'AUTH0_CLIENT_SECRET'],
    github: ['GITHUB_TOKEN'],
    slack: ['SLACK_BOT_TOKEN'],
    discord: ['DISCORD_BOT_TOKEN']
  };

  for (const [key, creds] of Object.entries(patterns)) {
    if (normalized.includes(key)) {
      return creds;
    }
  }

  for (const part of normalized.split('_')) {
    if (patterns[part]) {
      return patterns[part];
    }
  }

  const upperNormalized = normalized.toUpperCase();
  return [
    `${upperNormalized}_API_KEY`,
    `${upperNormalized}_TOKEN`,
    `${upperNormalized}_SECRET`
  ].filter(k => k.length < 50);
}

function isAsyncFunction(fn) {
  return fn && fn.constructor.name === 'AsyncFunction';
}

function isClass(fn) {
  const str = fn.toString();
  return /^class\s/.test(str) || /^class\s+\w+/.test(str);
}

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

export function validateConfig(config, loadedModule = null) {
  const errors = [];
  const warnings = [];

  if (!config.module && !config.service) {
    errors.push('Either "module" or "service" must be specified');
  }

  if (config.module && !loadedModule) {
    warnings.push(`Module "${config.module}" not loaded for validation`);
  }

  if (config.credentials && Array.isArray(config.credentials)) {
    if (config.credentials.length === 0) {
      warnings.push('No credentials specified; may fail at runtime');
    }
  }

  if (config.pause && config.pause.timeout < 1000) {
    warnings.push('Pause timeout < 1s may be too aggressive');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    detectInitializationPattern,
    detectCredentials,
    resolveConfig,
    validateConfig
  };
}
