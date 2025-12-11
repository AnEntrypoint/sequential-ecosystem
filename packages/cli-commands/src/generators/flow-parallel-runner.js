/**
 * Flow Parallel Core - Execution Runner Module
 * Parallel flow execution and branch management
 */

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
          const branchResults = await this.executeParallelBranches(
            state.branches,
            handlers,
            context
          );

          const joinResult = this.evaluateJoinCondition(
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
    },

    async executeParallelBranches(branches, handlers, context) {
      const results = await Promise.all(
        branches.map(branch => this.executeBranch(branch, handlers, context))
      );

      return results;
    },

    async executeBranch(branch, handlers, context) {
      let currentState = branch.startState;
      let branchContext = { ...context };

      const states = [];

      while (currentState && currentState !== branch.endState) {
        const handler = handlers[currentState];
        if (handler) {
          branchContext = await handler(branchContext);
        }
        states.push(currentState);
        currentState = currentState;
      }

      return {
        branchName: branch.name,
        success: currentState === branch.endState,
        context: branchContext,
        states
      };
    },

    evaluateJoinCondition(condition, results) {
      const successful = results.filter(r => r.success);

      switch (condition) {
        case 'all':
          if (results.length !== successful.length) {
            return { satisfied: false };
          }
          break;

        case 'any':
          if (successful.length === 0) {
            return { satisfied: false };
          }
          break;

        case 'count':
          if (successful.length === 0) {
            return { satisfied: false };
          }
          break;

        default:
          return { satisfied: false };
      }

      const mergedContext = this.mergeContexts(results.map(r => r.context));

      return { satisfied: true, mergedContext };
    },

    mergeContexts(contexts) {
      const merged = {};
      for (const ctx of contexts) {
        Object.assign(merged, ctx);
      }
      return merged;
    }
  };
}
