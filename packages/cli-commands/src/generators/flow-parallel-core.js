export function createParallelState(name, branches, joinCondition = 'all') {
  return {
    name,
    type: 'parallel',
    branches,
    joinCondition,
    metadata: {
      createdAt: new Date().toISOString()
    }
  };
}

export function createParallelBranch(name, startState, endState) {
  return { name, startState, endState };
}

export function validateParallelFlow(graph) {
  const issues = [];

  for (const [stateName, state] of Object.entries(graph.states || {})) {
    if (state.type === 'parallel') {
      if (!state.branches || state.branches.length === 0) {
        issues.push(`State ${stateName}: parallel missing branches`);
      }

      if (!state.joinCondition) {
        issues.push(`State ${stateName}: parallel missing joinCondition`);
      }

      const validConditions = ['all', 'any', 'count'];
      if (!validConditions.includes(state.joinCondition)) {
        issues.push(`State ${stateName}: invalid joinCondition '${state.joinCondition}'`);
      }

      for (const branch of state.branches || []) {
        if (!branch.name || !branch.startState || !branch.endState) {
          issues.push(`State ${stateName}: branch missing name, startState, or endState`);
        }

        if (!graph.states[branch.startState]) {
          issues.push(`State ${stateName}: branch startState '${branch.startState}' not found`);
        }

        if (!graph.states[branch.endState]) {
          issues.push(`State ${stateName}: branch endState '${branch.endState}' not found`);
        }
      }

      if (state.onDone && !graph.states[state.onDone]) {
        issues.push(`State ${stateName}: onDone references non-existent state ${state.onDone}`);
      }
    }
  }

  return { valid: issues.length === 0, issues };
}

export function analyzeParallelFlow(graph) {
  const parallelStates = [];
  const branchCount = {};

  for (const [stateName, state] of Object.entries(graph.states || {})) {
    if (state.type === 'parallel') {
      parallelStates.push({
        state: stateName,
        branchCount: (state.branches || []).length,
        joinCondition: state.joinCondition,
        branches: (state.branches || []).map(b => b.name)
      });

      branchCount[stateName] = (state.branches || []).length;
    }
  }

  return {
    totalParallelStates: parallelStates.length,
    parallelStates,
    totalBranches: Object.values(branchCount).reduce((sum, count) => sum + count, 0)
  };
}

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
        currentState = currentState; // In real execution, next state determined by graph
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

export function generateParallelFlowTemplate() {
  return `/**
 * Parallel Flow
 *
 * Execute multiple independent branches in parallel.
 */

export const graph = {
  initial: 'fetchData',
  states: {
    fetchData: {
      type: 'parallel',
      branches: [
        { name: 'fetchUser', startState: 'getUserData', endState: 'userDataReady' },
        { name: 'fetchOrders', startState: 'getOrderData', endState: 'ordersDataReady' }
      ],
      joinCondition: 'all',
      onDone: 'combineResults'
    },

    getUserData: {
      onDone: 'userDataReady'
    },
    userDataReady: {
      type: 'join'
    },

    getOrderData: {
      onDone: 'ordersDataReady'
    },
    ordersDataReady: {
      type: 'join'
    },

    combineResults: {
      onDone: 'final'
    },

    final: {
      type: 'final'
    }
  }
};

export async function getUserData(input) {
  return {
    ...input,
    user: await __callHostTool__('task', 'fetch-user', { id: input.userId })
  };
}

export async function getOrderData(input) {
  return {
    ...input,
    orders: await __callHostTool__('task', 'fetch-orders', { userId: input.userId })
  };
}

export async function combineResults(input) {
  return {
    success: true,
    user: input.user,
    orders: input.orders,
    totalOrders: input.orders?.length || 0
  };
}

// Join conditions:
// - 'all': All branches must succeed
// - 'any': At least one branch must succeed
// - 'count': Specified number of branches must succeed
`;
}
