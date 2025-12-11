// Responsive UI component builders for preview and editing
export class ResponsiveUIBuilders {
  constructor(rps, registry) {
    this.rps = rps;
    this.registry = registry;
  }

  buildResponsiveStack(componentName, stackConfig = {}) {
    const defaultConfig = {
      xs: { direction: 'column', gap: '8px' },
      sm: { direction: 'column', gap: '12px' },
      md: { direction: 'row', gap: '16px' },
      lg: { direction: 'row', gap: '20px' }
    };

    const config = { ...defaultConfig, ...stackConfig };
    const component = this.registry.componentDefinitions.get(componentName);
    if (!component) return null;

    const container = {
      type: 'box',
      style: {
        display: 'flex',
        flexDirection: config.xs.direction,
        gap: config.xs.gap
      },
      children: [component.base]
    };

    return container;
  }

  buildBreakpointPreview() {
    const breakpoints = this.rps.getBreakpoints();
    const current = this.rps.getCurrentBreakpoint();

    return {
      type: 'box',
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        padding: '16px',
        backgroundColor: '#f5f5f5',
        borderRadius: '6px'
      },
      children: [
        {
          type: 'heading',
          content: `Current Breakpoint: ${current}`,
          level: 4,
          style: { margin: 0, fontSize: '14px', fontWeight: 600 }
        },
        {
          type: 'box',
          style: {
            display: 'flex',
            gap: '8px',
            flexWrap: 'wrap'
          },
          children: Object.entries(breakpoints).map(([name, px]) => ({
            type: 'box',
            style: {
              padding: '6px 12px',
              backgroundColor: current === name ? '#667eea' : '#ddd',
              color: current === name ? '#fff' : '#333',
              borderRadius: '4px',
              fontSize: '12px',
              fontWeight: current === name ? 600 : 400
            },
            children: [{
              type: 'text',
              content: `${name} (${px}px)`
            }]
          }))
        }
      ]
    };
  }

  buildBreakpointEditor(componentName) {
    const component = this.registry.componentDefinitions.get(componentName);
    if (!component) return null;

    const breakpoints = this.rps.getBreakpoints();

    return {
      type: 'box',
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        padding: '16px',
        backgroundColor: '#f9f9f9',
        borderRadius: '6px'
      },
      children: [
        {
          type: 'heading',
          content: `Edit ${componentName}`,
          level: 4,
          style: { margin: 0, fontSize: '14px', fontWeight: 600 }
        },
        {
          type: 'box',
          style: {
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          },
          children: Object.keys(breakpoints).map(bp => ({
            type: 'box',
            style: {
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              padding: '12px',
              backgroundColor: '#fff',
              border: '1px solid #ddd',
              borderRadius: '4px'
            },
            children: [
              {
                type: 'heading',
                content: `${bp.toUpperCase()} (${breakpoints[bp]}px)`,
                level: 5,
                style: { margin: 0, fontSize: '12px', fontWeight: 600 }
              },
              {
                type: 'box',
                style: {
                  display: 'grid',
                  gridTemplateColumns: '120px 1fr',
                  gap: '8px',
                  fontSize: '12px'
                },
                children: [
                  { type: 'text', content: 'Property:', style: { fontWeight: 500 } },
                  { type: 'input', value: 'style.property', placeholder: 'e.g., padding', style: { padding: '4px 8px' } },
                  { type: 'text', content: 'Value:', style: { fontWeight: 500 } },
                  { type: 'input', value: '', placeholder: 'e.g., 16px', style: { padding: '4px 8px' } }
                ]
              }
            ]
          }))
        }
      ]
    };
  }

  buildResponsivePreview(componentName) {
    const component = this.registry.componentDefinitions.get(componentName);
    if (!component) return null;

    const breakpoints = this.rps.getBreakpoints();
    const breakpointNames = Object.keys(breakpoints).sort(
      (a, b) => breakpoints[a] - breakpoints[b]
    );

    return {
      type: 'box',
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      },
      children: breakpointNames.map(bp => ({
        type: 'box',
        style: {
          border: '1px solid #ddd',
          borderRadius: '4px',
          padding: '12px',
          backgroundColor: '#f9f9f9'
        },
        children: [
          {
            type: 'heading',
            content: `${bp} (${breakpoints[bp]}px)`,
            level: 5,
            style: {
              margin: '0 0 8px 0',
              fontSize: '12px',
              fontWeight: 600,
              color: '#666'
            }
          },
          {
            type: 'box',
            style: {
              ...this.registry.buildComponentForBreakpoint(componentName, bp)?.style,
              border: '1px dashed #ccc',
              padding: '16px',
              backgroundColor: '#fff',
              borderRadius: '4px',
              minHeight: '100px'
            },
            children: [this.registry.buildComponentForBreakpoint(componentName, bp)]
          }
        ]
      }))
    };
  }
}
