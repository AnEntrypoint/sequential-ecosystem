/**
 * flow-handler-validator.js - Flow Handler Validator Factory (Facade)
 *
 * Creates validators for flow definitions, handlers, and transitions
 */

import { HandlerValidator } from './handler-validator.js';
import { TransitionValidator } from './transition-validator.js';

export function createFlowHandlerValidator() {
  return {
    validateFlowHandlers(graph, exports) {
      return HandlerValidator.validateFlowHandlers(graph, exports);
    },
    validateTransitions(graph) {
      return TransitionValidator.validateTransitions(graph);
    },
    validateInitialState(graph) {
      return TransitionValidator.validateInitialState(graph);
    },
    fullValidation(graph, exports) {
      const handlers = HandlerValidator.validateFlowHandlers(graph, exports);
      const transitionData = TransitionValidator.validateAll(graph);

      const allErrors = [
        ...handlers.errors,
        ...transitionData.transitionErrors,
        ...(transitionData.initialError ? [{ type: 'invalid_initial', message: transitionData.initialError }] : [])
      ];

      return {
        valid: handlers.valid && transitionData.valid,
        errors: allErrors,
        summary: {
          handlers: handlers.errors.length,
          transitions: transitionData.transitionErrors.length,
          initial: transitionData.initialError ? 1 : 0,
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

import { createFlowHandlerValidator } from '@sequentialos/flow-validation';

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
