// Component complexity analysis
export class PerfComplexityAnalyzer {
  analyzeComponentComplexity(definition) {
    return {
      depth: this.getDepth(definition),
      width: this.getWidth(definition),
      nodeCount: this.countNodes(definition),
      hasEventHandlers: this.countEventHandlers(definition) > 0,
      eventHandlerCount: this.countEventHandlers(definition),
      isResponsive: this.isResponsive(definition)
    };
  }

  getDepth(definition, current = 0) {
    if (!definition || !definition.children) return current;

    const childDepths = definition.children
      .filter(c => c)
      .map(c => this.getDepth(c, current + 1));

    return Math.max(current, ...childDepths, 0);
  }

  getWidth(definition) {
    if (!definition) return 0;

    const childCount = definition.children?.length || 0;

    if (!definition.children) return Math.max(1, childCount);

    return Math.max(
      childCount,
      ...definition.children.map(c => this.getWidth(c))
    );
  }

  countNodes(definition) {
    if (!definition) return 0;

    let count = 1;

    if (definition.children) {
      definition.children.forEach(child => {
        count += this.countNodes(child);
      });
    }

    return count;
  }

  countEventHandlers(definition) {
    if (!definition) return 0;

    let count = 0;

    const eventProps = ['onClick', 'onChange', 'onSubmit', 'onFocus', 'onBlur'];
    eventProps.forEach(prop => {
      if (definition[prop]) count++;
    });

    if (definition.children) {
      definition.children.forEach(child => {
        count += this.countEventHandlers(child);
      });
    }

    return count;
  }

  isResponsive(definition) {
    if (!definition) return false;

    if (definition.responsiveStyles) return true;

    if (definition.children) {
      return definition.children.some(c => this.isResponsive(c));
    }

    return false;
  }
}
