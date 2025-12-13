export function validateConfig(config, loadedModule = null) {
  const errors = [];
  const warnings = [];

  if (!config.module && !config.service) {
    errors.push('Either "module" or "service" must be specified');
  }

  if (config.module && !loadedModule) {
    warnings.push(`Module "${config.module}" not loaded for validation`);
  }

  if (config.credentials && Array.isArray(config.credentials)) {
    if (config.credentials.length === 0) {
      warnings.push('No credentials specified; may fail at runtime');
    }
  }

  if (config.pause && config.pause.timeout < 1000) {
    warnings.push('Pause timeout < 1s may be too aggressive');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}
