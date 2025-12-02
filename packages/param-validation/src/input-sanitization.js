export function escapeHtml(text) {
  if (!text || typeof text !== 'string') return text;
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
    '/': '&#x2F;'
  };
  return text.replace(/[&<>"'\\/]/g, char => map[char]);
}

export function sanitizeInput(input, allowHtml = false) {
  if (typeof input === 'string') {
    return allowHtml ? input.trim() : escapeHtml(input.trim());
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
