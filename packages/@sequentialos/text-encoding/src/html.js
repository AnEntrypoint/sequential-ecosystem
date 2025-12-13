const HTML_ENTITY_MAP = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
  '/': '&#x2F;'
};

const HTML_DECODE_MAP = {
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&#39;': "'",
  '&#x2F;': '/'
};

export function escapeHtml(str) {
  if (typeof str !== 'string') return str;
  return str.replace(/[&<>"'\/]/g, char => HTML_ENTITY_MAP[char]);
}

export function unescapeHtml(str) {
  if (typeof str !== 'string') return str;
  let result = str;
  for (const [entity, char] of Object.entries(HTML_DECODE_MAP)) {
    result = result.replace(new RegExp(entity, 'g'), char);
  }
  return result;
}

export function escapeHtmlAttributes(attrs) {
  if (!attrs || typeof attrs !== 'object') return '';
  return Object.entries(attrs)
    .map(([key, val]) => `${key}="${escapeHtml(String(val))}"`)
    .join(' ');
}

export function sanitizeTagContent(html) {
  if (typeof html !== 'string') return html;
  return html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
    .replace(/on\w+\s*=\s*[^\s>]*/gi, '');
}
