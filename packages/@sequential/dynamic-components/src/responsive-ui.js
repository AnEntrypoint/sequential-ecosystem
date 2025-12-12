// Responsive preview UI components
import { ViewportSelector, BreakpointInfo } from './responsive-ui-builders.js';

export class ResponsiveUI {
  constructor(viewport, optimizer) {
    this.viewport = viewport;
    this.optimizer = optimizer;
    this.selectorBuilder = new ViewportSelector(viewport);
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
    return this.selectorBuilder.build();
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
    const infoBuilder = new BreakpointInfo(this.viewport, config);
    return infoBuilder.build();
  }
}
