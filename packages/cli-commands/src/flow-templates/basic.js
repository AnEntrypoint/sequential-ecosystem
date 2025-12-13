import logger from '@sequentialos/sequential-logging';

export function generateFlowTemplate(name, flowId, timestamp, stateCount, description) {
  const flowName = name.replace(/-/g, '_');

  const generateStates = (count) => {
    const states = {};
    const stateNames = [];

    for (let i = 0; i < count; i++) {
      const baseName = ['initialize', 'fetch', 'process', 'transform', 'validate', 'save', 'notify', 'cleanup'][i] || `state_${i}`;
      stateNames.push(baseName);

      if (i === count - 1) {
        states[baseName] = {
          handlerType: 'code',
          code: 'return { success: true, completedAt: new Date().toISOString() };',
          type: 'final'
        };
      } else {
        const nextState = stateNames[i + 1];
        states[baseName] = {
          handlerType: 'code',
          code: `return { state: '${baseName}', progress: ${((i + 1) / count * 100).toFixed(0)}% };`,
          onDone: nextState,
          onError: 'handleError'
        };
      }
    }

    states.handleError = {
      handlerType: 'code',
      code: 'return { success: false, error: context.error || \'Unknown error\' };',
      type: 'final'
    };

    return states;
  };

  const states = generateStates(stateCount);
  const stateNames = Object.keys(states).filter(s => s !== 'handleError');
  const firstState = stateNames[0];

  const statesJson = JSON.stringify(states, null, 2)
    .split('\n')
    .map((line, i) => i === 0 ? line : '  ' + line)
    .join('\n');

  return `/**
 * Flow: ${name}
 * @description ${description || `Flow: ${name}`}
 * @id ${flowId}
 * @created ${timestamp}
 * @states ${stateCount}
 */

export const config = {
  id: '${flowId}',
  name: '${name}',
  description: '${description || `Flow: ${name}`}',
  created: '${timestamp}',
  states: ${stateCount}
};

/**
 * Explicit state machine definition
 * States: ${stateNames.join(' → ')} → handleError
 */
export const graph = {
  id: '${flowId}',
  initial: '${firstState}',
  states: ${statesJson}
};

/**
 * State Handlers
 * Each handler processes input and returns output for next state
 */

${stateNames.map((state, i) => {
    const description = {
      'initialize': 'Setup and initialization',
      'fetch': 'Fetch data from external source',
      'process': 'Process and transform data',
      'transform': 'Apply transformations',
      'validate': 'Validate data',
      'save': 'Persist results',
      'notify': 'Send notifications',
      'cleanup': 'Cleanup resources'
    }[state] || 'Process step';

    return `/**
 * State: ${state}
 * ${description}
 */
export async function ${state}(context) {
  try {
    logger.info('Entering state: ${state}', { context });

    // TODO: Add implementation for ${state}
    // Example:
    // const result = await someOperation(context);
    // return result;

    return {
      state: '${state}',
      success: true,
      processedAt: new Date().toISOString()
    };

  } catch (error) {
    logger.error('Error in ${state}:', error.message);
    throw error;
  }
}`;
  }).join('\n\n')}

/**
 * Error handler state
 * Called when any state throws an error
 */
export async function handleError(context) {
  logger.error('Flow error:', context.error || 'Unknown error');

  return {
    success: false,
    error: context.error?.message || context.error || 'Unknown error',
    failedAt: context.failedAt || new Date().toISOString()
  };
}
`;
}
