export class AdvancedComponentBuilder {
  constructor(registry, themeEngine) {
    this.registry = registry;
    this.themeEngine = themeEngine;
    this.templates = new Map();
    this.presets = new Map();
    this.layouts = new Map();
    this.registerDefaultTemplates();
    this.registerDefaultPresets();
  }

  registerDefaultTemplates() {
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

  registerDefaultPresets() {
    this.registerPreset('light', {
      background: this.themeEngine.getColor('background'),
      text: this.themeEngine.getColor('text'),
      border: this.themeEngine.getColor('border'),
      padding: this.themeEngine.getSpacing('lg')
    });

    this.registerPreset('dark', {
      background: '#1a1a1a',
      text: '#e0e0e0',
      border: '#3e3e42',
      padding: this.themeEngine.getSpacing('lg')
    });

    this.registerPreset('compact', {
      padding: this.themeEngine.getSpacing('sm'),
      gap: this.themeEngine.getSpacing('xs'),
      fontSize: '12px'
    });

    this.registerPreset('spacious', {
      padding: this.themeEngine.getSpacing('xl'),
      gap: this.themeEngine.getSpacing('lg'),
      fontSize: '16px'
    });
  }

  registerTemplate(name, builder) {
    this.templates.set(name, builder);
    return this;
  }

  registerPreset(name, config) {
    this.presets.set(name, config);
    return this;
  }

  registerLayout(name, layoutFn) {
    this.layouts.set(name, layoutFn);
    return this;
  }

  buildFormField(field) {
    const { label, type, required, placeholder, options, validation } = field;
    const baseStyle = {
      marginBottom: this.themeEngine.getSpacing('md')
    };

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

  buildFormFromTemplate(fields, templateName = 'form', options = {}) {
    const template = this.templates.get(templateName);
    if (!template) throw new Error(`Template ${templateName} not found`);
    return template(fields, options);
  }

  buildDashboardFromMetrics(metrics, options = {}) {
    const template = this.templates.get('dashboard');
    return template(metrics, options);
  }

  buildLayoutWithSidebar(sidebarContent, mainContent, options = {}) {
    const template = this.templates.get('sidebar-main');
    return template({
      sidebar: sidebarContent,
      main: mainContent,
      ...options
    });
  }

  applyPreset(component, presetName) {
    const preset = this.presets.get(presetName);
    if (!preset) throw new Error(`Preset ${presetName} not found`);

    return {
      ...component,
      style: {
        ...component.style,
        ...preset
      }
    };
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

  listTemplates() {
    return Array.from(this.templates.keys());
  }

  listPresets() {
    return Array.from(this.presets.keys());
  }

  getTemplate(name) {
    return this.templates.get(name);
  }

  getPreset(name) {
    return this.presets.get(name);
  }
}

export const createAdvancedBuilder = (registry, themeEngine) => new AdvancedComponentBuilder(registry, themeEngine);
