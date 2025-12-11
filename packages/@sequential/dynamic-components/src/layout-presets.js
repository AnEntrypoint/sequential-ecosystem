// Layout preset definitions and initialization
export class LayoutPresets {
  constructor() {
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

    this.presets.set(name, layout);
    return layout;
  }

  getLayout(layoutName) {
    return this.presets.get(layoutName);
  }

  getAllLayouts() {
    return Array.from(this.presets.entries()).map(([name, layout]) => ({
      name,
      type: layout.type,
      gap: layout.gap
    }));
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
}
