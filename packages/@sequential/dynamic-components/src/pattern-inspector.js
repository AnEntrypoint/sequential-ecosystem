class PatternInspector {
  constructor() {
    this.inspectedComponent = null;
    this.breakpoints = new Map();
    this.metrics = {};
    this.hierarchy = [];
    this.performance = {};
  }

  inspect(componentDef) {
    this.inspectedComponent = componentDef;
    this.analyzeComponent(componentDef);
    return this.getInspectionReport();
  }

  analyzeComponent(component, depth = 0, parent = null) {
    const info = {
      id: component.id || `comp-${Date.now()}`,
      type: component.type,
      depth,
      parent,
      size: this.calculateSize(component),
      style: component.style || {},
      properties: this.extractProperties(component),
      children: component.children ? (Array.isArray(component.children) ? component.children.length : 1) : 0,
      content: component.content || component.label || null,
      issues: this.detectIssues(component)
    };

    this.hierarchy.push(info);

    if (component.children) {
      const children = Array.isArray(component.children) ? component.children : [component.children];
      children.forEach((child, idx) => {
        this.analyzeComponent(child, depth + 1, info.id);
      });
    }

    return info;
  }

  calculateSize(component) {
    const style = component.style || {};
    return {
      width: style.width || 'auto',
      height: style.height || 'auto',
      padding: style.padding || '0',
      margin: style.margin || '0'
    };
  }

  extractProperties(component) {
    const props = {};

    Object.keys(component).forEach(key => {
      if (!['id', 'type', 'style', 'children', 'content', 'label'].includes(key)) {
        props[key] = component[key];
      }
    });

    return props;
  }

  detectIssues(component) {
    const issues = [];

    if (!component.id && !component.type) {
      issues.push({ type: 'missing-identity', severity: 'high', message: 'Component has no id or type' });
    }

    if (!component.type) {
      issues.push({ type: 'missing-type', severity: 'high', message: 'Component type is required' });
    }

    const style = component.style || {};

    if (style.width && style.width.includes('px') && parseInt(style.width) < 20) {
      issues.push({ type: 'too-small', severity: 'medium', message: 'Width is too small (<20px)' });
    }

    if (component.content && typeof component.content === 'string' && component.content.length > 500) {
      issues.push({ type: 'long-content', severity: 'low', message: 'Content exceeds 500 characters' });
    }

    if (!style.color && component.content) {
      issues.push({ type: 'missing-color', severity: 'low', message: 'Text color not explicitly set' });
    }

    if (component.children && Array.isArray(component.children) && component.children.length > 50) {
      issues.push({ type: 'many-children', severity: 'high', message: 'Component has >50 children (performance concern)' });
    }

    return issues;
  }

  getAccessibilityInfo(component) {
    const a11y = {
      hasAriaLabel: !!component['aria-label'],
      hasAriaRole: !!component['aria-role'],
      hasTitle: !!component.title,
      hasAlt: !!component.alt,
      keyboardAccessible: !component.style?.pointerEvents || component.style.pointerEvents !== 'none',
      contrastRatio: this.estimateContrast(component.style),
      recommendations: []
    };

    if (!a11y.hasAriaLabel && !a11y.hasAriaRole) {
      a11y.recommendations.push('Add aria-label or aria-role for screen readers');
    }

    if (!a11y.keyboardAccessible) {
      a11y.recommendations.push('Component has pointer-events: none, consider keyboard navigation');
    }

    return a11y;
  }

  estimateContrast(style = {}) {
    const bgColor = style.background || style.backgroundColor || '#ffffff';
    const fgColor = style.color || '#000000';

    const bgLum = this.getLuminance(bgColor);
    const fgLum = this.getLuminance(fgColor);

    const lighter = Math.max(bgLum, fgLum);
    const darker = Math.min(bgLum, fgLum);

    return ((lighter + 0.05) / (darker + 0.05)).toFixed(2);
  }

  getLuminance(color) {
    if (color === 'transparent') return 0;

    const hex = color.replace('#', '');
    const rgb = parseInt(hex, 16);

    const r = (rgb >> 16) & 255;
    const g = (rgb >> 8) & 255;
    const b = rgb & 255;

    return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  }

  getResponsiveBehavior(component) {
    const style = component.style || {};

    return {
      hasFlexGrow: !!style.flexGrow,
      hasFlex: !!style.flex,
      hasMaxWidth: !!style.maxWidth,
      hasMediaQueries: !!style.mediaQueries,
      scalesWithViewport: !!style.width?.includes('%') || !!style.width?.includes('vw'),
      recommendations: []
    };
  }

  getDependencies(component) {
    const deps = {
      externalLibraries: [],
      patterns: [],
      fonts: [],
      icons: []
    };

    const content = JSON.stringify(component);

    if (content.includes('react')) {
      deps.externalLibraries.push('react');
    }
    if (content.includes('icon') || content.includes('Icon')) {
      deps.icons.push('icon-library');
    }

    return deps;
  }

  getInspectionReport() {
    const component = this.inspectedComponent;
    if (!component) return null;

    return {
      component: {
        id: component.id,
        type: component.type,
        depth: this.hierarchy[0]?.depth || 0
      },
      metrics: {
        totalNodes: this.hierarchy.length,
        maxDepth: Math.max(...this.hierarchy.map(h => h.depth)),
        styleProperties: Object.keys(component.style || {}).length,
        totalIssues: this.countIssuesBySeverity()
      },
      accessibility: this.getAccessibilityInfo(component),
      responsive: this.getResponsiveBehavior(component),
      dependencies: this.getDependencies(component),
      hierarchy: this.hierarchy.slice(0, 10),
      issues: this.hierarchy.flatMap(h => h.issues).slice(0, 10)
    };
  }

  countIssuesBySeverity() {
    const counts = { high: 0, medium: 0, low: 0 };

    this.hierarchy.forEach(h => {
      h.issues.forEach(issue => {
        counts[issue.severity]++;
      });
    });

    return counts;
  }

  buildInspectorUI() {
    if (!this.inspectedComponent) {
      return {
        type: 'box',
        style: { padding: '12px', background: '#1e1e1e', borderRadius: '6px' },
        children: [{
          type: 'paragraph',
          content: 'Select a component to inspect',
          style: { margin: 0, fontSize: '11px', color: '#858585' }
        }]
      };
    }

    const report = this.getInspectionReport();

    return {
      type: 'box',
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        padding: '12px',
        background: '#1e1e1e',
        borderRadius: '6px'
      },
      children: [
        {
          type: 'heading',
          content: '🔍 Component Inspector',
          level: 3,
          style: { margin: 0, fontSize: '12px', color: '#e0e0e0' }
        },
        this.buildMetricsPanel(report.metrics),
        this.buildAccessibilityPanel(report.accessibility),
        this.buildIssuesPanel(report.issues)
      ]
    };
  }

  buildMetricsPanel(metrics) {
    return {
      type: 'box',
      style: {
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '8px'
      },
      children: [
        this.buildMetricCard('Total Nodes', metrics.totalNodes),
        this.buildMetricCard('Max Depth', metrics.maxDepth),
        this.buildMetricCard('Styles', metrics.styleProperties)
      ]
    };
  }

  buildMetricCard(label, value) {
    return {
      type: 'box',
      style: { padding: '8px 12px', background: '#2d2d30', borderRadius: '4px' },
      children: [
        {
          type: 'paragraph',
          content: label,
          style: { margin: 0, fontSize: '9px', color: '#858585' }
        },
        {
          type: 'heading',
          content: String(value),
          level: 4,
          style: { margin: '4px 0 0 0', fontSize: '14px', color: '#667eea' }
        }
      ]
    };
  }

  buildAccessibilityPanel(a11y) {
    return {
      type: 'box',
      style: {
        padding: '8px 12px',
        background: '#2d2d30',
        borderRadius: '4px'
      },
      children: [
        {
          type: 'paragraph',
          content: `Contrast Ratio: ${a11y.contrastRatio}:1 ${parseFloat(a11y.contrastRatio) >= 4.5 ? '✓' : '✗'}`,
          style: { margin: 0, fontSize: '10px', color: '#d4d4d4' }
        }
      ]
    };
  }

  buildIssuesPanel(issues) {
    return {
      type: 'box',
      style: { display: 'flex', flexDirection: 'column', gap: '4px' },
      children: issues.slice(0, 3).map(issue => ({
        type: 'box',
        style: {
          padding: '6px 8px',
          background: '#3e3e42',
          borderLeft: `3px solid ${issue.severity === 'high' ? '#ef4444' : issue.severity === 'medium' ? '#f59e0b' : '#4ade80'}`,
          borderRadius: '3px'
        },
        children: [{
          type: 'paragraph',
          content: issue.message,
          style: { margin: 0, fontSize: '9px', color: '#d4d4d4' }
        }]
      }))
    };
  }

  exportReport() {
    return {
      generated: new Date().toISOString(),
      component: this.inspectedComponent,
      report: this.getInspectionReport(),
      hierarchy: this.hierarchy
    };
  }
}

function createPatternInspector() {
  return new PatternInspector();
}

export { PatternInspector, createPatternInspector };
