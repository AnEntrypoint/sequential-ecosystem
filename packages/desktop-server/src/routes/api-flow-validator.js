/**
 * Flow and state validation
 */
export function validateFlowInitial(flow, statusCodes) {
  if (!flow.initial) {
    return {
      valid: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Flow must have an initial state',
        statusCode: statusCodes.VALIDATION_ERROR,
        field: 'initial'
      }
    };
  }
  return { valid: true };
}

/**
 * Validate state IDs
 */
export function validateStateIds(states, statusCodes) {
  if (!Array.isArray(states)) {
    return { valid: true };
  }

  for (const state of states) {
    if (!state.id) {
      return {
        valid: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'All states must have an id property',
          statusCode: statusCodes.VALIDATION_ERROR,
          field: 'states[].id'
        }
      };
    }

    if (!/^[a-zA-Z0-9._-]+$/.test(state.id)) {
      return {
        valid: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: `State id '${state.id}' contains invalid characters. Only alphanumeric, dots, underscores, and hyphens allowed`,
          statusCode: statusCodes.VALIDATION_ERROR,
          field: 'states[].id',
          value: state.id
        }
      };
    }
  }

  return { valid: true };
}
