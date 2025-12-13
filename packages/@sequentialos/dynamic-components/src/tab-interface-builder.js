// Tab interface builder with tab switching
export function buildTabInterface(themeEngine, tabs, options = {}) {
  return {
    type: 'flex',
    direction: 'column',
    gap: '0',
    children: [
      {
        type: 'flex',
        direction: 'row',
        gap: themeEngine.getSpacing('xs'),
        style: {
          borderBottom: `1px solid ${themeEngine.getColor('border')}`,
          padding: themeEngine.getSpacing('md')
        },
        children: tabs.map((tab, idx) => ({
          type: 'button',
          label: tab.label,
          variant: options.activeTab === idx ? 'primary' : 'outline',
          onClick: () => options.onTabChange?.(idx)
        }))
      },
      {
        type: 'flex',
        direction: 'column',
        style: { flex: 1, padding: themeEngine.getSpacing('lg') },
        children: tabs[options.activeTab || 0]?.content || []
      }
    ]
  };
}
