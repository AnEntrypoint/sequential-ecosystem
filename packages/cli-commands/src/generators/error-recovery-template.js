export function validateRecoveryConfig(config) {
  const errors = [];

  if (config.maxRetries < 0) {
    errors.push('maxRetries must be >= 0');
  }

  if (config.initialDelay < 0) {
    errors.push('initialDelay must be >= 0');
  }

  if (config.maxDelay < config.initialDelay) {
    errors.push('maxDelay must be >= initialDelay');
  }

  if (config.backoffMultiplier <= 1) {
    errors.push('backoffMultiplier must be > 1');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}
