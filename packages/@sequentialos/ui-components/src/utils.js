import { escapeHtml as escape } from '@sequentialos/text-encoding';

export function escapeHtml(text) {
  if (typeof document !== 'undefined') {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
  return escape(text);
}

export function formatCode(html) {
  const div = document.createElement('div');
  div.innerHTML = html;
  return div.textContent;
}

export function debounce(fn, delay) {
  let timeoutId;
  return function(...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

export function throttle(fn, delay) {
  let lastCall = 0;
  return function(...args) {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      fn(...args);
    }
  };
}

export function formatVariableValue(value, maxLength = 100) {
  if (value === null) return 'null';
  if (value === undefined) return 'undefined';
  if (typeof value === 'string') {
    const truncated = value.substring(0, maxLength);
    return `"${truncated}${value.length > maxLength ? '...' : ''}"`;
  }
  if (typeof value === 'object') {
    const str = JSON.stringify(value);
    return str.substring(0, maxLength) + (str.length > maxLength ? '...' : '');
  }
  return String(value);
}

export function createStatusBadge(status) {
  const colors = {
    'stopped': '#666',
    'paused': '#f59e0b',
    'running': '#3b82f6',
    'completed': '#22c55e',
    'error': '#ef4444'
  };

  return {
    update(element) {
      element.className = `status-badge ${status}`;
      element.textContent = status.toUpperCase();
      element.style.background = colors[status] || colors.stopped;
    },
    getColor() { return colors[status]; }
  };
}
