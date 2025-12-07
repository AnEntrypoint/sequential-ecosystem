/**
 * Flow Graph Validators
 *
 * Comprehensive validation for flow definitions to catch errors early
 * and provide actionable feedback to developers.
 */

/**
 * Validate complete flow definition
 *
 * Checks:
 * - Graph structure (required fields, valid states)
 * - State definitions (handlers, transitions)
 * - State transitions (valid paths, no dead states)
 * - Handler functions (exist, correct signature)
 * - Error handling (handleError state exists)
 *
 * @param {Object} graph - Flow graph definition
 * @param {Object} handlers - Object with handler functions
 * @returns {Object} - { valid: boolean, errors: string[], warnings: string[] }
 *
 * @example
 * const result = validateFlow(flowGraph, { step1, step2, handleError });
 * if (!result.valid) {
 *   console.error('Flow validation failed:', result.errors);
 * }
 */
export function validateFlow(graph, handlers = {}) {
  const errors = [];
  const warnings = [];

  if (!graph) {
    return { valid: false, errors: ['Flow graph is required'], warnings: [] };
  }

  // 1. Validate graph structure
  if (!graph.initial) {
    errors.push('Graph must define an "initial" state');
  }

  if (!graph.states || typeof graph.states !== 'object' || Object.keys(graph.states).length === 0) {
    errors.push('Graph must define at least one state in "states" object');
    return { valid: false, errors, warnings };
  }

  // 2. Validate initial state exists
  if (graph.initial && !graph.states[graph.initial]) {
    errors.push(`Initial state "${graph.initial}" not defined in states`);
  }

  // 3. Validate each state
  const stateNames = Object.keys(graph.states);
  for (const stateName of stateNames) {
    const state = graph.states[stateName];

    if (!state || typeof state !== 'object') {
      errors.push(`State "${stateName}" is not an object`);
      continue;
    }

    // Check for handler (unless it's a final state)
    if (state.type !== 'final') {
      if (!state.handlerType && !state.taskName && !state.code && !handlers[stateName]) {
        warnings.push(`State "${stateName}" has no handler defined - will return context unchanged`);
      }
    }

    // Validate transitions
    if (state.onDone && !graph.states[state.onDone]) {
      errors.push(`State "${stateName}" references non-existent state "${state.onDone}" in onDone`);
    }

    if (state.onError && !graph.states[state.onError]) {
      errors.push(`State "${stateName}" references non-existent state "${state.onError}" in onError`);
    }

    // Validate handler type
    if (state.handlerType && !['task', 'code', 'service'].includes(state.handlerType)) {
      errors.push(`State "${stateName}" has invalid handlerType "${state.handlerType}" - must be task, code, or service`);
    }

    // Validate task name if handler is task
    if (state.handlerType === 'task' && !state.taskName) {
      errors.push(`State "${stateName}" is a task handler but taskName is not defined`);
    }

    // Validate code if handler is code
    if (state.handlerType === 'code' && !state.code) {
      errors.push(`State "${stateName}" is a code handler but code is not defined`);
    }
  }

  // 4. Check for circular references and infinite loops
  const circularStates = findCircularPaths(graph);
  if (circularStates.length > 0) {
    for (const cycle of circularStates) {
      warnings.push(`Circular path detected: ${cycle.join(' → ')}`);
    }
  }

  // 5. Check for unreachable states
  const reachable = findReachableStates(graph);
  for (const stateName of stateNames) {
    if (!reachable.has(stateName)) {
      warnings.push(`State "${stateName}" is unreachable from initial state "${graph.initial}"`);
    }
  }

  // 6. Check for proper error handling
  const hasErrorHandler = stateNames.includes('handleError');
  if (!hasErrorHandler) {
    warnings.push('No "handleError" state defined - errors will not be caught');
  }

  // 7. Validate handlers exist as functions
  for (const handlerName of Object.keys(handlers)) {
    if (typeof handlers[handlerName] !== 'function') {
      errors.push(`Handler "${handlerName}" is not a function`);
    }
  }

  // 8. Check for missing handlers
  for (const stateName of stateNames) {
    const state = graph.states[stateName];
    if (state.type !== 'final' && !state.handlerType && !state.taskName && !state.code) {
      if (!handlers[stateName]) {
        errors.push(`State "${stateName}" has no handler defined and no handler function provided`);
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    summary: {
      states: stateNames.length,
      reachable: reachable.size,
      unreachable: stateNames.length - reachable.size,
      hasErrorHandler,
      hasCircularPaths: circularStates.length > 0
    }
  };
}

/**
 * Find all reachable states from the initial state
 * @private
 */
function findReachableStates(graph) {
  const reachable = new Set();
  const queue = [graph.initial];

  while (queue.length > 0) {
    const stateName = queue.shift();

    if (reachable.has(stateName)) continue;
    reachable.add(stateName);

    const state = graph.states[stateName];
    if (!state) continue;

    if (state.onDone && !reachable.has(state.onDone)) {
      queue.push(state.onDone);
    }
    if (state.onError && !reachable.has(state.onError)) {
      queue.push(state.onError);
    }
  }

  return reachable;
}

/**
 * Find circular paths in the graph
 * @private
 */
function findCircularPaths(graph, maxDepth = 10) {
  const cycles = [];
  const visited = new Set();

  function dfs(stateName, path) {
    if (path.length > maxDepth) return; // Prevent infinite recursion

    if (path.includes(stateName)) {
      const cycleStart = path.indexOf(stateName);
      cycles.push([...path.slice(cycleStart), stateName]);
      return;
    }

    const state = graph.states[stateName];
    if (!state) return;

    const newPath = [...path, stateName];

    if (state.onDone) {
      dfs(state.onDone, newPath);
    }
    if (state.onError) {
      dfs(state.onError, newPath);
    }
  }

  dfs(graph.initial, []);
  return cycles;
}

/**
 * Validate flow state definition
 *
 * @param {string} stateName - State name
 * @param {Object} state - State definition
 * @returns {Object} - { valid: boolean, errors: string[] }
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

/**
 * Validate flow graph structure only (no handler validation)
 *
 * Useful for validating graph definition before handlers are available.
 *
 * @param {Object} graph - Flow graph definition
 * @returns {Object} - { valid: boolean, errors: string[] }
 */
export function validateFlowGraph(graph) {
  const errors = [];

  if (!graph) {
    return { valid: false, errors: ['Flow graph is required'] };
  }

  if (!graph.initial) {
    errors.push('Graph must define an "initial" state');
  }

  if (!graph.states || typeof graph.states !== 'object' || Object.keys(graph.states).length === 0) {
    errors.push('Graph must define at least one state in "states" object');
    return { valid: false, errors };
  }

  const stateNames = Object.keys(graph.states);

  if (graph.initial && !stateNames.includes(graph.initial)) {
    errors.push(`Initial state "${graph.initial}" not defined in states`);
  }

  for (const stateName of stateNames) {
    const state = graph.states[stateName];

    if (!state || typeof state !== 'object') {
      errors.push(`State "${stateName}" is not an object`);
      continue;
    }

    const validation = validateFlowState(stateName, state);
    if (!validation.valid) {
      errors.push(...validation.errors);
    }

    // Validate references to other states
    if (state.onDone && !stateNames.includes(state.onDone)) {
      errors.push(`State "${stateName}" references non-existent state "${state.onDone}" in onDone`);
    }

    if (state.onError && !stateNames.includes(state.onError)) {
      errors.push(`State "${stateName}" references non-existent state "${state.onError}" in onError`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    stateCount: stateNames.length
  };
}

/**
 * Get flow validation report for debugging
 *
 * Provides detailed information about flow structure, reachability,
 * and potential issues.
 *
 * @param {Object} graph - Flow graph definition
 * @param {Object} handlers - Handler functions
 * @returns {Object} - Detailed validation report
 */
export function getFlowValidationReport(graph, handlers = {}) {
  const validation = validateFlow(graph, handlers);
  const graphValidation = validateFlowGraph(graph);

  return {
    ...validation,
    graphValidation,
    initialState: graph.initial,
    stateNames: Object.keys(graph.states || {}),
    handlerNames: Object.keys(handlers),
    timestamp: new Date().toISOString()
  };
}
