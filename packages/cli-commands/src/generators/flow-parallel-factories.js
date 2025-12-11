/**
 * Flow Parallel Core - Factory Functions Module
 * Parallel state and branch creation factories
 */

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
