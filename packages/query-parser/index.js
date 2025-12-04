import { throwValidationError } from '@sequential/error-handling';

export function parseQuery(req, schema) {
  const params = req.query || {};
  const result = {};

  for (const [key, config] of Object.entries(schema)) {
    const value = params[key];
    if (config.required && !value) {
      throwValidationError(key, `${key} is required`);
    }
    if (value) {
      if (config.type === 'number') result[key] = parseInt(value);
      else if (config.type === 'boolean') result[key] = value === 'true';
      else if (config.type === 'json') result[key] = JSON.parse(value);
      else result[key] = value;
    } else if (config.default !== undefined) {
      result[key] = config.default;
    }
  }

  return result;
}

export function parseBody(req, schema) {
  const body = req.body || {};
  const result = {};

  for (const [key, config] of Object.entries(schema)) {
    const value = body[key];
    if (config.required && value === undefined) {
      throwValidationError(key, `${key} is required`);
    }
    if (value !== undefined) {
      if (config.type === 'number') result[key] = Number(value);
      else if (config.type === 'boolean') result[key] = Boolean(value);
      else result[key] = value;
    } else if (config.default !== undefined) {
      result[key] = config.default;
    }
  }

  return result;
}

export function parseQueryOrBody(req, schema) {
  return req.body ? parseBody(req, schema) : parseQuery(req, schema);
}
