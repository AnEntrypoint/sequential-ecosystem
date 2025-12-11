// Advanced layout builders (responsive grid, gallery, masonry, accordion, tabs, breadcrumbs)
export class LayoutAdvanced {
  constructor(theme) {
    this.theme = theme;
  }

  createResponsiveGrid(options = {}) {
    const { itemsPerRow = 3, gap = 'lg', mobile = 1, tablet = 2 } = options;

    return {
      type: 'grid',
      cols: `repeat(auto-fit, minmax(${100 / itemsPerRow}%, 1fr))`,
      gap: this.theme.getSpacing(gap),
      style: {
        '@media (max-width: 768px)': {
          gridTemplateColumns: `repeat(${tablet}, 1fr)`
        },
        '@media (max-width: 480px)': {
          gridTemplateColumns: `repeat(${mobile}, 1fr)`
        },
        ...options.style
      },
      children: options.children || []
    };
  }

  createGallery(options = {}) {
    const { columns = 3, gap = 'md', imageHeight = '250px' } = options;

    return {
      type: 'grid',
      cols: `repeat(${columns}, 1fr)`,
      gap: this.theme.getSpacing(gap),
      style: options.style,
      children: (options.items || []).map(item => ({
        type: 'flex',
        direction: 'column',
        style: {
          cursor: 'pointer',
          borderRadius: this.theme.getBorderRadius('md'),
          overflow: 'hidden',
          ...options.itemStyle
        },
        children: [
          {
            type: 'image',
            src: item.src,
            alt: item.alt || '',
            style: {
              width: '100%',
              height: imageHeight,
              objectFit: 'cover'
            }
          },
          {
            type: 'card',
            variant: 'flat',
            children: [
              {
                type: 'heading',
                content: item.title,
                level: 3,
                style: { margin: 0 }
              },
              item.description ? {
                type: 'paragraph',
                content: item.description,
                style: { color: this.theme.getColor('textMuted'), margin: 0 }
              } : null
            ].filter(Boolean)
          }
        ]
      }))
    };
  }

  createMasonry(options = {}) {
    const { columns = 3, gap = 'md' } = options;

    return {
      type: 'flex',
      style: {
        display: 'grid',
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap: this.theme.getSpacing(gap),
        gridAutoRows: 'masonry',
        ...options.style
      },
      children: options.children || []
    };
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

    return {
      type: 'flex',
      direction: 'column',
      children: [
        {
          type: 'flex',
          direction: 'row',
          gap: this.theme.getSpacing(gap),
          style: {
            borderBottom: `1px solid ${this.theme.getColor('border')}`,
            paddingBottom: this.theme.getSpacing('sm')
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
          style: { padding: this.theme.getSpacing('md') },
          children: tabs[options.activeTab || 0]?.children || []
        }
      ]
    };
  }

  createBreadcrumbs(options = {}) {
    const { items = [] } = options;

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
            style: { color: this.theme.getColor('textMuted'), margin: 0 }
          });
        }

        return components;
      })
    };
  }
}
