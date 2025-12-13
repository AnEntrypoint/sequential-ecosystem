/**
 * Flow Composition Templates
 * Generates JSX code templates for composed flows
 */

export function generateComposedFlowTemplate(flowName, flows = []) {
  const flowNames = flows.map(f => `'${f}'`).join(', ');

  return `/**
 * ${flowName} - Composed Flow
 *
 * Chains multiple flows together into a larger workflow.
 * Flows execute sequentially: ${flowNames || 'define flows below'}
 *
 * Architecture:
 * flow-0 (onDone) -> flow-1 (onDone) -> ... -> final
 *           (onError) -> handleError
 */

export const graph = {
  initial: 'flow-0',
  states: {
    'flow-0': {
      type: 'flow-call',
      flowName: 'first-flow',
      onDone: 'flow-1',
      onError: 'handleError'
    },
    'flow-1': {
      type: 'flow-call',
      flowName: 'second-flow',
      onDone: 'final',
      onError: 'handleError'
    },
    handleError: {
      type: 'final'
    },
    final: {
      type: 'final'
    }
  }
};

// Handler for first flow result
export async function processFlowResult(context) {
  // Transform output from first flow for input to second flow
  return context;
}

// Error handler
export async function handleError(error) {
  console.error('Flow composition error:', error);
  return { error: error.message, success: false };
}

/**
 * Usage:
 * 1. Define your flows separately (flow1.js, flow2.js)
 * 2. This composed flow chains them together
 * 3. Output from first flow becomes input to second flow
 * 4. On error, the handleError state is invoked
 */
`;
}
