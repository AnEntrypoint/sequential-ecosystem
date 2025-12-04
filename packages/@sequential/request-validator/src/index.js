import { formatError } from '@sequential/response-formatting';

export function validateRequest(schema) {
  return (req, res, next) => {
    const errors = [];
    req.validated = {};

    if (schema.params) {
      req.validated.params = {};
      for (const [key, rules] of Object.entries(schema.params)) {
        const value = req.params[key];
        const error = validateField(key, value, rules);
        if (error) {
          errors.push(error);
        } else {
          req.validated.params[key] = value;
        }
      }
    }

    if (schema.query) {
      req.validated.query = {};
      for (const [key, rules] of Object.entries(schema.query)) {
        const value = req.query[key];
        const error = validateField(key, value, rules);
        if (error) {
          errors.push(error);
        } else {
          req.validated.query[key] = value;
        }
      }
    }

    if (schema.body) {
      req.validated.body = {};
      for (const [key, rules] of Object.entries(schema.body)) {
        const value = req.body?.[key];
        const error = validateField(key, value, rules);
        if (error) {
          errors.push(error);
        } else {
          req.validated.body[key] = value;
        }
      }
    }

    if (errors.length > 0) {
      return res.status(400).json(formatError(400, {
        code: 'VALIDATION_ERROR',
        message: 'Request validation failed',
        errors
      }));
    }

    next();
  };
}

export function validateField(name, value, rules) {
  const { optional = false, type = null, validator = null, enum: enumValues = null } = rules;

  if (!value && optional) return null;
  if (!value) return `${name} is required`;

  if (type && typeof value !== type) {
    return `${name} must be ${type}`;
  }

  if (enumValues && !enumValues.includes(value)) {
    return `${name} must be one of: ${enumValues.join(', ')}`;
  }

  if (validator && typeof validator === 'function') {
    try {
      validator(value);
    } catch (e) {
      return `${name}: ${e.message}`;
    }
  }

  return null;
}

export const commonValidators = {
  nonEmpty: (v) => {
    if (!v || v.trim?.().length === 0) throw new Error('cannot be empty');
  },
  positive: (v) => {
    if (typeof v !== 'number' || v <= 0) throw new Error('must be positive');
  },
  notNull: (v) => {
    if (v === null || v === undefined) throw new Error('cannot be null');
  }
};
