class PatternIntegrationBridge {
  constructor(componentTree, liveCanvas, propsInspector) {
    this.componentTree = componentTree;
    this.liveCanvas = liveCanvas;
    this.propsInspector = propsInspector;
    this.patternSystems = new Map();
    this.patternLibraries = new Map();
    this.patternMetadata = new Map();
    this.initializePatternSystems();
  }

  initializePatternSystems() {
    this.patternSystems.set('inspector', null);
    this.patternSystems.set('validator', null);
    this.patternSystems.set('preview', null);
    this.patternSystems.set('codegen', null);
    this.patternSystems.set('auditor', null);
    this.patternSystems.set('exporter', null);
    this.patternSystems.set('animator', null);
    this.patternSystems.set('layouter', null);
  }

  registerPatternSystem(name, system) {
    this.patternSystems.set(name, system);
    return this;
  }

  registerPatternLibrary(category, patterns) {
    this.patternLibraries.set(category, patterns);
    this.indexPatterns(category, patterns);
    return this;
  }

  indexPatterns(category, patterns) {
    patterns.forEach(pattern => {
      const key = `${category}:${pattern.id || pattern.name}`;
      this.patternMetadata.set(key, {
        category,
        pattern,
        indexed: Date.now()
      });
    });
  }

  insertPatternComponent(patternId, parentId = null) {
    const patternMeta = this.findPattern(patternId);
    if (!patternMeta) {
      console.error(`Pattern not found: ${patternId}`);
      return null;
    }

    const { pattern, category } = patternMeta;
    const componentId = `pattern-${patternId}-${Date.now()}`;

    const componentDef = {
      id: componentId,
      name: pattern.name || patternId,
      type: pattern.type || 'div',
      parentId: parentId || null,
      props: { ...pattern.props },
      style: { ...pattern.style },
      pattern: {
        id: patternId,
        category,
        version: pattern.version || '1.0.0'
      },
      children: pattern.children ? JSON.parse(JSON.stringify(pattern.children)) : []
    };

    this.componentTree.addComponent(
      componentDef.id,
      componentDef.name,
      componentDef.type,
      componentDef.parentId
    );

    const treeComponent = this.componentTree.components.find(c => c.id === componentId);
    if (treeComponent) {
      Object.assign(treeComponent, componentDef);
    }

    this.liveCanvas.render(this.componentTree.components);
    this.componentTree.selectComponent(componentId);

    return componentDef;
  }

  findPattern(patternId) {
    for (const [key, meta] of this.patternMetadata) {
      if (key.endsWith(`:${patternId}`) || meta.pattern.id === patternId) {
        return meta;
      }
    }
    return null;
  }

  validateComponentAgainstPattern(componentId) {
    const component = this.componentTree.components.find(c => c.id === componentId);
    if (!component || !component.pattern) {
      return { valid: true, issues: [] };
    }

    const validator = this.patternSystems.get('validator');
    if (!validator) {
      return { valid: true, issues: [] };
    }

    const issues = validator.validate({
      type: component.type,
      style: component.style,
      props: component.props,
      children: component.children
    });

    return {
      valid: issues.details.filter(i => !i.valid && i.severity === 'error').length === 0,
      issues: issues.details
    };
  }

  auditComponentAccessibility(componentId) {
    const component = this.componentTree.components.find(c => c.id === componentId);
    if (!component) return null;

    const auditor = this.patternSystems.get('auditor');
    if (!auditor) return null;

    const issues = auditor.audit({
      type: component.type,
      style: component.style,
      'aria-label': component.props?.['aria-label'],
      'aria-role': component.props?.['aria-role'],
      content: component.props?.content || component.children
    });

    return auditor.buildAuditReport(issues);
  }

  inspectComponent(componentId) {
    const component = this.componentTree.components.find(c => c.id === componentId);
    if (!component) return null;

    const inspector = this.patternSystems.get('inspector');
    if (!inspector) {
      return {
        component: { id: component.id, type: component.type },
        metrics: { totalNodes: 1, maxDepth: 0, styleProperties: Object.keys(component.style || {}).length },
        issues: []
      };
    }

    return inspector.inspect({
      id: component.id,
      type: component.type,
      style: component.style,
      props: component.props,
      children: component.children
    });
  }

