// Breakpoint property editor UI builder for responsive editing
export function buildBreakpointEditor(registry, rps, componentName) {
  const component = registry.componentDefinitions.get(componentName);
  if (!component) return null;

  const breakpoints = rps.getBreakpoints();

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
