// Responsive grid builder with breakpoint support
export function buildResponsiveGrid(themeEngine, items, options = {}) {
  const breakpoints = options.breakpoints || {
    mobile: 'repeat(1, 1fr)',
    tablet: 'repeat(2, 1fr)',
    desktop: 'repeat(3, 1fr)'
  };

  return {
    type: 'grid',
    cols: breakpoints.desktop,
    gap: options.gap || themeEngine.getSpacing('lg'),
    style: {
      '@media (max-width: 768px)': { gridTemplateColumns: breakpoints.tablet },
      '@media (max-width: 480px)': { gridTemplateColumns: breakpoints.mobile },
      ...options.style
    },
    children: items
  };
}
