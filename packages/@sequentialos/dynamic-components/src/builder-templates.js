// Template registry and default templates for advanced builder
export class BuilderTemplates {
  constructor(themeEngine) {
    this.themeEngine = themeEngine;
    this.templates = new Map();
    this.registerDefaults();
  }

  registerDefaults() {
    this.registerTemplate('form', (fields, options = {}) => ({
      type: 'flex',
      direction: 'column',
      gap: options.gap || this.themeEngine.getSpacing('md'),
      style: {
        padding: options.padding || this.themeEngine.getSpacing('lg'),
        ...options.style
      },
      children: fields.map(field => this.buildFormField(field))
    }));

    this.registerTemplate('card-grid', (items, options = {}) => ({
      type: 'grid',
      cols: options.cols || 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: options.gap || this.themeEngine.getSpacing('lg'),
      style: { padding: options.padding || this.themeEngine.getSpacing('lg'), ...options.style },
      children: items.map(item => this.buildCard(item))
    }));

    this.registerTemplate('header-content-footer', (config) => ({
      type: 'flex',
      direction: 'column',
      style: { height: '100%' },
      children: [
        { type: 'section-header', ...config.header },
        { type: 'flex', direction: 'row', style: { flex: 1, overflow: 'auto' }, children: config.content },
        { type: 'card', ...config.footer }
      ]
    }));

    this.registerTemplate('sidebar-main', (config) => ({
      type: 'flex',
      direction: 'row',
      gap: '0',
      style: { height: '100%' },
      children: [
        {
          type: 'flex',
          direction: 'column',
          style: {
            width: config.sidebarWidth || '250px',
            borderRight: `1px solid ${this.themeEngine.getColor('border')}`,
            overflow: 'auto'
          },
          children: config.sidebar
        },
        {
          type: 'flex',
          direction: 'column',
          style: { flex: 1, overflow: 'auto' },
          children: config.main
        }
      ]
    }));

    this.registerTemplate('dashboard', (metrics, options = {}) => ({
      type: 'flex',
      direction: 'column',
      gap: this.themeEngine.getSpacing('lg'),
      children: [
        { type: 'section-header', title: options.title || 'Dashboard', variant: 'elevated' },
        {
          type: 'grid',
          cols: options.cols || 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: this.themeEngine.getSpacing('md'),
          children: metrics.map(m => ({
            type: 'metrics-card',
            label: m.label,
            value: m.value,
            unit: m.unit,
            style: { borderLeft: `4px solid ${this.themeEngine.getColor(m.color || 'primary')}` }
          }))
        }
      ]
    }));
  }

  registerTemplate(name, builder) {
    this.templates.set(name, builder);
    return this;
  }

  buildFormField(field) {
    const { label, type, required, placeholder, options, validation } = field;
    const baseStyle = { marginBottom: this.themeEngine.getSpacing('md') };

    return {
      type: 'flex',
      direction: 'column',
      gap: this.themeEngine.getSpacing('xs'),
      style: baseStyle,
      children: [
        {
          type: 'paragraph',
          content: `${label}${required ? ' *' : ''}`,
          style: { fontSize: '14px', fontWeight: '500', color: this.themeEngine.getColor('text') }
        },
        {
          type: 'input',
          type: type || 'text',
          placeholder,
          options,
          style: {
            width: '100%',
            padding: this.themeEngine.getSpacing('sm'),
            borderRadius: this.themeEngine.getBorderRadius('md'),
            border: `1px solid ${this.themeEngine.getColor('border')}`
          }
        },
        validation?.hint && {
          type: 'paragraph',
          content: validation.hint,
          style: { fontSize: '12px', color: this.themeEngine.getColor('textMuted') }
        }
      ].filter(Boolean)
    };
  }

  buildCard(item) {
    return {
      type: 'card',
      title: item.title,
      variant: item.variant || 'default',
      content: item.content,
      style: {
        height: item.height || 'auto',
        ...item.style
      }
    };
  }

  getTemplate(name) {
    return this.templates.get(name);
  }

  listTemplates() {
    return Array.from(this.templates.keys());
  }
}
