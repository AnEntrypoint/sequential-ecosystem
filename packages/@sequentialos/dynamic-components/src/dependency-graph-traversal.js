// Graph traversal algorithms
export class DependencyGraphTraversal {
  getTransitiveDependencies(patternId, core, visited = new Set()) {
    if (visited.has(patternId)) return [];
    visited.add(patternId);

    const direct = core.getDependencies(patternId);
    const transitive = [];

    direct.forEach(dep => {
      transitive.push(dep);
      transitive.push(...this.getTransitiveDependencies(dep, core, visited));
    });

    return [...new Set(transitive)];
  }

  getTransitiveDependents(patternId, core, visited = new Set()) {
    if (visited.has(patternId)) return [];
    visited.add(patternId);

    const direct = core.getDependents(patternId);
    const transitive = [];

    direct.forEach(dep => {
      transitive.push(dep);
      transitive.push(...this.getTransitiveDependents(dep, core, visited));
    });

    return [...new Set(transitive)];
  }

  findCycles(core) {
    const visited = new Set();
    const cycles = [];

    const dfs = (node, path, pathSet) => {
      if (pathSet.has(node)) {
        const cycleStart = path.indexOf(node);
        cycles.push(path.slice(cycleStart).concat(node));
        return;
      }

      if (visited.has(node)) return;

      pathSet.add(node);
      path.push(node);

      core.getDependencies(node).forEach(dep => {
        dfs(dep, [...path], new Set(pathSet));
      });

      visited.add(node);
    };

    core.patterns.forEach((_, patternId) => {
      if (!visited.has(patternId)) {
        dfs(patternId, [], new Set());
      }
    });

    return cycles;
  }

  buildAdjacencyMatrix(core) {
    const patternIds = Array.from(core.patterns.keys()).sort();
    const matrix = {};

    patternIds.forEach(id => {
      matrix[id] = {};
      patternIds.forEach(otherId => {
        matrix[id][otherId] = core.graph.get(id)?.has(otherId) ? 1 : 0;
      });
    });

    return matrix;
  }
}
