class ConfigValidator {
  constructor() {
    this.config = {};
    this.schema = {
      PORT: { type: 'number', default: 3000 },
      NODE_ENV: { type: 'string', default: 'development' },
      LOG_LEVEL: { type: 'string', default: 'info' },
      CORS_ORIGIN: { type: 'string', default: '*' },
      TASK_TIMEOUT: { type: 'number', default: 300000 },
      CACHE_TTL: { type: 'number', default: 60000 },
      DATABASE_URL: { type: 'string', required: false },
      SKIP_STATEKIT: { type: 'boolean', default: false }
    };
  }

  validate(env, strict = false) {
    const validated = {};

    for (const [key, spec] of Object.entries(this.schema)) {
      const value = env[key];

      if (value === undefined || value === '') {
        if (spec.required) {
          throw new Error(`Missing required environment variable: ${key}`);
        }
        validated[key] = spec.default;
      } else {
        validated[key] = this._coerce(value, spec.type);
      }
    }

    this.config = validated;
    return validated;
  }

  _coerce(value, type) {
    if (type === 'number') {
      const num = parseInt(value, 10);
      if (isNaN(num)) throw new Error(`Invalid number: ${value}`);
      return num;
    }
    if (type === 'boolean') {
      return value === 'true' || value === '1' || value === true;
    }
    return String(value);
  }

  getAll() {
    return { ...this.config };
  }

  get(key) {
    return this.config[key];
  }
}

export const validator = new ConfigValidator();

export default {
  validator
};
