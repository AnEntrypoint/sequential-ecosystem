// Component builders for common UI patterns
export class BuilderComponents {
  constructor(themeEngine) {
    this.themeEngine = themeEngine;
  }

  buildResponsiveGrid(items, options = {}) {
    const breakpoints = options.breakpoints || {
      mobile: 'repeat(1, 1fr)',
      tablet: 'repeat(2, 1fr)',
      desktop: 'repeat(3, 1fr)'
    };

    return {
      type: 'grid',
      cols: breakpoints.desktop,
      gap: options.gap || this.themeEngine.getSpacing('lg'),
      style: {
        '@media (max-width: 768px)': { gridTemplateColumns: breakpoints.tablet },
        '@media (max-width: 480px)': { gridTemplateColumns: breakpoints.mobile },
        ...options.style
      },
      children: items
    };
  }

  buildModalOverlay(content, options = {}) {
    return {
      type: 'flex',
      direction: 'column',
      style: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        ...options.style
      },
      children: [
        {
          type: 'card',
          variant: 'elevated',
          style: {
            maxWidth: options.width || '500px',
            maxHeight: options.height || '80vh',
            overflow: 'auto',
            ...options.cardStyle
          },
          children: content
        }
      ]
    };
  }

  buildTabInterface(tabs, options = {}) {
    return {
      type: 'flex',
      direction: 'column',
      gap: '0',
      children: [
        {
          type: 'flex',
          direction: 'row',
          gap: this.themeEngine.getSpacing('xs'),
          style: {
            borderBottom: `1px solid ${this.themeEngine.getColor('border')}`,
            padding: this.themeEngine.getSpacing('md')
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
          style: { flex: 1, padding: this.themeEngine.getSpacing('lg') },
          children: tabs[options.activeTab || 0]?.content || []
        }
      ]
    };
  }

  buildDataTable(columns, rows, options = {}) {
    return {
      type: 'flex',
      direction: 'column',
      gap: '0',
      style: {
        border: `1px solid ${this.themeEngine.getColor('border')}`,
        borderRadius: this.themeEngine.getBorderRadius('md'),
        overflow: 'auto'
      },
      children: [
        {
          type: 'flex',
          direction: 'row',
          gap: '0',
          style: {
            background: this.themeEngine.getColor('backgroundLight'),
            borderBottom: `1px solid ${this.themeEngine.getColor('border')}`,
            fontWeight: '600'
          },
          children: columns.map(col => ({
            type: 'paragraph',
            content: col.label,
            style: {
              flex: col.flex || 1,
              padding: this.themeEngine.getSpacing('md'),
              borderRight: `1px solid ${this.themeEngine.getColor('borderLight')}`
            }
          }))
        },
        ...rows.map((row, idx) => ({
          type: 'flex',
          direction: 'row',
          gap: '0',
          style: {
            borderBottom: idx < rows.length - 1 ? `1px solid ${this.themeEngine.getColor('border')}` : 'none',
            background: idx % 2 === 0 ? 'transparent' : this.themeEngine.getColor('backgroundLight')
          },
          children: columns.map(col => ({
            type: 'paragraph',
            content: row[col.key] || '',
            style: {
              flex: col.flex || 1,
              padding: this.themeEngine.getSpacing('md'),
              borderRight: `1px solid ${this.themeEngine.getColor('borderLight')}`
            }
          }))
        }))
      ]
    };
  }

  buildSearchableList(items, options = {}) {
    return {
      type: 'flex',
      direction: 'column',
      gap: this.themeEngine.getSpacing('md'),
      children: [
        {
          type: 'input',
          placeholder: options.searchPlaceholder || 'Search...',
          inputType: 'text',
          onChange: options.onSearch,
          style: { width: '100%' }
        },
        {
          type: 'flex',
          direction: 'column',
          gap: this.themeEngine.getSpacing('sm'),
          children: items.map(item => ({
            type: 'card',
            variant: 'flat',
            content: item.label,
            style: {
              cursor: 'pointer',
              padding: this.themeEngine.getSpacing('md')
            }
          }))
        }
      ]
    };
  }

  buildNotification(message, type = 'info', options = {}) {
    const colorMap = {
      info: 'info',
      success: 'success',
      warning: 'warning',
      error: 'danger'
    };

    return {
      type: 'card',
      variant: 'elevated',
      style: {
        borderLeft: `4px solid ${this.themeEngine.getColor(colorMap[type])}`,
        background: this.themeEngine.getColor('backgroundLight'),
        padding: this.themeEngine.getSpacing('md'),
        ...options.style
      },
      children: [
        {
          type: 'paragraph',
          content: message,
          style: { color: this.themeEngine.getColor('text') }
        }
      ]
    };
  }
}
