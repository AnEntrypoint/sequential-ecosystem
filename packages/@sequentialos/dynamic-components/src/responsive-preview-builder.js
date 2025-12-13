// Responsive preview UI builders for breakpoint visualization
export function buildBreakpointPreview(rps) {
  const breakpoints = rps.getBreakpoints();
  const current = rps.getCurrentBreakpoint();

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

export function buildResponsivePreview(registry, componentName) {
  const component = registry.componentDefinitions.get(componentName);
  if (!component) return null;

  const breakpoints = registry.rps.getBreakpoints();
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
            ...registry.buildComponentForBreakpoint(componentName, bp)?.style,
            border: '1px dashed #ccc',
            padding: '16px',
            backgroundColor: '#fff',
            borderRadius: '4px',
            minHeight: '100px'
          },
          children: [registry.buildComponentForBreakpoint(componentName, bp)]
        }
      ]
    }))
  };
}
