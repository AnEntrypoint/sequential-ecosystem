/**
 * flow-cycles.js
 *
 * Cycle and loop detection in flow graphs
 */

export function createFlowCycleDetector(states) {
  const visited = new Set();
  const recStack = new Set();

  function getNextStates(state) {
    const next = [];
    if (state.onDone) next.push(state.onDone);
    if (state.onTrue) next.push(state.onTrue);
    if (state.onFalse) next.push(state.onFalse);
    if (state.cases) next.push(...Object.values(state.cases));
    if (state.default) next.push(state.default);
    if (state.branches) next.push(...state.branches);
    return next;
  }

  function hasCycle(stateId) {
    visited.add(stateId);
    recStack.add(stateId);
    const state = states.find(s => s.id === stateId);

    for (const nextId of getNextStates(state || {})) {
      if (!visited.has(nextId)) {
        if (hasCycle(nextId)) return true;
      } else if (recStack.has(nextId)) {
        return true;
      }
    }

    recStack.delete(stateId);
    return false;
  }

  function traceLoop(startId) {
    const path = [];
    let current = startId;
    const seen = new Set();

    while (current && !seen.has(current)) {
      path.push(current);
      seen.add(current);
      const state = states.find(s => s.id === current);
      current = state?.onDone || (state?.onTrue === current ? state?.onFalse : state?.onTrue) || null;
    }

    return current ? path.slice(path.indexOf(current)) : [];
  }

  return {
    detectLoops() {
      const loops = [];
      states.forEach(s => {
        visited.clear();
        recStack.clear();
        if (hasCycle(s.id)) {
          loops.push(traceLoop(s.id));
        }
      });
      return loops;
    }
  };
}
