// Basic layout builders (sidebar, multi-column grids)
export class BasicLayoutBuilders {
  constructor(theme) {
    this.theme = theme;
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
}
