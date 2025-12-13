// Visualization and reporting
export class DependencyGraphVisualization {
  buildVisualizationData(core, metrics) {
    const nodes = [];
    const edges = [];

    core.patterns.forEach((pattern, patternId) => {
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

    core.graph.forEach((deps, patternId) => {
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

  buildTextVisualization(core, metrics, hubs, cycles, bottlenecks) {
    const lines = ['=== Dependency Graph Report ===\n'];

    lines.push(`Total Patterns: ${core.patterns.size}`);
    lines.push(`Total Dependencies: ${Array.from(core.graph.values()).reduce((sum, deps) => sum + deps.size, 0)}\n`);

    if (hubs.length > 0) {
      lines.push('=== Hub Patterns (highly connected) ===');
      hubs.forEach(h => {
        lines.push(`${h.id}: ${h.inDegree} dependencies, ${h.outDegree} dependents`);
      });
    }

    if (cycles.length > 0) {
      lines.push('\n⚠️  === Circular Dependencies Found ===');
      cycles.forEach(cycle => {
        lines.push(`Cycle: ${cycle.join(' → ')}`);
      });
    }

    if (bottlenecks.length > 0) {
      lines.push('\n📌 === Bottleneck Patterns ===');
      bottlenecks.forEach(b => {
        lines.push(`${b.id}: depended on by ${b.dependencyCount} patterns`);
      });
    }

    return lines.join('\n');
  }
}
