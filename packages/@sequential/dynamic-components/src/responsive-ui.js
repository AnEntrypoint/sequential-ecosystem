// Responsive preview UI components
export class ResponsiveUI {
  constructor(viewport, optimizer) {
    this.viewport = viewport;
    this.optimizer = optimizer;
  }

  buildResponsivePreview(componentDef) {
    return {
      type: 'box',
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        padding: '16px',
        background: '#1e1e1e',
        borderRadius: '6px'
      },
      children: [
        {
          type: 'heading',
          content: '📱 Responsive Preview',
          level: 3,
          style: {
            margin: 0,
            fontSize: '12px',
            color: '#e0e0e0',
            textTransform: 'uppercase'
          }
        },
        this.buildViewportSelector(),
        this.buildResponsiveViewer(componentDef),
        this.buildBreakpointInfo()
      ]
    };
  }

  buildViewportSelector() {
    const viewports = [
      { name: 'iPhone SE', width: 375, height: 667 },
      { name: 'iPhone 13', width: 390, height: 844 },
      { name: 'iPad', width: 768, height: 1024 },
      { name: 'iPad Pro', width: 1024, height: 1366 },
      { name: 'Desktop', width: 1920, height: 1080 }
    ];

    return {
      type: 'box',
      style: {
        display: 'flex',
        gap: '8px',
        flexWrap: 'wrap',
        marginBottom: '8px'
      },
      children: viewports.map(vp => ({
        type: 'box',
        style: {
          padding: '6px 12px',
          background: '#2d2d30',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '10px',
          color: this.viewport.viewportWidth === vp.width ? '#667eea' : '#858585',
          border: this.viewport.viewportWidth === vp.width ? '1px solid #667eea' : '1px solid #3e3e42'
        },
        children: [{
          type: 'paragraph',
          content: `${vp.name} (${vp.width}x${vp.height})`,
          style: { margin: 0 }
        }]
      }))
    };
  }

  buildResponsiveViewer(componentDef) {
    const optimized = this.optimizer.optimizeForMobile(componentDef);

    return {
      type: 'box',
      style: {
        padding: '12px',
        background: '#2d2d30',
        borderRadius: '4px',
        border: '1px solid #3e3e42',
        maxHeight: '400px',
        overflow: 'auto',
        fontSize: '11px'
      },
      children: [optimized]
    };
  }

  buildBreakpointInfo() {
    const config = this.optimizer.getResponsiveLayoutConfig();

    return {
      type: 'box',
      style: {
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '8px'
      },
      children: [
        {
          type: 'box',
          style: { padding: '8px 12px', background: '#2d2d30', borderRadius: '4px' },
          children: [
            {
              type: 'paragraph',
              content: 'Breakpoint',
              style: { margin: 0, fontSize: '9px', color: '#858585' }
            },
            {
              type: 'heading',
              content: this.viewport.currentBreakpoint.toUpperCase(),
              level: 4,
              style: { margin: '4px 0 0 0', fontSize: '12px', color: '#667eea' }
            }
          ]
        },
        {
          type: 'box',
          style: { padding: '8px 12px', background: '#2d2d30', borderRadius: '4px' },
          children: [
            {
              type: 'paragraph',
              content: 'Viewport',
              style: { margin: 0, fontSize: '9px', color: '#858585' }
            },
            {
              type: 'heading',
              content: `${this.viewport.viewportWidth}x${this.viewport.viewportHeight}`,
              level: 4,
              style: { margin: '4px 0 0 0', fontSize: '11px', color: '#d4d4d4' }
            }
          ]
        },
        {
          type: 'box',
          style: { padding: '8px 12px', background: '#2d2d30', borderRadius: '4px' },
          children: [
            {
              type: 'paragraph',
              content: 'Columns',
              style: { margin: 0, fontSize: '9px', color: '#858585' }
            },
            {
              type: 'heading',
              content: config.columns.toString(),
              level: 4,
              style: { margin: '4px 0 0 0', fontSize: '12px', color: '#4ade80' }
            }
          ]
        }
      ]
    };
  }
}