  getComponentPreview(componentId) {
    const preview = this.patternSystems.get('preview');
    if (!preview) return null;

    const component = this.componentTree.components.find(c => c.id === componentId);
    if (!component) return null;

    preview.registerPreview({
      type: component.type,
      style: component.style,
      props: component.props,
      children: component.children
    });

    return preview.buildPreviewPanel();
  }

  generateCode(componentId, framework = 'react') {
    const codegen = this.patternSystems.get('codegen');
    if (!codegen) return null;

    const component = this.componentTree.components.find(c => c.id === componentId);
    if (!component) return null;

    return codegen.generate({
      type: component.type,
      style: component.style,
      props: component.props,
      children: component.children
    }, framework);
  }

  exportToFramework(componentId, framework = 'react', options = {}) {
    const exporter = this.patternSystems.get('exporter');
    if (!exporter) return null;

    const component = this.componentTree.components.find(c => c.id === componentId);
    if (!component) return null;

    return exporter.export({
      type: component.type,
      style: component.style,
      props: component.props,
      children: component.children
    }, framework, { componentName: component.name, ...options });
  }

  applyAnimation(componentId, animationName, options = {}) {
    const animator = this.patternSystems.get('animator');
    if (!animator) return false;

    const component = this.componentTree.components.find(c => c.id === componentId);
    if (!component) return false;

    const animated = animator.applyAnimation({
      type: component.type,
      style: component.style,
      props: component.props,
      children: component.children
    }, animationName, options);

    this.componentTree.updateComponent(componentId, {
      style: animated.style,
      animations: animated.animations
    });

    this.liveCanvas.render(this.componentTree.components);
    return true;
  }

  applyLayout(componentId, layoutName) {
    const layouter = this.patternSystems.get('layouter');
    if (!layouter) return false;

    const component = this.componentTree.components.find(c => c.id === componentId);
    if (!component) return false;

    const styled = layouter.applyLayout({
      type: component.type,
      style: component.style,
      props: component.props,
      children: component.children
    }, layoutName);

    this.componentTree.updateComponent(componentId, {
      style: styled.style,
      layout: styled.layout
    });

    this.liveCanvas.render(this.componentTree.components);
    return true;
  }

