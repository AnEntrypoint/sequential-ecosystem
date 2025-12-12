// Interactive layout builders (accordion, tabs, breadcrumbs)
export class InteractiveLayoutBuilders {
  constructor(theme) {
    this.theme = theme;
  }

  createAccordion(options = {}) {
    return {
      type: 'flex',
      direction: 'column',
      gap: this.theme.getSpacing('xs'),
      children: (options.items || []).map(item => ({
        type: 'expandable-section',
        title: item.title,
        children: item.children || [],
        defaultOpen: item.defaultOpen || false
      }))
    };
  }

  createTabs(options = {}) {
    const { tabs = [], gap = 'xs' } = options;
    const borderColor = this.theme.getColor('border');
    const themeGapSm = this.theme.getSpacing('sm');
    const themeGapMd = this.theme.getSpacing('md');

    return {
      type: 'flex',
      direction: 'column',
      children: [
        {
          type: 'flex',
          direction: 'row',
          gap: this.theme.getSpacing(gap),
          style: {
            borderBottom: `1px solid ${borderColor}`,
            paddingBottom: themeGapSm
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
          style: { padding: themeGapMd },
          children: tabs[options.activeTab || 0]?.children || []
        }
      ]
    };
  }

  createBreadcrumbs(options = {}) {
    const { items = [] } = options;
    const textMutedColor = this.theme.getColor('textMuted');

    return {
      type: 'flex',
      direction: 'row',
      gap: this.theme.getSpacing('xs'),
      children: items.flatMap((item, idx, arr) => {
        const components = [
          {
            type: 'button',
            label: item.label,
            variant: 'outline',
            onClick: item.onClick,
            style: { textDecoration: 'none' }
          }
        ];

        if (idx < arr.length - 1) {
          components.push({
            type: 'paragraph',
            content: '›',
            style: { color: textMutedColor, margin: 0 }
          });
        }

        return components;
      })
    };
  }
}
