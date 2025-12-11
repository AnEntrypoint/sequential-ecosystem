/**
 * error-input-sanitizer.js
 *
 * Sanitize sensitive data in error context
 */

export function createErrorInputSanitizer() {
  return {
    sanitizeInput(input) {
      if (!input || typeof input !== 'object') return input;

      const sanitized = { ...input };
      const sensitive = ['password', 'token', 'key', 'secret', 'apiKey', 'authorization'];

      for (const key of Object.keys(sanitized)) {
        if (sensitive.some(s => key.toLowerCase().includes(s))) {
          sanitized[key] = '***REDACTED***';
        }
      }

      return sanitized;
    }
  };
}
