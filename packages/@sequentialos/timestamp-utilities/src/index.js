export function nowISO() {
  return new Date().toISOString();
}

export function nowUnix() {
  return Date.now();
}

export function createTimestamps() {
  const now = nowISO();
  return {
    createdAt: now,
    updatedAt: now
  };
}

export function updateTimestamp() {
  return {
    updatedAt: nowISO()
  };
}

export function isoToUnix(iso) {
  if (!iso) return null;
  const date = new Date(iso);
  return date.getTime();
}

export function unixToISO(unix) {
  if (!unix) return null;
  return new Date(unix).toISOString();
}

export function formatDuration(ms) {
  if (!ms || ms < 0) return '0ms';

  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(2)}s`;
  if (ms < 3600000) return `${(ms / 60000).toFixed(2)}m`;
  return `${(ms / 3600000).toFixed(2)}h`;
}

export function timeAgo(timestamp) {
  const now = Date.now();
  const isoTime = typeof timestamp === 'string' ? isoToUnix(timestamp) : timestamp;
  const diffMs = now - isoTime;

  if (diffMs < 0) return 'in the future';
  if (diffMs < 1000) return 'just now';
  if (diffMs < 60000) return `${Math.floor(diffMs / 1000)}s ago`;
  if (diffMs < 3600000) return `${Math.floor(diffMs / 60000)}m ago`;
  if (diffMs < 86400000) return `${Math.floor(diffMs / 3600000)}h ago`;
  if (diffMs < 604800000) return `${Math.floor(diffMs / 86400000)}d ago`;
  return `${Math.floor(diffMs / 604800000)}w ago`;
}

export function isExpired(timestamp, ttlMs) {
  if (!timestamp) return true;
  const isoTime = typeof timestamp === 'string' ? isoToUnix(timestamp) : timestamp;
  return Date.now() - isoTime > ttlMs;
}

export function isWithinWindow(timestamp, windowMs) {
  if (!timestamp) return false;
  const isoTime = typeof timestamp === 'string' ? isoToUnix(timestamp) : timestamp;
  return Math.abs(Date.now() - isoTime) <= windowMs;
}

export function addMs(timestamp, ms) {
  const isoTime = typeof timestamp === 'string' ? isoToUnix(timestamp) : timestamp;
  return unixToISO(isoTime + ms);
}

export function subtractMs(timestamp, ms) {
  const isoTime = typeof timestamp === 'string' ? isoToUnix(timestamp) : timestamp;
  return unixToISO(isoTime - ms);
}

export function getStartOfDay(timestamp) {
  const date = typeof timestamp === 'string' ? new Date(timestamp) : new Date(timestamp);
  date.setHours(0, 0, 0, 0);
  return date.toISOString();
}

export function getEndOfDay(timestamp) {
  const date = typeof timestamp === 'string' ? new Date(timestamp) : new Date(timestamp);
  date.setHours(23, 59, 59, 999);
  return date.toISOString();
}
