/**
 * Flow graph structure validation
 */
export function validateFlowStructure(graph, handlers = {}) {
  const errors = [];

  if (!graph) {
    return { errors: ['Flow graph is required'], stateErrors: {} };
  }

  // Validate initial state
  if (!graph.initial) {
    errors.push('Graph must define an "initial" state - e.g., { initial: "step1", states: {...} }');
  }

  // Validate states object
  if (!graph.states || typeof graph.states !== 'object' || Object.keys(graph.states).length === 0) {
    errors.push('Graph must define at least one state in "states" object - e.g., { states: { step1: {...} } }');
    return { errors, stateErrors: {} };
  }

  // Validate initial state exists
  const stateNames = Object.keys(graph.states);
  if (graph.initial && !stateNames.includes(graph.initial)) {
    errors.push(`Initial state "${graph.initial}" not found. Available states: ${stateNames.join(', ')}`);
  }

  return { errors, stateNames };
}

/**
 * Validate individual states in graph
 */
export function validateGraphStates(graph, handlers, stateNames, validateFlowState) {
  const errors = [];

  for (const stateName of stateNames) {
    const state = graph.states[stateName];

    if (!state || typeof state !== 'object') {
      errors.push(`State "${stateName}" is not an object`);
      continue;
    }

    // Check for handler (unless final state)
    if (state.type !== 'final') {
      if (!state.handlerType && !state.taskName && !state.code && !handlers[stateName]) {
        errors.push(`State "${stateName}" has no handler defined and no handler function provided`);
      }
    }

    // Validate transitions to existing states
    if (state.onDone && !graph.states[state.onDone]) {
      const available = stateNames.filter(s => s !== stateName);
      errors.push(`State "${stateName}" transitions to non-existent state "${state.onDone}" on success. Available: ${available.join(', ')}`);
    }

    if (state.onError && !graph.states[state.onError]) {
      const available = stateNames.filter(s => s !== stateName);
      errors.push(`State "${stateName}" transitions to non-existent state "${state.onError}" on error. Available: ${available.join(', ')}`);
    }

    // Validate state structure
    const stateValidation = validateFlowState(stateName, state);
    if (!stateValidation.valid) {
      errors.push(...stateValidation.errors);
    }
  }

  return errors;
}

/**
 * Validate handlers are functions
 */
export function validateHandlers(handlers) {
  const errors = [];

  for (const handlerName of Object.keys(handlers)) {
    if (typeof handlers[handlerName] !== 'function') {
      errors.push(`Handler "${handlerName}" is not a function`);
    }
  }

  return errors;
}

/**
 * Check for error handler state
 */
export function checkErrorHandling(stateNames) {
  const hasErrorHandler = stateNames.includes('handleError');
  const warnings = [];

  if (!hasErrorHandler) {
    warnings.push('No "handleError" state defined - errors will not be caught');
  }

  return { hasErrorHandler, warnings };
}
