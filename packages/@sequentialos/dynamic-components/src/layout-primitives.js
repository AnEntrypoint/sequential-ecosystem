// Layout primitive builders (grid, flex, stack, aspect ratio, box, container, center)
export class LayoutPrimitives {
  constructor(theme) {
    this.theme = theme;
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
}
