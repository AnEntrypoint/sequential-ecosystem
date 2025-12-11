// Composite layout builders (header, footer, section, card, page layout)
export class CompositeLayoutBuilders {
  constructor(theme) {
    this.theme = theme;
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
            options.sidebar ? {
              type: 'flex',
              direction: 'column',
              style: {
                width: options.sidebarWidth || '250px',
                borderRight: `1px solid ${this.theme.getColor('border')}`,
                overflowY: 'auto',
                ...options.sidebar.style
              },
              children: options.sidebar.children || []
            } : null,
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
}
