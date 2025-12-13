/**
 * Flow Parallel Core - Validation and Analysis Module
 * Flow validation and parallel state analysis
 */

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
