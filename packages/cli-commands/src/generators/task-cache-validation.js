export function validateCacheConfig(config) {
  const errors = [];

  if (config.ttl < 0) {
    errors.push('TTL must be >= 0');
  }

  if (config.maxSize < 0) {
    errors.push('Max size must be >= 0');
  }

  if (config.ttl === 0 && config.maxSize === 0) {
    errors.push('Cache disabled: both TTL and maxSize are 0');
  }

  return {
    valid: errors.length === 0,
    errors,
    warning: config.maxSize > 5000 ? 'Large maxSize may impact memory usage' : null
  };
}
