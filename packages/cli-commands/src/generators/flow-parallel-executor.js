/**
 * Flow Parallel Executor
 * Executes parallel branches and manages join conditions
 */

export async function executeParallelBranches(branches, handlers, context) {
  const results = await Promise.all(
    branches.map(branch => executeBranch(branch, handlers, context))
  );

  return results;
}

export async function executeBranch(branch, handlers, context) {
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
}

export function evaluateJoinCondition(condition, results) {
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

  const mergedContext = mergeContexts(results.map(r => r.context));

  return { satisfied: true, mergedContext };
}

export function mergeContexts(contexts) {
  const merged = {};
  for (const ctx of contexts) {
    Object.assign(merged, ctx);
  }
  return merged;
}
