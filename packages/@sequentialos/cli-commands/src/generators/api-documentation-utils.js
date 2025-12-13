/**
 * API Documentation Core - Utility Functions Module
 * Helper functions for documentation analysis
 */

export function extractFunctionParams(fn) {
  const fnStr = fn.toString();
  const paramMatch = fnStr.match(/\(([^)]*)\)/);
  if (!paramMatch) return [];

  return paramMatch[1]
    .split(',')
    .map(p => p.trim())
    .filter(p => p && !p.startsWith('='))
    .map(p => p.split('=')[0].trim());
}

export function inferReturnType(fn) {
  const fnStr = fn.toString();
  if (fnStr.includes('async')) return 'Promise';
  if (fnStr.includes('return')) return 'unknown';
  return 'void';
}

export function getStateTransitions(graph, stateName) {
  const state = graph.states[stateName];
  const transitions = [];

  if (state.onDone) transitions.push({ event: 'done', to: state.onDone });
  if (state.onError) transitions.push({ event: 'error', to: state.onError });
  if (state.onTrue) transitions.push({ event: 'true', to: state.onTrue });
  if (state.onFalse) transitions.push({ event: 'false', to: state.onFalse });

  return transitions;
}

export function extractFlowHandlers(graph) {
  const handlers = new Set();

  for (const state of Object.keys(graph.states || {})) {
    if (graph.states[state].type !== 'final' && state !== graph.initial) {
      handlers.add(state);
    }
  }

  return Array.from(handlers);
}
