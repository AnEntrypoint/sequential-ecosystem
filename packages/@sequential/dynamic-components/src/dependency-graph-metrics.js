// Graph analysis and metrics
export class DependencyGraphMetrics {
  getComplexityMetrics(core) {
    const metrics = {};

    core.patterns.forEach((pattern, patternId) => {
      const deps = core.getDependencies(patternId);
      const dependents = core.getDependents(patternId);

      metrics[patternId] = {
        inDegree: deps.length,
        outDegree: dependents.length,
        totalDegree: deps.length + dependents.length,
        criticality: Math.min(dependents.length * 0.6 + deps.length * 0.4, 100)
      };
    });

    return metrics;
  }

  identifyHubPatterns(core, threshold = 5) {
    const metrics = this.getComplexityMetrics(core);
    return Object.entries(metrics)
      .filter(([_, m]) => m.totalDegree >= threshold)
      .sort((a, b) => b[1].totalDegree - a[1].totalDegree)
      .map(([id, m]) => ({ id, ...m }));
  }

  identifyLeafPatterns(core) {
    const metrics = this.getComplexityMetrics(core);
    return Object.entries(metrics)
      .filter(([_, m]) => m.outDegree === 0)
      .map(([id, m]) => ({ id, ...m }));
  }

  identifyBottlenecks(core) {
    const metrics = this.getComplexityMetrics(core);
    return Object.entries(metrics)
      .filter(([_, m]) => m.inDegree > 3 && m.outDegree === 0)
      .sort((a, b) => b[1].inDegree - a[1].inDegree)
      .map(([id, m]) => ({ id, dependencyCount: m.inDegree, ...m }));
  }

  getImpactAnalysis(changedPatternId, core, traversal) {
    const directImpact = core.getDependents(changedPatternId);
    const transitiveImpact = traversal.getTransitiveDependents(changedPatternId, core);

    return {
      changedPattern: changedPatternId,
      directlyAffected: directImpact,
      transitivelyAffected: transitiveImpact.filter(p => !directImpact.includes(p)),
      totalAffected: new Set([...directImpact, ...transitiveImpact]).size,
      riskLevel: transitiveImpact.length > 5 ? 'high' : transitiveImpact.length > 0 ? 'medium' : 'low'
    };
  }

  getNodeColor(criticality) {
    if (criticality > 80) return '#dc3545';
    if (criticality > 60) return '#f59e0b';
    if (criticality > 40) return '#3b82f6';
    return '#10b981';
  }

  generateReport(core, traversal) {
    const metrics = this.getComplexityMetrics(core);
    const cycles = traversal.findCycles(core);
    const hubs = this.identifyHubPatterns(core);
    const bottlenecks = this.identifyBottlenecks(core);
    const leafPatterns = this.identifyLeafPatterns(core);

    return {
      totalPatterns: core.patterns.size,
      totalDependencies: Array.from(core.graph.values()).reduce((sum, deps) => sum + deps.size, 0),
      metrics,
      cycles,
      hubs,
      bottlenecks,
      leafPatterns,
      averageDependencies: Array.from(metrics.values()).reduce((sum, m) => sum + m.inDegree, 0) / core.patterns.size,
      healthStatus: cycles.length > 0 ? 'warning' : 'healthy'
    };
  }
}
