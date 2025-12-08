class PatternDependencyGraph {
  constructor() {
    this.graph = new Map();
    this.patterns = new Map();
  }

  registerPattern(patternId, definition, dependencies = []) {
    this.patterns.set(patternId, {
      id: patternId,
      definition,
      dependencies,
      dependents: [],
      metadata: {
        created: Date.now(),
        usageCount: 0,
        lastUsed: null
      }
    });

    if (!this.graph.has(patternId)) {
      this.graph.set(patternId, new Map());
    }

    dependencies.forEach(dep => {
      this.addDependency(patternId, dep);
    });
  }

  addDependency(patternId, dependencyId) {
    if (!this.graph.has(patternId)) {
      this.graph.set(patternId, new Map());
    }
    this.graph.get(patternId).set(dependencyId, true);

    const depPattern = this.patterns.get(dependencyId);
    if (depPattern && !depPattern.dependents.includes(patternId)) {
      depPattern.dependents.push(patternId);
    }
  }

  removeDependency(patternId, dependencyId) {
    if (this.graph.has(patternId)) {
      this.graph.get(patternId).delete(dependencyId);
    }

    const depPattern = this.patterns.get(dependencyId);
    if (depPattern) {
      depPattern.dependents = depPattern.dependents.filter(p => p !== patternId);
    }
  }

  getDependencies(patternId) {
    const deps = this.graph.get(patternId);
    return deps ? Array.from(deps.keys()) : [];
  }

  getDependents(patternId) {
    const pattern = this.patterns.get(patternId);
    return pattern ? pattern.dependents : [];
  }

  getTransitiveDependencies(patternId, visited = new Set()) {
    if (visited.has(patternId)) return [];
    visited.add(patternId);

    const direct = this.getDependencies(patternId);
    const transitive = [];

    direct.forEach(dep => {
      transitive.push(dep);
      transitive.push(...this.getTransitiveDependencies(dep, visited));
    });

    return [...new Set(transitive)];
  }

  getTransitiveDependents(patternId, visited = new Set()) {
    if (visited.has(patternId)) return [];
    visited.add(patternId);

    const direct = this.getDependents(patternId);
    const transitive = [];

    direct.forEach(dep => {
      transitive.push(dep);
      transitive.push(...this.getTransitiveDependents(dep, visited));
    });

    return [...new Set(transitive)];
  }

  findCycles() {
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

      this.getDependencies(node).forEach(dep => {
        dfs(dep, [...path], new Set(pathSet));
      });

      visited.add(node);
    };

    this.patterns.forEach((_, patternId) => {
      if (!visited.has(patternId)) {
        dfs(patternId, [], new Set());
      }
    });

    return cycles;
  }

  getImpactAnalysis(changedPatternId) {
    const directImpact = this.getDependents(changedPatternId);
    const transitiveImpact = this.getTransitiveDependents(changedPatternId);

    return {
      changedPattern: changedPatternId,
      directlyAffected: directImpact,
      transitivelyAffected: transitiveImpact.filter(p => !directImpact.includes(p)),
      totalAffected: new Set([...directImpact, ...transitiveImpact]).size,
      riskLevel: transitiveImpact.length > 5 ? 'high' : transitiveImpact.length > 0 ? 'medium' : 'low'
    };
  }

  getComplexityMetrics() {
    const metrics = {};

    this.patterns.forEach((pattern, patternId) => {
      const deps = this.getDependencies(patternId);
      const dependents = this.getDependents(patternId);

      metrics[patternId] = {
        inDegree: deps.length,
        outDegree: dependents.length,
        totalDegree: deps.length + dependents.length,
        criticality: Math.min(dependents.length * 0.6 + deps.length * 0.4, 100)
      };
    });

    return metrics;
  }

  identifyHubPatterns(threshold = 5) {
    const metrics = this.getComplexityMetrics();
    return Object.entries(metrics)
      .filter(([_, m]) => m.totalDegree >= threshold)
      .sort((a, b) => b[1].totalDegree - a[1].totalDegree)
      .map(([id, m]) => ({ id, ...m }));
  }

  identifyLeafPatterns() {
    const metrics = this.getComplexityMetrics();
    return Object.entries(metrics)
      .filter(([_, m]) => m.outDegree === 0)
      .map(([id, m]) => ({ id, ...m }));
  }

  identifyBottlenecks() {
    const metrics = this.getComplexityMetrics();
    return Object.entries(metrics)
      .filter(([_, m]) => m.inDegree > 3 && m.outDegree === 0)
      .sort((a, b) => b[1].inDegree - a[1].inDegree)
      .map(([id, m]) => ({ id, dependencyCount: m.inDegree, ...m }));
  }

  buildAdjacencyMatrix() {
    const patternIds = Array.from(this.patterns.keys()).sort();
    const matrix = {};

    patternIds.forEach(id => {
      matrix[id] = {};
      patternIds.forEach(otherId => {
        matrix[id][otherId] = this.graph.get(id)?.has(otherId) ? 1 : 0;
      });
    });

    return matrix;
  }

  buildVisualizationData() {
    const nodes = [];
    const edges = [];
    const metrics = this.getComplexityMetrics();

    this.patterns.forEach((pattern, patternId) => {
      const m = metrics[patternId];
      nodes.push({
        id: patternId,
        label: patternId,
        size: Math.max(20, Math.min(80, 20 + m.totalDegree * 5)),
        color: this.getNodeColor(m.criticality),
        degree: m.totalDegree,
        criticality: m.criticality
      });
    });

    this.graph.forEach((deps, patternId) => {
      deps.forEach((_, depId) => {
        edges.push({
          from: patternId,
          to: depId,
          type: 'dependency',
          weight: 1
        });
      });
    });

    return { nodes, edges };
  }

  getNodeColor(criticality) {
    if (criticality > 80) return '#dc3545';
    if (criticality > 60) return '#f59e0b';
    if (criticality > 40) return '#3b82f6';
    return '#10b981';
  }

  generateReport() {
    const metrics = this.getComplexityMetrics();
    const cycles = this.findCycles();
    const hubs = this.identifyHubPatterns();
    const bottlenecks = this.identifyBottlenecks();
    const leafPatterns = this.identifyLeafPatterns();

    return {
      totalPatterns: this.patterns.size,
      totalDependencies: Array.from(this.graph.values()).reduce((sum, deps) => sum + deps.size, 0),
      metrics,
      cycles,
      hubs,
      bottlenecks,
      leafPatterns,
      averageDependencies: Array.from(metrics.values()).reduce((sum, m) => sum + m.inDegree, 0) / this.patterns.size,
      healthStatus: cycles.length > 0 ? 'warning' : 'healthy'
    };
  }

  buildTextVisualization() {
    const hubs = this.identifyHubPatterns();
    const lines = ['=== Dependency Graph Report ===\n'];

    lines.push(`Total Patterns: ${this.patterns.size}`);
    lines.push(`Total Dependencies: ${Array.from(this.graph.values()).reduce((sum, deps) => sum + deps.size, 0)}\n`);

    if (hubs.length > 0) {
      lines.push('=== Hub Patterns (highly connected) ===');
      hubs.forEach(h => {
        lines.push(`${h.id}: ${h.inDegree} dependencies, ${h.outDegree} dependents`);
      });
    }

    const cycles = this.findCycles();
    if (cycles.length > 0) {
      lines.push('\n⚠️  === Circular Dependencies Found ===');
      cycles.forEach(cycle => {
        lines.push(`Cycle: ${cycle.join(' → ')}`);
      });
    }

    const bottlenecks = this.identifyBottlenecks();
    if (bottlenecks.length > 0) {
      lines.push('\n📌 === Bottleneck Patterns ===');
      bottlenecks.forEach(b => {
        lines.push(`${b.id}: depended on by ${b.dependencyCount} patterns`);
      });
    }

    return lines.join('\n');
  }

  exportGraphData() {
    return {
      patterns: Array.from(this.patterns.entries()).map(([id, p]) => ({
        id,
        dependencies: this.getDependencies(id),
        dependents: this.getDependents(id)
      })),
      visualization: this.buildVisualizationData(),
      report: this.generateReport(),
      exportedAt: new Date().toISOString()
    };
  }
}

function createPatternDependencyGraph() {
  return new PatternDependencyGraph();
}

export { PatternDependencyGraph, createPatternDependencyGraph };
