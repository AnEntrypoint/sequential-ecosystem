export function createFlowHandlerValidator() {
  return {
    validateFlowHandlers(graph, exports) {
      const errors = [];
      const states = graph.states || {};
      const exportedFns = Object.keys(exports).filter(k => typeof exports[k] === 'function');

      const requiredHandlers = new Set();
      for (const [stateName, state] of Object.entries(states)) {
        if (state.type !== 'final' && stateName !== 'error') {
          requiredHandlers.add(stateName);
        }
      }

      for (const handler of requiredHandlers) {
        if (!exportedFns.includes(handler)) {
          errors.push({
            type: 'missing_handler',
            state: handler,
            message: `Handler function not found for state "${handler}". Add: export async function ${handler}(input) { }`
          });
        }
      }

      for (const fn of exportedFns) {
        if (fn === 'graph' || fn.startsWith('_')) continue;
        if (!requiredHandlers.has(fn)) {
          errors.push({
            type: 'unused_handler',
            handler: fn,
            message: `Handler "${fn}" defined but not used in graph states`,
            severity: 'warning'
          });
        }
      }

      return {
        valid: errors.filter(e => e.type === 'error' || !e.severity).length === 0,
        errors,
        missing: errors.filter(e => e.type === 'missing_handler'),
        unused: errors.filter(e => e.type === 'unused_handler')
      };
    },

    validateTransitions(graph) {
      const errors = [];
      const states = Object.keys(graph.states || {});
      const stateSet = new Set(states);

      for (const [stateName, state] of Object.entries(graph.states || {})) {
        const transitions = [state.onDone, state.onError, state.onTrue, state.onFalse]
          .filter(Boolean);

        for (const target of transitions) {
          if (!stateSet.has(target)) {
            errors.push({
              type: 'invalid_transition',
              from: stateName,
              to: target,
              message: `State "${stateName}" transitions to nonexistent state "${target}"`
            });
          }
        }
      }

      return {
        valid: errors.length === 0,
        errors
      };
    },

    validateInitialState(graph) {
      const initial = graph.initial;
      const states = Object.keys(graph.states || {});

      if (!initial) {
        return {
          valid: false,
          error: 'Graph missing "initial" state'
        };
      }

      if (!states.includes(initial)) {
        return {
          valid: false,
          error: `Initial state "${initial}" not defined in graph.states`
        };
      }

      return { valid: true };
    },

    fullValidation(graph, exports) {
      const handlers = this.validateFlowHandlers(graph, exports);
      const transitions = this.validateTransitions(graph);
      const initial = this.validateInitialState(graph);

      const allErrors = [
        ...handlers.errors,
        ...transitions.errors,
        ...(initial.error ? [{ type: 'invalid_initial', message: initial.error }] : [])
      ];

      return {
        valid: handlers.valid && transitions.valid && initial.valid,
        errors: allErrors,
        summary: {
          handlers: handlers.errors.length,
          transitions: transitions.errors.length,
          initial: initial.valid ? 0 : 1,
          total: allErrors.length
        }
      };
    }
  };
}

export function generateFlowHandlerValidatorTemplate() {
  return `/**
 * Flow Handler Validator
 *
 * Validate flow handlers before execution to catch missing/unused handlers.
 */

import { createFlowHandlerValidator } from '@sequential/flow-validation';

const validator = createFlowHandlerValidator();

export const graph = {
  initial: 'fetchData',
  states: {
    fetchData: { onDone: 'processData', onError: 'handleError' },
    processData: { onDone: 'final', onError: 'handleError' },
    handleError: { onDone: 'final' },
    final: { type: 'final' }
  }
};

export async function fetchData(input) {
  return { data: 'fetched' };
}

export async function processData(data) {
  return { processed: true };
}

export async function handleError(error) {
  return { recovered: true };
}

// Validate at module load time
const validation = validator.fullValidation(graph, {
  fetchData,
  processData,
  handleError,
  graph
});

if (!validation.valid) {
  console.error('Flow validation failed:');
  validation.errors.forEach(err => {
    console.error(\` - [\${err.type}] \${err.message}\`);
  });
  throw new Error('Invalid flow definition');
}

console.log('Flow validation passed:', validation.summary);
`;
}
