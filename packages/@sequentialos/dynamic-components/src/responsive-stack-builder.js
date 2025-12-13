// Responsive stack component builder
export function buildResponsiveStack(rps, registry, componentName, stackConfig = {}) {
  const defaultConfig = {
    xs: { direction: 'column', gap: '8px' },
    sm: { direction: 'column', gap: '12px' },
    md: { direction: 'row', gap: '16px' },
    lg: { direction: 'row', gap: '20px' }
  };

  const config = { ...defaultConfig, ...stackConfig };
  const component = registry.componentDefinitions.get(componentName);
  if (!component) return null;

  return {
    type: 'box',
    style: {
      display: 'flex',
      flexDirection: config.xs.direction,
      gap: config.xs.gap
    },
    children: [component.base]
  };
}
