export class LayoutSystem {
  constructor(themeEngine) {
    this.theme = themeEngine;
  }

  createGrid(options = {}) {
    const {
      cols = 'repeat(auto-fit, minmax(250px, 1fr))',
      gap = 'md',
      rows = null,
      autoFlow = 'dense'
    } = options;

    return {
      type: 'grid',
      cols,
      rows: rows || 'auto',
      gap: this.theme.getSpacing(gap),
      style: {
        gridAutoFlow: autoFlow,
        ...options.style
      },
      children: options.children || []
    };
  }

  createFlex(options = {}) {
    const {
      direction = 'row',
      gap = 'md',
      align = 'stretch',
      justify = 'flex-start',
      wrap = false
    } = options;

    return {
      type: 'flex',
      direction,
      gap: this.theme.getSpacing(gap),
      style: {
        alignItems: align,
        justifyContent: justify,
        flexWrap: wrap ? 'wrap' : 'nowrap',
        ...options.style
      },
      children: options.children || []
    };
  }

  createStack(options = {}) {
    const { gap = 'md', divider = false } = options;

    const layout = {
      type: 'flex',
      direction: 'column',
      gap: this.theme.getSpacing(gap),
      children: options.children || []
    };

    if (divider) {
      layout.children = layout.children.flatMap((child, idx, arr) => {
        const items = [child];
        if (idx < arr.length - 1) {
          items.push({
            type: 'divider',
            style: {
              borderTop: `1px solid ${this.theme.getColor('border')}`,
              margin: `${this.theme.getSpacing(gap)} 0`
            }
          });
        }
        return items;
      });
    }

    return layout;
  }

  createAspectRatio(options = {}) {
    const { ratio = '16/9', children = [] } = options;

    return {
      type: 'flex',
      style: {
        position: 'relative',
        paddingBottom: `calc(100% / (${ratio.split('/')[0]} / ${ratio.split('/')[1]}))`,
        overflow: 'hidden'
      },
      children: [
        {
          type: 'flex',
          style: {
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%'
          },
          children
        }
      ]
    };
  }

