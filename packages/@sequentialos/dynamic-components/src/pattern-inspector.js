// Pattern inspector facade - maintains 100% backward compatibility
import { InspectorAnalyzer } from './inspector-analyzer.js';
import { InspectorAccessibility } from './inspector-accessibility.js';
import { InspectorReporting } from './inspector-reporting.js';
import { InspectorUI } from './inspector-ui.js';

class PatternInspector {
  constructor() {
    this.analyzer = new InspectorAnalyzer();
    this.a11y = new InspectorAccessibility();
    this.reporting = new InspectorReporting(this.analyzer, this.a11y);
    this.uiBuilder = new InspectorUI(this.reporting);

    // Expose for backward compatibility
    this.inspectedComponent = null;
    this.breakpoints = new Map();
    this.metrics = {};
    this.hierarchy = [];
    this.performance = {};
  }

  inspect(componentDef) {
    this.inspectedComponent = componentDef;
    this.hierarchy = this.analyzer.analyze(componentDef);
    return this.getInspectionReport();
  }

  analyzeComponent(component, depth = 0, parent = null) {
    return this.analyzer.analyzeComponent(component, depth, parent);
  }

  calculateSize(component) {
    return this.analyzer.calculateSize(component);
  }

  extractProperties(component) {
    return this.analyzer.extractProperties(component);
  }

  detectIssues(component) {
    return this.analyzer.detectIssues(component);
  }

  getAccessibilityInfo(component) {
    return this.a11y.getAccessibilityInfo(component);
  }

  estimateContrast(style) {
    return this.a11y.estimateContrast(style);
  }

  getLuminance(color) {
    return this.a11y.getLuminance(color);
  }

  getResponsiveBehavior(component) {
    return this.a11y.getResponsiveBehavior(component);
  }

  getDependencies(component) {
    return this.a11y.getDependencies(component);
  }

  getInspectionReport() {
    if (!this.inspectedComponent) return null;
    return this.reporting.getInspectionReport(this.inspectedComponent);
  }

  countIssuesBySeverity() {
    return this.reporting.countIssuesBySeverity(this.hierarchy);
  }

  buildInspectorUI() {
    return this.uiBuilder.buildInspectorUI(this.inspectedComponent);
  }

  buildMetricsPanel(metrics) {
    return this.uiBuilder.buildMetricsPanel(metrics);
  }

  buildMetricCard(label, value) {
    return this.uiBuilder.buildMetricCard(label, value);
  }

  buildAccessibilityPanel(a11y) {
    return this.uiBuilder.buildAccessibilityPanel(a11y);
  }

  buildIssuesPanel(issues) {
    return this.uiBuilder.buildIssuesPanel(issues);
  }

  exportReport() {
    return this.reporting.exportReport();
  }
}

function createPatternInspector() {
  return new PatternInspector();
}

export { PatternInspector, createPatternInspector };
