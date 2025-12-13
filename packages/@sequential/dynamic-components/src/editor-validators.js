// Property validators
export class EditorValidators {
  constructor() {
    this.validators = new Map();
    this.initializeValidators();
  }

  initializeValidators() {
    this.validators.set('string', (val) => typeof val === 'string');
    this.validators.set('number', (val) => !isNaN(val) && val !== '');
    this.validators.set('boolean', (val) => val === true || val === false);
    this.validators.set('array', (val) => Array.isArray(val));
    this.validators.set('object', (val) => typeof val === 'object' && val !== null);
    this.validators.set('color', (val) => /^#[0-9A-F]{6}$/i.test(val));
    this.validators.set('url', (val) => {
      try {
        new URL(val);
        return true;
      } catch {
        return false;
      }
    });
    this.validators.set('email', (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val));
  }

  validateProperty(propName, value, propConfig) {
    if (propConfig.required && !value) {
      return { valid: false, error: `${propName} is required` };
    }

    if (propConfig.type && propConfig.type !== 'select') {
      const validator = this.validators.get(propConfig.type);
      if (validator && value && !validator(value)) {
        return { valid: false, error: `Invalid ${propConfig.type}` };
      }
    }

    if (propConfig.minLength && value.length < propConfig.minLength) {
      return { valid: false, error: `Minimum ${propConfig.minLength} characters` };
    }

    if (propConfig.maxLength && value.length > propConfig.maxLength) {
      return { valid: false, error: `Maximum ${propConfig.maxLength} characters` };
    }

    if (propConfig.min !== undefined && Number(value) < propConfig.min) {
      return { valid: false, error: `Minimum value ${propConfig.min}` };
    }

    if (propConfig.max !== undefined && Number(value) > propConfig.max) {
      return { valid: false, error: `Maximum value ${propConfig.max}` };
    }

    if (propConfig.pattern && !new RegExp(propConfig.pattern).test(value)) {
      return { valid: false, error: 'Invalid format' };
    }

    return { valid: true };
  }
}
