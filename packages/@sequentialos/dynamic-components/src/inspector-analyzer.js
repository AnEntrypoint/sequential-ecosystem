// Component analysis and hierarchy building
export class InspectorAnalyzer {
  constructor() {
    this.hierarchy = [];
  }

  analyze(componentDef) {
    this.hierarchy = [];
    this.analyzeComponent(componentDef);
    return this.hierarchy;
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
}
