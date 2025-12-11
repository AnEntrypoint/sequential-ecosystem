export class CompositionLayout {
  constructor(core) {
    this.core = core;
  }

  buildComposition() {
    if (this.core.selectedPatterns.length === 0) {
      return {
        type: 'box',
        style: {
          padding: '20px',
          textAlign: 'center',
          backgroundColor: '#f9fafb',
          borderRadius: '6px',
          color: '#6b7280'
        },
        children: [{
          type: 'paragraph',
          content: 'No patterns selected. Add patterns to build composition.',
          style: { margin: 0 }
        }]
      };
    }

    const container = this.buildLayoutContainer();
    const children = this.core.selectedPatterns.map(p => this.buildPatternElement(p));

    return {
      ...container,
      children
    };
  }

  buildLayoutContainer() {
    switch (this.core.layoutMode) {
      case 'grid':
        return this.buildGridLayout();
      case 'flex':
        return this.buildFlexLayout();
      case 'stack':
        return this.buildStackLayout();
      case 'carousel':
        return this.buildCarouselLayout();
      default:
        return this.buildGridLayout();
    }
  }

  buildGridLayout() {
    return {
      type: 'grid',
      style: {
        display: 'grid',
        gridTemplateColumns: this.core.gridConfig.columns,
        gap: this.core.gridConfig.gap,
        autoFlow: this.core.gridConfig.autoFlow,
        width: '100%'
      }
    };
  }

  buildFlexLayout() {
    return {
      type: 'box',
      style: {
        display: 'flex',
        flexDirection: this.core.layoutConfig.direction,
        gap: this.core.layoutConfig.gap,
        alignItems: this.core.layoutConfig.alignItems,
        justifyContent: this.core.layoutConfig.justifyContent,
        width: '100%',
        flexWrap: 'wrap'
      }
    };
  }

  buildStackLayout() {
    return {
      type: 'box',
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: this.core.layoutConfig.gap,
        width: '100%'
      }
    };
  }

  buildCarouselLayout() {
    return {
      type: 'box',
      style: {
        display: 'flex',
        flexDirection: 'row',
        gap: this.core.layoutConfig.gap,
        overflowX: 'auto',
        width: '100%',
        scrollBehavior: 'smooth'
      }
    };
  }

  buildPatternElement(pattern) {
    const def = JSON.parse(JSON.stringify(pattern.definition));

    if (pattern.customizations && Object.keys(pattern.customizations).length > 0) {
      this.applyCustomizations(def, pattern.customizations);
    }

    return def;
  }

  applyCustomizations(element, customizations) {
    if (customizations.style) {
      element.style = { ...element.style, ...customizations.style };
    }

    if (customizations.props) {
      element.props = { ...element.props, ...customizations.props };
    }

    if (customizations.content) {
      element.content = customizations.content;
    }

    return element;
  }
}
