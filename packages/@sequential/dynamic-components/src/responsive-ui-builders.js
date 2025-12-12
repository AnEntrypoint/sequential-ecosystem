/**
 * responsive-ui-builders.js - Responsive UI component builders
 *
 * Build viewport selector and breakpoint info panels
 */

export class ViewportSelector {
  constructor(viewport) {
    this.viewport = viewport;
  }

  getViewports() {
    return [
      { name: 'iPhone SE', width: 375, height: 667 },
      { name: 'iPhone 13', width: 390, height: 844 },
      { name: 'iPad', width: 768, height: 1024 },
      { name: 'iPad Pro', width: 1024, height: 1366 },
      { name: 'Desktop', width: 1920, height: 1080 }
    ];
  }

  build() {
    const viewports = this.getViewports();

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
}

export class BreakpointInfo {
  constructor(viewport, config) {
    this.viewport = viewport;
    this.config = config;
  }

  build() {
    return {
      type: 'box',
      style: {
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '8px'
      },
      children: [
        this.buildBreakpointCard(),
        this.buildViewportCard(),
        this.buildColumnsCard()
      ]
    };
  }

  buildBreakpointCard() {
    return {
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
    };
  }

  buildViewportCard() {
    return {
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
    };
  }

  buildColumnsCard() {
    return {
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
          content: this.config.columns.toString(),
          level: 4,
          style: { margin: '4px 0 0 0', fontSize: '12px', color: '#4ade80' }
        }
      ]
    };
  }
}
