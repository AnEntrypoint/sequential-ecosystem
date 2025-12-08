const SENSITIVE_FIELDS = ['password', 'token', 'key', 'secret', 'apiKey', 'api_key', 'authorization', 'sessionToken', 'session_token', 'auth', 'bearerToken', 'refreshToken'];

export function sanitizeInput(obj) {
  if (!obj || typeof obj !== 'object') return obj;

  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeInput(item));
  }

  const result = {};
  for (const [key, value] of Object.entries(obj)) {
    if (isSensitiveField(key)) {
      result[key] = '***REDACTED***';
    } else if (typeof value === 'object' && value !== null) {
      result[key] = sanitizeInput(value);
    } else {
      result[key] = value;
    }
  }
  return result;
}

export function isSensitiveField(fieldName) {
  if (!fieldName || typeof fieldName !== 'string') return false;
  const lower = fieldName.toLowerCase();
  return SENSITIVE_FIELDS.some(field => lower.includes(field));
}

export function redactSensitiveData(input) {
  if (typeof input !== 'string') return input;
  return input
    .replace(/password[:\s]*[^\s,}]*/gi, 'password: ***REDACTED***')
    .replace(/token[:\s]*[^\s,}]*/gi, 'token: ***REDACTED***')
    .replace(/apikey[:\s]*[^\s,}]*/gi, 'apiKey: ***REDACTED***')
    .replace(/authorization[:\s]*[^\s,}]*/gi, 'authorization: ***REDACTED***');
}

export function validateInputLength(input, maxLength = 10000) {
  if (typeof input !== 'string') return true;
  return input.length <= maxLength;
}

export function validateInputFormat(input, format) {
  if (!input || typeof input !== 'string') return false;

  switch (format) {
    case 'email':
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input);
    case 'url':
      return /^https?:\/\//.test(input);
    case 'uuid':
      return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(input);
    case 'json':
      try {
        JSON.parse(input);
        return true;
      } catch {
        return false;
      }
    case 'alphanumeric':
      return /^[a-z0-9_-]+$/i.test(input);
    case 'slug':
      return /^[a-z0-9]+(?:-[a-z0-9]+)*$/i.test(input);
    default:
      return true;
  }
}
