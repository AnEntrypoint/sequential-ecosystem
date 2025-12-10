import { escapeHtml as escape, sanitizeInput as sanitize } from '@sequentialos/text-encoding';

export function escapeHtml(text) {
  if (!text || typeof text !== 'string') return text;
  return escape(text);
}

export function sanitizeInput(input, allowHtml = false) {
  if (typeof input === 'string') {
    return allowHtml ? input.trim() : escapeHtml(input.trim());
  }
  if (Array.isArray(input)) {
    return input.map(item => sanitizeInput(item, allowHtml));
  }
  if (typeof input === 'object' && input !== null) {
    const sanitized = {};
    for (const [key, value] of Object.entries(input)) {
      sanitized[key] = sanitizeInput(value, allowHtml);
    }
    return sanitized;
  }
  return input;
}
