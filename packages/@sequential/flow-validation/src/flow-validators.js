/**
 * Flow Graph Validators - Facade
 *
 * Comprehensive validation for flow definitions to catch errors early
 * and provide actionable feedback to developers.
 */

import { findReachableStates, findCircularPaths } from './flow-graph-analyzer.js';
import { validateFlowState } from './flow-state-validator.js';
import { validateFlowStructure, validateGraphStates, validateHandlers, checkErrorHandling } from './flow-structure-validator.js';

/**
 * Validate complete flow definition
 *
 * Checks:
 * - Graph structure (required fields, valid states)
 * - State definitions (handlers, transitions)
 * - State transitions (valid paths, no dead states)
 * - Handler functions (exist, correct signature)
 * - Error handling (handleError state exists)
 */
export function validateFlow(graph, handlers = {}) {
  const errors = [];
  const warnings = [];

  // 1. Validate graph structure
  const structureResult = validateFlowStructure(graph, handlers);
  errors.push(...structureResult.errors);

  if (errors.length > 0 && !graph?.states) {
    return { valid: false, errors, warnings };
  }

  const stateNames = structureResult.stateNames || Object.keys(graph?.states || {});

  // 2. Validate states
  const stateErrors = validateGraphStates(graph, handlers, stateNames, validateFlowState);
  errors.push(...stateErrors);

  // 3. Validate handlers exist as functions
  const handlerErrors = validateHandlers(handlers);
  errors.push(...handlerErrors);

  // 4. Check for circular references
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
  const { hasErrorHandler, warnings: errorWarnings } = checkErrorHandling(stateNames);
  warnings.push(...errorWarnings);

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
 * Validate flow graph structure only (no handler validation)
 */
export function validateFlowGraph(graph) {
  const errors = [];

  if (!graph) {
    return { valid: false, errors: ['Flow graph is required'] };
  }

  const structureResult = validateFlowStructure(graph);
  errors.push(...structureResult.errors);

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  const stateNames = Object.keys(graph.states);
  const stateErrors = validateGraphStates(graph, {}, stateNames, validateFlowState);
  errors.push(...stateErrors);

  return {
    valid: errors.length === 0,
    errors,
    stateCount: stateNames.length
  };
}

/**
 * Get flow validation report for debugging
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

// Re-export for public API
export { validateFlowState };
