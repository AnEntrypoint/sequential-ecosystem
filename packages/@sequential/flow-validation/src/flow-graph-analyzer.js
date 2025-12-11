/**
 * Graph analysis and reachability detection
 */
export function findReachableStates(graph) {
  const reachable = new Set();
  const queue = [graph.initial];

  while (queue.length > 0) {
    const stateName = queue.shift();

    if (reachable.has(stateName)) continue;
    reachable.add(stateName);

    const state = graph.states[stateName];
    if (!state) continue;

    if (state.onDone && !reachable.has(state.onDone)) {
      queue.push(state.onDone);
    }
    if (state.onError && !reachable.has(state.onError)) {
      queue.push(state.onError);
    }
  }

  return reachable;
}

/**
 * Find circular paths in the graph
 */
export function findCircularPaths(graph, maxDepth = 10) {
  const cycles = [];
  const visited = new Set();

  function dfs(stateName, path) {
    if (path.length > maxDepth) return; // Prevent infinite recursion

    if (path.includes(stateName)) {
      const cycleStart = path.indexOf(stateName);
      cycles.push([...path.slice(cycleStart), stateName]);
      return;
    }

    const state = graph.states[stateName];
    if (!state) return;

    const newPath = [...path, stateName];

    if (state.onDone) {
      dfs(state.onDone, newPath);
    }
    if (state.onError) {
      dfs(state.onError, newPath);
    }
  }

  dfs(graph.initial, []);
  return cycles;
}