  createCenter(options = {}) {
    return {
      type: 'flex',
      direction: 'column',
      style: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        ...options.style
      },
      children: options.children || []
    };
  }

  createBox(options = {}) {
    const { padding = 'md', border = false, rounded = 'md' } = options;

    return {
      type: 'flex',
      style: {
        padding: this.theme.getSpacing(padding),
        border: border ? `1px solid ${this.theme.getColor('border')}` : 'none',
        borderRadius: this.theme.getBorderRadius(rounded),
        background: options.background || this.theme.getColor('background'),
        ...options.style
      },
      children: options.children || []
    };
  }

  createContainer(options = {}) {
    const { maxWidth = '1200px', centered = true } = options;

    return {
      type: 'flex',
      style: {
        maxWidth,
        margin: centered ? '0 auto' : 0,
        width: '100%',
        paddingLeft: this.theme.getSpacing('lg'),
        paddingRight: this.theme.getSpacing('lg'),
        ...options.style
      },
      children: options.children || []
    };
  }

  createSidebar(options = {}) {
    const { sidebarWidth = '300px', gap = 'lg', direction = 'row' } = options;

    if (direction === 'row') {
      return {
        type: 'flex',
        direction: 'row',
        gap: this.theme.getSpacing(gap),
        style: { height: '100%' },
        children: [
          {
            type: 'flex',
            direction: 'column',
            style: {
              width: sidebarWidth,
              borderRight: `1px solid ${this.theme.getColor('border')}`,
              overflowY: 'auto'
            },
            children: options.sidebar || []
          },
          {
            type: 'flex',
            direction: 'column',
            style: { flex: 1, overflowY: 'auto' },
            children: options.main || []
          }
        ]
      };
    }

    return {
      type: 'flex',
      direction: 'column',
      gap: this.theme.getSpacing(gap),
      children: [
        {
          type: 'flex',
          direction: 'row',
          style: { minHeight: sidebarWidth },
          children: options.sidebar || []
        },
        {
          type: 'flex',
          direction: 'column',
          style: { flex: 1 },
          children: options.main || []
        }
      ]
    };
  }

  createTwoColumn(options = {}) {
    const { leftWidth = '1fr', rightWidth = '1fr', gap = 'lg' } = options;

    return {
      type: 'grid',
      cols: `${leftWidth} ${rightWidth}`,
      gap: this.theme.getSpacing(gap),
      style: options.style,
      children: [
        {
          type: 'flex',
          direction: 'column',
          children: options.left || []
        },
        {
          type: 'flex',
          direction: 'column',
          children: options.right || []
        }
      ]
    };
  }

  createThreeColumn(options = {}) {
    const { gap = 'lg', cols = '1fr 2fr 1fr' } = options;

    return {
      type: 'grid',
      cols,
      gap: this.theme.getSpacing(gap),
      style: options.style,
      children: [
        {
          type: 'flex',
          direction: 'column',
          children: options.left || []
        },
        {
          type: 'flex',
          direction: 'column',
          children: options.center || []
        },
        {
          type: 'flex',
          direction: 'column',
          children: options.right || []
        }
      ]
    };
  }

  createHeader(options = {}) {
    const { height = '60px', sticky = false } = options;

    return {
      type: 'flex',
      direction: 'row',
      style: {
        height,
        background: this.theme.getColor('primary'),
        color: 'white',
        padding: `0 ${this.theme.getSpacing('lg')}`,
        alignItems: 'center',
        position: sticky ? 'sticky' : 'relative',
        top: sticky ? 0 : 'auto',
        zIndex: sticky ? 100 : 0,
        boxShadow: `0 2px 4px ${this.theme.getShadow('sm')}`,
        ...options.style
      },
      children: options.children || []
    };
  }

  createFooter(options = {}) {
    return {
      type: 'flex',
      direction: 'column',
      style: {
        background: this.theme.getColor('backgroundLight'),
        borderTop: `1px solid ${this.theme.getColor('border')}`,
        padding: this.theme.getSpacing('lg'),
        marginTop: this.theme.getSpacing('xl'),
        ...options.style
      },
      children: options.children || []
    };
  }

  createSection(options = {}) {
    const { title, subtitle, padding = 'lg' } = options;

    return {
      type: 'flex',
      direction: 'column',
      gap: this.theme.getSpacing('md'),
      style: {
        padding: this.theme.getSpacing(padding),
        ...options.style
      },
      children: [
        title ? {
          type: 'heading',
          content: title,
          level: options.headingLevel || 2,
          style: { margin: 0 }
        } : null,
        subtitle ? {
          type: 'paragraph',
          content: subtitle,
          style: { color: this.theme.getColor('textMuted'), margin: 0 }
        } : null,
        {
          type: 'flex',
          direction: 'column',
          gap: this.theme.getSpacing('md'),
          children: options.children || []
        }
      ].filter(Boolean)
    };
  }

  createCard(options = {}) {
    const { title, padding = 'lg', elevated = true } = options;

    return {
      type: 'card',
      title,
      variant: elevated ? 'elevated' : 'flat',
      style: {
        padding: this.theme.getSpacing(padding),
        ...options.style
      },
      children: options.children || []
    };
  }

  createPageLayout(options = {}) {
    return {
      type: 'flex',
      direction: 'column',
      style: { minHeight: '100vh', background: this.theme.getColor('background') },
      children: [
        this.createHeader(options.header),
        {
          type: 'flex',
          direction: 'row',
          style: { flex: 1 },
          children: [
            options.sidebar ? this.createBox({
              ...options.sidebar,
              style: {
                width: options.sidebarWidth || '250px',
                borderRight: `1px solid ${this.theme.getColor('border')}`,
                overflowY: 'auto',
                ...options.sidebar.style
              }
            }) : null,
            {
              type: 'flex',
              direction: 'column',
              style: { flex: 1, overflowY: 'auto' },
              children: options.children || []
            }
          ].filter(Boolean)
        },
        options.footer ? this.createFooter(options.footer) : null
      ].filter(Boolean)
    };
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

export const createLayoutSystem = (themeEngine) => new LayoutSystem(themeEngine);

export default LayoutSystem;
