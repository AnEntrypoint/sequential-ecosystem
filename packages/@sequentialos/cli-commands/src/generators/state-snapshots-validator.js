export function validateSnapshotConfig(config) {
  const errors = [];

  if (config.maxSnapshots && config.maxSnapshots < 1) {
    errors.push('maxSnapshots must be >= 1');
  }

  if (config.maxSize && config.maxSize < 1000) {
    errors.push('maxSize must be >= 1000 bytes');
  }

  if (config.ttl && config.ttl < 0) {
    errors.push('ttl must be >= 0');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}
