export function createFlowPatterns() {
  return {
    parallelBranches(branches) {
      return {
        initial: 'execute-branches',
        states: {
          'execute-branches': {
            type: 'parallel',
            branches: branches.map(b => ({
              name: b.name,
              startState: b.start,
              endState: b.end
            })),
            joinCondition: 'all',
            onDone: 'final'
          },
          final: { type: 'final' }
        }
      };
    },

    retryableState(stateName, handler, options = {}) {
      const { maxRetries = 3 } = options;

      return {
        [stateName]: { onDone: 'next', onError: `retry-${stateName}` },
        [`retry-${stateName}`]: {
          async handler(context) {
            context.retryCount = (context.retryCount || 0) + 1;
            if (context.retryCount >= maxRetries) {
              throw new Error(`Max retries exceeded for ${stateName}`);
            }
            return context;
          },
          onDone: stateName,
          onError: 'error'
        }
      };
    },

    conditionalFlow(condition) {
      return {
        initial: 'check-condition',
        states: {
          'check-condition': { onDone: 'condition-result', onError: 'error' },
          'condition-result': {
            type: 'conditional',
            condition,
            onTrue: 'success-path',
            onFalse: 'fallback-path'
          },
          'success-path': { onDone: 'final' },
          'fallback-path': { onDone: 'final' },
          error: { onDone: 'final' },
          final: { type: 'final' }
        }
      };
    },

    pipelineFlow(stages) {
      const states = {};

      for (let i = 0; i < stages.length; i++) {
        const stage = stages[i];
        const nextStage = i < stages.length - 1 ? stages[i + 1].name : 'final';

        states[stage.name] = {
          async handler(context) {
            return stage.handler(context);
          },
          onDone: nextStage,
          onError: 'error'
        };
      }

      states.error = { onDone: 'final' };
      states.final = { type: 'final' };

      return {
        initial: stages[0].name,
        states
      };
    },

    errorHandlingFlow(mainFlow, errorHandler) {
      const wrappedStates = {};

      for (const [stateName, stateConfig] of Object.entries(mainFlow.states || {})) {
        wrappedStates[stateName] = {
          ...stateConfig,
          onError: `error-handler-${stateName}`
        };

        wrappedStates[`error-handler-${stateName}`] = {
          async handler(context, error) {
            context.originalError = error;
            return errorHandler(context, error);
          },
          onDone: stateConfig.onError || 'final'
        };
      }

      return {
        initial: mainFlow.initial,
        states: wrappedStates
      };
    }
  };
}
