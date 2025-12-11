/**
 * Individual state validation
 */
export function validateFlowState(stateName, state) {
  const errors = [];

  if (!stateName || typeof stateName !== 'string') {
    return { valid: false, errors: ['State name must be a non-empty string'] };
  }

  if (!state || typeof state !== 'object') {
    errors.push(`State "${stateName}" must be an object`);
    return { valid: false, errors };
  }

  // Validate state type
  if (state.type && !['final', 'parallel'].includes(state.type)) {
    errors.push(`State "${stateName}" has invalid type "${state.type}"`);
  }

  // Validate transitions
  if (state.onDone && typeof state.onDone !== 'string') {
    errors.push(`State "${stateName}" onDone must be a string`);
  }

  if (state.onError && typeof state.onError !== 'string') {
    errors.push(`State "${stateName}" onError must be a string`);
  }

  // Validate timeout
  if (state.timeout && (typeof state.timeout !== 'number' || state.timeout < 0)) {
    errors.push(`State "${stateName}" timeout must be a positive number (milliseconds)`);
  }

  // Validate handler type
  if (state.handlerType) {
    if (!['task', 'code', 'service'].includes(state.handlerType)) {
      errors.push(`State "${stateName}" has invalid handlerType "${state.handlerType}"`);
    }

    // Validate required fields for handler type
    switch (state.handlerType) {
      case 'task':
        if (!state.taskName) {
          errors.push(`State "${stateName}" is a task handler but taskName is not defined`);
        }
        break;
      case 'code':
        if (!state.code) {
          errors.push(`State "${stateName}" is a code handler but code is not defined`);
        }
        break;
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}
