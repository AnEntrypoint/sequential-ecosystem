// Pattern dependency graph facade - maintains 100% backward compatibility
import { DependencyGraphCore } from './dependency-graph-core.js';
import { DependencyGraphTraversal } from './dependency-graph-traversal.js';
import { DependencyGraphMetrics } from './dependency-graph-metrics.js';
import { DependencyGraphVisualization } from './dependency-graph-visualization.js';

class PatternDependencyGraph {
  constructor() {
    this.core = new DependencyGraphCore();
    this.traversal = new DependencyGraphTraversal();
    this.metrics = new DependencyGraphMetrics();
    this.visualization = new DependencyGraphVisualization();
  }

  get graph() {
    return this.core.graph;
  }

  get patterns() {
    return this.core.patterns;
  }

  registerPattern(patternId, definition, dependencies = []) {
    return this.core.registerPattern(patternId, definition, dependencies);
  }

  addDependency(patternId, dependencyId) {
    return this.core.addDependency(patternId, dependencyId);
  }

  removeDependency(patternId, dependencyId) {
    return this.core.removeDependency(patternId, dependencyId);
  }

  getDependencies(patternId) {
    return this.core.getDependencies(patternId);
  }

  getDependents(patternId) {
    return this.core.getDependents(patternId);
  }

  getTransitiveDependencies(patternId, visited = new Set()) {
    return this.traversal.getTransitiveDependencies(patternId, this.core, visited);
  }

  getTransitiveDependents(patternId, visited = new Set()) {
    return this.traversal.getTransitiveDependents(patternId, this.core, visited);
  }

  findCycles() {
    return this.traversal.findCycles(this.core);
  }

  getImpactAnalysis(changedPatternId) {
    return this.metrics.getImpactAnalysis(changedPatternId, this.core, this.traversal);
  }

  getComplexityMetrics() {
    return this.metrics.getComplexityMetrics(this.core);
  }

  identifyHubPatterns(threshold = 5) {
    return this.metrics.identifyHubPatterns(this.core, threshold);
  }

  identifyLeafPatterns() {
    return this.metrics.identifyLeafPatterns(this.core);
  }

  identifyBottlenecks() {
    return this.metrics.identifyBottlenecks(this.core);
  }

  buildAdjacencyMatrix() {
    return this.traversal.buildAdjacencyMatrix(this.core);
  }

  buildVisualizationData() {
    const metricsData = this.getComplexityMetrics();
    return this.visualization.buildVisualizationData(this.core, metricsData);
  }

  getNodeColor(criticality) {
    return this.visualization.getNodeColor(criticality);
  }

  generateReport() {
    return this.metrics.generateReport(this.core, this.traversal);
  }

  buildTextVisualization() {
    const metricsData = this.getComplexityMetrics();
    const hubs = this.identifyHubPatterns();
    const cycles = this.findCycles();
    const bottlenecks = this.identifyBottlenecks();

    return this.visualization.buildTextVisualization(
      this.core,
      metricsData,
      hubs,
      cycles,
      bottlenecks
    );
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