  buildPatternPalette(category = null) {
    const patterns = category
      ? this.patternLibraries.get(category) || []
      : Array.from(this.patternLibraries.values()).flat();

    return {
      type: 'box',
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        padding: '12px',
        background: '#1e1e1e',
        borderRadius: '6px',
        maxHeight: '400px',
        overflow: 'auto'
      },
      children: patterns.map(pattern => ({
        type: 'box',
        style: {
          padding: '8px 12px',
          background: '#2d2d30',
          borderRadius: '4px',
          cursor: 'pointer',
          border: '1px solid #3e3e42',
          transition: 'all 0.2s'
        },
        dataset: { patternId: pattern.id || pattern.name },
        children: [
          {
            type: 'paragraph',
            content: pattern.name,
            style: { margin: '0 0 4px 0', fontSize: '11px', fontWeight: 600, color: '#e0e0e0' }
          },
          {
            type: 'paragraph',
            content: pattern.description || '',
            style: { margin: 0, fontSize: '9px', color: '#858585' }
          }
        ]
      }))
    };
  }

  buildInspectorPanel(componentId) {
    const inspection = this.inspectComponent(componentId);
    const validation = this.validateComponentAgainstPattern(componentId);
    const audit = this.auditComponentAccessibility(componentId);

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
          content: '📊 Pattern Inspector',
          level: 3,
          style: { margin: 0, fontSize: '12px', color: '#e0e0e0' }
        },
        inspection ? {
          type: 'box',
          style: {
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '8px'
          },
          children: [
            this.buildMetricCard('Nodes', inspection.metrics?.totalNodes || 1),
            this.buildMetricCard('Depth', inspection.metrics?.maxDepth || 0),
            this.buildMetricCard('Styles', inspection.metrics?.styleProperties || 0)
          ]
        } : null,
        validation ? {
          type: 'box',
          style: {
            padding: '8px',
            background: validation.valid ? 'rgba(74, 222, 128, 0.1)' : 'rgba(239, 68, 68, 0.1)',
            borderLeft: `3px solid ${validation.valid ? '#4ade80' : '#ef4444'}`,
            borderRadius: '4px'
          },
          children: [{
            type: 'paragraph',
            content: `Validation: ${validation.valid ? 'Pass' : 'Fail'} (${validation.issues?.length || 0} issues)`,
            style: { margin: 0, fontSize: '10px', color: '#d4d4d4' }
          }]
        } : null,
        audit ? {
          type: 'box',
          style: {
            padding: '8px',
            background: 'rgba(59, 130, 246, 0.1)',
            borderLeft: '3px solid #3b82f6',
            borderRadius: '4px'
          },
          children: [{
            type: 'paragraph',
            content: `WCAG: ${audit.wcagLevel}`,
            style: { margin: 0, fontSize: '10px', color: '#d4d4d4' }
          }]
        } : null
      ].filter(Boolean)
    };
  }

  buildMetricCard(label, value) {
    return {
      type: 'box',
      style: {
        padding: '8px',
        background: '#2d2d30',
        borderRadius: '4px'
      },
      children: [
        {
          type: 'paragraph',
          content: label,
          style: { margin: 0, fontSize: '8px', color: '#858585' }
        },
        {
          type: 'heading',
          content: String(value),
          level: 4,
          style: { margin: '4px 0 0 0', fontSize: '12px', color: '#667eea', fontWeight: 600 }
        }
      ]
    };
  }

  getPatternCategories() {
    return Array.from(this.patternLibraries.keys());
  }

  getPatternsByCategory(category) {
    return this.patternLibraries.get(category) || [];
  }

  searchPatterns(query) {
    const results = [];

    for (const [key, meta] of this.patternMetadata) {
      const { pattern, category } = meta;
      const searchFields = [
        pattern.name,
        pattern.description,
        pattern.tags?.join(' '),
        category
      ].filter(Boolean).join(' ').toLowerCase();

      if (searchFields.includes(query.toLowerCase())) {
        results.push({ ...meta, key });
      }
    }

    return results;
  }

  exportPatternComponentTree(componentId, format = 'json') {
    const component = this.componentTree.components.find(c => c.id === componentId);
    if (!component) return null;

    const tree = {
      id: component.id,
      name: component.name,
      type: component.type,
      pattern: component.pattern,
      style: component.style,
      props: component.props,
      children: component.children,
      exportedAt: new Date().toISOString()
    };

    if (format === 'json') {
      return JSON.stringify(tree, null, 2);
    }

    return tree;
  }

  importPatternComponentTree(treeData, parentId = null) {
    if (typeof treeData === 'string') {
      treeData = JSON.parse(treeData);
    }

    const componentId = treeData.id || `imported-${Date.now()}`;

    this.componentTree.addComponent(
      componentId,
      treeData.name,
      treeData.type,
      parentId
    );

    const component = this.componentTree.components.find(c => c.id === componentId);
    if (component) {
      component.pattern = treeData.pattern;
      component.style = { ...treeData.style };
      component.props = { ...treeData.props };
      component.children = treeData.children ? JSON.parse(JSON.stringify(treeData.children)) : [];
    }

    this.liveCanvas.render(this.componentTree.components);
    return componentId;
  }

  getSummary() {
    return {
      totalPatterns: this.patternMetadata.size,
      categories: Array.from(this.patternLibraries.keys()),
      systems: Array.from(this.patternSystems.keys()).filter(name => this.patternSystems.get(name)),
      components: this.componentTree.components.length,
      patternsInUse: this.componentTree.components.filter(c => c.pattern).length
    };
  }
}

export { PatternIntegrationBridge };
