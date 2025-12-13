/**
 * Flow Parallel Runner Factory
 * Creates parallel flow runners for executing parallel branches
 */

import { executeParallelBranches, evaluateJoinCondition } from './flow-parallel-executor.js';

export function createParallelFlowRunner() {
  return {
    async executeParallelFlow(graph, handlers, input) {
      let currentState = graph.initial;
      let context = input;
      const history = [];

      while (currentState && graph.states[currentState]) {
        const state = graph.states[currentState];

        if (state.type === 'final') {
          history.push({ state: currentState, final: true });
          break;
        }

        if (state.type === 'parallel') {
          const branchResults = await executeParallelBranches(
            state.branches,
            handlers,
            context
          );

          const joinResult = evaluateJoinCondition(
            state.joinCondition,
            branchResults
          );

          if (!joinResult.satisfied) {
            throw new Error(`Join condition '${state.joinCondition}' not satisfied`);
          }

          context = joinResult.mergedContext;

          history.push({
            state: currentState,
            type: 'parallel',
            branches: branchResults,
            joinCondition: state.joinCondition
          });

          currentState = state.onDone;
        } else {
          const handler = handlers[currentState];
          if (handler) {
            context = await handler(context);
          }

          history.push({ state: currentState, context });
          currentState = state.onDone;
        }
      }

      return {
        finalState: currentState,
        context,
        history,
        success: currentState === 'final'
      };
    }
  };
}
