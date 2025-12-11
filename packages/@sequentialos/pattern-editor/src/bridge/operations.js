export class ComponentOperations {
  constructor(patternBridge) {
    this.patternBridge = patternBridge;
  }

  exportToFramework(componentId, framework = 'react', options = {}) {
    const exporter = this.patternBridge.patternSystems.get('exporter');
    if (!exporter) return null;

    const component = this.patternBridge.componentTree.components.find(c => c.id === componentId);
    if (!component) return null;

    return exporter.export({
      type: component.type,
      style: component.style,
      props: component.props,
      children: component.children
    }, framework, { componentName: component.name, ...options });
  }

  applyAnimation(componentId, animationName, options = {}) {
    const animator = this.patternBridge.patternSystems.get('animator');
    if (!animator) return false;

    const component = this.patternBridge.componentTree.components.find(c => c.id === componentId);
    if (!component) return false;

    const animated = animator.applyAnimation({
      type: component.type,
      style: component.style,
      props: component.props,
      children: component.children
    }, animationName, options);

    this.patternBridge.componentTree.updateComponent(componentId, {
      style: animated.style,
      animations: animated.animations
    });

    this.patternBridge.liveCanvas.render(this.patternBridge.componentTree.components);
    return true;
  }

  applyLayout(componentId, layoutName) {
    const layouter = this.patternBridge.patternSystems.get('layouter');
    if (!layouter) return false;

    const component = this.patternBridge.componentTree.components.find(c => c.id === componentId);
    if (!component) return false;

    const styled = layouter.applyLayout({
      type: component.type,
      style: component.style,
      props: component.props,
      children: component.children
    }, layoutName);

    this.patternBridge.componentTree.updateComponent(componentId, {
      style: styled.style,
      layout: styled.layout
    });

    this.patternBridge.liveCanvas.render(this.patternBridge.componentTree.components);
    return true;
  }

  exportPatternComponentTree(componentId, format = 'json') {
    const component = this.patternBridge.componentTree.components.find(c => c.id === componentId);
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

    this.patternBridge.componentTree.addComponent(
      componentId,
      treeData.name,
      treeData.type,
      parentId
    );

    const component = this.patternBridge.componentTree.components.find(c => c.id === componentId);
    if (component) {
      component.pattern = treeData.pattern;
      component.style = { ...treeData.style };
      component.props = { ...treeData.props };
      component.children = treeData.children ? JSON.parse(JSON.stringify(treeData.children)) : [];
    }

    this.patternBridge.liveCanvas.render(this.patternBridge.componentTree.components);
    return componentId;
  }
}
