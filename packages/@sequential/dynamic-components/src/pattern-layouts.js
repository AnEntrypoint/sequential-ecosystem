class PatternLayoutSystem {
  constructor() {
    this.layouts = new Map();
    this.presets = new Map();
    this.initializePresets();
  }

  initializePresets() {
    this.createLayout('grid-2col', {
      type: 'grid',
      columns: 2,
      gap: '16px',
      responsive: {
        md: { columns: 2 },
        sm: { columns: 1 },
        xs: { columns: 1 }
      }
    });

    this.createLayout('grid-3col', {
      type: 'grid',
      columns: 3,
      gap: '16px',
      responsive: {
        lg: { columns: 3 },
        md: { columns: 2 },
        sm: { columns: 1 }
      }
    });

    this.createLayout('flex-row', {
      type: 'flex',
      direction: 'row',
      gap: '12px',
      alignItems: 'center',
      justifyContent: 'flex-start',
      wrap: false
    });

    this.createLayout('flex-column', {
      type: 'flex',
      direction: 'column',
      gap: '12px',
      alignItems: 'stretch',
      justifyContent: 'flex-start',
      wrap: false
    });

    this.createLayout('flex-row-center', {
      type: 'flex',
      direction: 'row',
      gap: '12px',
      alignItems: 'center',
      justifyContent: 'center',
      wrap: true
    });

    this.createLayout('flex-column-center', {
      type: 'flex',
      direction: 'column',
      gap: '12px',
      alignItems: 'center',
      justifyContent: 'center',
      wrap: false
    });

    this.createLayout('sidebar-left', {
      type: 'grid',
      columns: 'auto 1fr',
      gap: '20px',
      areas: [
        ['sidebar', 'main']
      ]
    });

    this.createLayout('sidebar-right', {
      type: 'grid',
      columns: '1fr auto',
      gap: '20px',
      areas: [
        ['main', 'sidebar']
      ]
    });

    this.createLayout('card-grid', {
      type: 'grid',
      columns: 'repeat(auto-fit, minmax(280px, 1fr))',
      gap: '20px',
      autoFlow: 'row'
    });

    this.createLayout('hero', {
      type: 'flex',
      direction: 'column',
      gap: '20px',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '500px'
    });

    this.createLayout('header-footer', {
      type: 'grid',
      rows: 'auto 1fr auto',
      height: '100vh',
      areas: [
        ['header'],
        ['main'],
        ['footer']
      ]
    });
  }

  createLayout(name, config) {
    const layout = {
      name,
      type: config.type || 'flex',
      ...config,
      created: Date.now()
    };

    this.layouts.set(name, layout);
    this.presets.set(name, layout);
    return layout;
  }

  applyLayout(componentDef, layoutName) {
    const layout = this.presets.get(layoutName);
    if (!layout) return componentDef;

    const styled = JSON.parse(JSON.stringify(componentDef));

    if (!styled.style) {
      styled.style = {};
    }

    if (layout.type === 'grid') {
      Object.assign(styled.style, {
        display: 'grid',
        gridTemplateColumns: layout.columns,
        gridTemplateRows: layout.rows,
        gap: layout.gap,
        autoFlow: layout.autoFlow
      });

      if (layout.areas) {
        styled.style.gridTemplateAreas = layout.areas
          .map(area => `"${area.join(' ')}"`)
          .join(' ');
      }
    } else if (layout.type === 'flex') {
      Object.assign(styled.style, {
        display: 'flex',
        flexDirection: layout.direction,
        gap: layout.gap,
        alignItems: layout.alignItems,
        justifyContent: layout.justifyContent,
        flexWrap: layout.wrap ? 'wrap' : 'nowrap'
      });
    }

    if (layout.minHeight) {
      styled.style.minHeight = layout.minHeight;
    }

    if (layout.height) {
      styled.style.height = layout.height;
    }

    styled.layout = layoutName;
    return styled;
  }

  getResponsiveLayout(layoutName, breakpoint) {
    const layout = this.presets.get(layoutName);
    if (!layout || !layout.responsive) return layout;

    const responsive = layout.responsive[breakpoint] || {};
    return { ...layout, ...responsive };
  }

  createResponsiveLayout(configs) {
    const layout = {
      type: 'responsive',
      configs: configs,
      created: Date.now()
    };

    const uniqueName = `responsive-${Date.now()}`;
    this.layouts.set(uniqueName, layout);
    return { name: uniqueName, layout };
  }

  applyResponsiveLayout(componentDef, layoutName, currentBreakpoint) {
    const layout = this.presets.get(layoutName);
    if (!layout) return componentDef;

    if (layout.type === 'responsive') {
      const config = layout.configs[currentBreakpoint] || layout.configs.md;
      return this.applyLayout(componentDef, config.layout);
    }

    const responsive = this.getResponsiveLayout(layoutName, currentBreakpoint);
    return this.applyLayout(componentDef, layoutName);
  }

  buildLayoutPreview(layoutName) {
    const layout = this.presets.get(layoutName);
    if (!layout) return null;

    const items = [
      { id: '1', content: 'Item 1' },
      { id: '2', content: 'Item 2' },
      { id: '3', content: 'Item 3' }
    ];

    const style = this.getLayoutStyle(layout);

    return {
      type: 'box',
      style: {
        ...style,
        minHeight: '300px',
        background: '#2d2d30',
        borderRadius: '6px',
        border: '1px solid #3e3e42',
        padding: '12px'
      },
      children: items.map(item => ({
        type: 'box',
        style: {
          background: '#667eea',
          padding: '16px',
          borderRadius: '4px',
          color: '#fff',
          textAlign: 'center',
          minWidth: layout.type === 'flex' ? '80px' : 'auto'
        },
        children: [{
          type: 'paragraph',
          content: item.content,
          style: { margin: 0 }
        }]
      }))
    };
  }

  getLayoutStyle(layout) {
    const style = {};

    if (layout.type === 'grid') {
      style.display = 'grid';
      if (layout.columns) style.gridTemplateColumns = layout.columns;
      if (layout.rows) style.gridTemplateRows = layout.rows;
      if (layout.gap) style.gap = layout.gap;
    } else if (layout.type === 'flex') {
      style.display = 'flex';
      style.flexDirection = layout.direction || 'row';
      if (layout.gap) style.gap = layout.gap;
      if (layout.alignItems) style.alignItems = layout.alignItems;
      if (layout.justifyContent) style.justifyContent = layout.justifyContent;
    }

    return style;
  }

  buildLayoutSelector() {
    const layouts = Array.from(this.presets.keys());

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
          content: '📐 Layouts',
          level: 3,
          style: { margin: 0, fontSize: '12px', color: '#e0e0e0' }
        },
        {
          type: 'box',
          style: {
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '8px'
          },
          children: layouts.map(name => ({
            type: 'box',
            style: {
              padding: '8px 12px',
              background: '#2d2d30',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '10px',
              color: '#d4d4d4',
              border: '1px solid #3e3e42'
            },
            children: [{
              type: 'paragraph',
              content: name,
              style: { margin: 0, wordBreak: 'break-word' }
            }]
          }))
        }
      ]
    };
  }

  getLayoutInfo(layoutName) {
    const layout = this.presets.get(layoutName);
    if (!layout) return null;

    return {
      name: layoutName,
      type: layout.type,
      gap: layout.gap,
      columns: layout.columns,
      rows: layout.rows,
      alignItems: layout.alignItems,
      justifyContent: layout.justifyContent,
      responsive: !!layout.responsive
    };
  }

  getAllLayouts() {
    return Array.from(this.presets.entries()).map(([name, layout]) => ({
      name,
      type: layout.type,
      gap: layout.gap
    }));
  }

  exportLayouts() {
    return {
      layouts: this.getAllLayouts(),
      exportedAt: new Date().toISOString()
    };
  }
}

function createPatternLayoutSystem() {
  return new PatternLayoutSystem();
}

export { PatternLayoutSystem, createPatternLayoutSystem };
