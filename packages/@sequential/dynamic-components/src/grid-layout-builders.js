// Grid-based layout builders (responsive grid, gallery, masonry)
export class GridLayoutBuilders {
  constructor(theme) {
    this.theme = theme;
  }

  createResponsiveGrid(options = {}) {
    const { itemsPerRow = 3, gap = 'lg', mobile = 1, tablet = 2 } = options;
    const colSize = 100 / itemsPerRow;

    return {
      type: 'grid',
      cols: `repeat(auto-fit, minmax(${colSize}%, 1fr))`,
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
}
