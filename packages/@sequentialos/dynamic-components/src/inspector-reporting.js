// Inspection reporting and metrics
export class InspectorReporting {
  constructor(analyzer, a11y) {
    this.analyzer = analyzer;
    this.a11y = a11y;
    this.inspectedComponent = null;
  }

  getInspectionReport(component) {
    this.inspectedComponent = component;
    const hierarchy = this.analyzer.analyze(component);

    return {
      component: {
        id: component.id,
        type: component.type,
        depth: hierarchy[0]?.depth || 0
      },
      metrics: {
        totalNodes: hierarchy.length,
        maxDepth: Math.max(...hierarchy.map(h => h.depth)),
        styleProperties: Object.keys(component.style || {}).length,
        totalIssues: this.countIssuesBySeverity(hierarchy)
      },
      accessibility: this.a11y.getAccessibilityInfo(component),
      responsive: this.a11y.getResponsiveBehavior(component),
      dependencies: this.a11y.getDependencies(component),
      hierarchy: hierarchy.slice(0, 10),
      issues: hierarchy.flatMap(h => h.issues).slice(0, 10)
    };
  }

  countIssuesBySeverity(hierarchy) {
    const counts = { high: 0, medium: 0, low: 0 };

    hierarchy.forEach(h => {
      h.issues.forEach(issue => {
        counts[issue.severity]++;
      });
    });

    return counts;
  }

  exportReport() {
    if (!this.inspectedComponent) return null;

    const report = this.getInspectionReport(this.inspectedComponent);

    return {
      generated: new Date().toISOString(),
      component: this.inspectedComponent,
      report,
      hierarchy: this.analyzer.hierarchy
    };
  }
}
