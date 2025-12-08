class UIToolkit {
  constructor(options = {}) {
    this.theme = options.theme || this.defaultTheme();
    this.components = new Map();
    this.patterns = new Map();
    this.initializeComponents();
  }

  defaultTheme() {
    return {
      colors: {
        primary: '#667eea',
        secondary: '#64748b',
        success: '#10b981',
        warning: '#f59e0b',
        danger: '#ef4444',
        info: '#3b82f6',
        bg: '#ffffff',
        bgSecondary: '#f9fafb',
        border: '#e5e7eb',
        text: '#1f2937',
        textSecondary: '#6b7280'
      },
      spacing: {
        xs: '4px',
        sm: '8px',
        md: '12px',
        lg: '16px',
        xl: '24px',
        xxl: '32px'
      },
      radius: {
        sm: '4px',
        md: '6px',
        lg: '8px',
        full: '9999px'
      },
      shadows: {
        sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
        xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
      }
    };
  }

  initializeComponents() {
    this.register('button', this.createButton.bind(this));
    this.register('card', this.createCard.bind(this));
    this.register('input', this.createInput.bind(this));
    this.register('select', this.createSelect.bind(this));
    this.register('checkbox', this.createCheckbox.bind(this));
    this.register('radio', this.createRadio.bind(this));
    this.register('badge', this.createBadge.bind(this));
    this.register('alert', this.createAlert.bind(this));
    this.register('modal', this.createModal.bind(this));
    this.register('tooltip', this.createTooltip.bind(this));
    this.register('tabs', this.createTabs.bind(this));
    this.register('accordion', this.createAccordion.bind(this));
    this.register('dropdown', this.createDropdown.bind(this));
    this.register('pagination', this.createPagination.bind(this));
    this.register('breadcrumb', this.createBreadcrumb.bind(this));
    this.register('progress', this.createProgress.bind(this));
    this.register('spinner', this.createSpinner.bind(this));
    this.register('avatar', this.createAvatar.bind(this));
    this.register('hero', this.createHero.bind(this));
    this.register('footer', this.createFooter.bind(this));
  }

  register(name, renderer) {
    this.components.set(name, renderer);
    return this;
  }

  createButton(options = {}) {
    const {
      content = 'Button',
      variant = 'primary',
      size = 'md',
      disabled = false,
      onClick = null
    } = options;

    const sizeMap = { sm: '6px 12px', md: '8px 16px', lg: '12px 24px' };
    const colorMap = {
      primary: this.theme.colors.primary,
      secondary: this.theme.colors.secondary,
      success: this.theme.colors.success,
      danger: this.theme.colors.danger
    };

    return {
      type: 'button',
      content,
      style: {
        padding: sizeMap[size],
        backgroundColor: colorMap[variant],
        color: '#ffffff',
        border: 'none',
        borderRadius: this.theme.radius.md,
        fontSize: '14px',
        fontWeight: 500,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.6 : 1,
        transition: 'opacity 0.2s'
      },
      onClick: disabled ? null : onClick
    };
  }

  createCard(options = {}) {
    const { title = null, content = null, children = [], footer = null } = options;

    return {
      type: 'box',
      style: {
        backgroundColor: this.theme.colors.bg,
        border: `1px solid ${this.theme.colors.border}`,
        borderRadius: this.theme.radius.lg,
        boxShadow: this.theme.shadows.md,
        padding: this.theme.spacing.lg,
        display: 'flex',
        flexDirection: 'column',
        gap: this.theme.spacing.md
      },
      children: [
        title ? { type: 'heading', content: title, level: 3, style: { margin: 0 } } : null,
        content ? { type: 'paragraph', content, style: { margin: 0, color: this.theme.colors.textSecondary } } : null,
        ...children,
        footer ? {
          type: 'box',
          style: {
            paddingTop: this.theme.spacing.md,
            borderTop: `1px solid ${this.theme.colors.border}`,
            display: 'flex',
            gap: this.theme.spacing.md'
          },
          children: Array.isArray(footer) ? footer : [footer]
        } : null
      ].filter(Boolean)
    };
  }

  createInput(options = {}) {
    const { placeholder = '', value = '', label = null, error = null, size = 'md' } = options;

    const sizeMap = { sm: '8px 8px', md: '8px 12px', lg: '12px 16px' };

    return {
      type: 'box',
      style: { display: 'flex', flexDirection: 'column', gap: this.theme.spacing.sm },
      children: [
        label ? {
          type: 'paragraph',
          content: label,
          style: { margin: 0, fontSize: '14px', fontWeight: 500, color: this.theme.colors.text }
        } : null,
        {
          type: 'input',
          placeholder,
          value,
          style: {
            padding: sizeMap[size],
            border: `1px solid ${error ? this.theme.colors.danger : this.theme.colors.border}`,
            borderRadius: this.theme.radius.md,
            fontSize: '14px',
            fontFamily: 'inherit'
          }
        },
        error ? {
          type: 'paragraph',
          content: error,
          style: { margin: 0, fontSize: '12px', color: this.theme.colors.danger }
        } : null
      ].filter(Boolean)
    };
  }

  createSelect(options = {}) {
    const { label = null, items = [], value = '', onChange = null } = options;

    return {
      type: 'box',
      style: { display: 'flex', flexDirection: 'column', gap: this.theme.spacing.sm },
      children: [
        label ? {
          type: 'paragraph',
          content: label,
          style: { margin: 0, fontSize: '14px', fontWeight: 500 }
        } : null,
        {
          type: 'select',
          value,
          options: items,
          style: {
            padding: this.theme.spacing.md,
            border: `1px solid ${this.theme.colors.border}`,
            borderRadius: this.theme.radius.md,
            fontSize: '14px'
          },
          onChange
        }
      ].filter(Boolean)
    };
  }

  createCheckbox(options = {}) {
    const { label = '', checked = false, onChange = null } = options;

    return {
      type: 'box',
      style: { display: 'flex', alignItems: 'center', gap: this.theme.spacing.sm, cursor: 'pointer' },
      children: [
        {
          type: 'input',
          type: 'checkbox',
          checked,
          onChange,
          style: { cursor: 'pointer' }
        },
        label ? { type: 'paragraph', content: label, style: { margin: 0, cursor: 'pointer' } } : null
      ].filter(Boolean)
    };
  }

  createRadio(options = {}) {
    const { label = '', name = '', value = '', checked = false, onChange = null } = options;

    return {
      type: 'box',
      style: { display: 'flex', alignItems: 'center', gap: this.theme.spacing.sm, cursor: 'pointer' },
      children: [
        {
          type: 'input',
          type: 'radio',
          name,
          value,
          checked,
          onChange,
          style: { cursor: 'pointer' }
        },
        label ? { type: 'paragraph', content: label, style: { margin: 0, cursor: 'pointer' } } : null
      ].filter(Boolean)
    };
  }

  createBadge(options = {}) {
    const { content = '', variant = 'primary', size = 'md' } = options;

    const sizeMap = { sm: '4px 8px', md: '6px 12px', lg: '8px 16px' };
    const colorMap = {
      primary: { bg: this.theme.colors.primary, text: '#fff' },
      secondary: { bg: this.theme.colors.secondary, text: '#fff' },
      success: { bg: this.theme.colors.success, text: '#fff' },
      danger: { bg: this.theme.colors.danger, text: '#fff' },
      warning: { bg: this.theme.colors.warning, text: '#fff' }
    };

    const colors = colorMap[variant];

    return {
      type: 'box',
      style: {
        display: 'inline-block',
        padding: sizeMap[size],
        backgroundColor: colors.bg,
        color: colors.text,
        borderRadius: this.theme.radius.full,
        fontSize: '12px',
        fontWeight: 600
      },
      children: [{ type: 'text', content }]
    };
  }

  createAlert(options = {}) {
    const { type = 'info', title = '', message = '', dismissible = false, onDismiss = null } = options;

    const colorMap = {
      success: this.theme.colors.success,
      danger: this.theme.colors.danger,
      warning: this.theme.colors.warning,
      info: this.theme.colors.info
    };

    return {
      type: 'box',
      style: {
        padding: this.theme.spacing.lg,
        backgroundColor: `${colorMap[type]}15`,
        border: `1px solid ${colorMap[type]}`,
        borderLeft: `4px solid ${colorMap[type]}`,
        borderRadius: this.theme.radius.md,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start'
      },
      children: [
        {
          type: 'box',
          style: { flex: 1 },
          children: [
            title ? { type: 'heading', content: title, level: 4, style: { margin: 0, color: colorMap[type] } } : null,
            message ? { type: 'paragraph', content: message, style: { margin: '4px 0 0 0' } } : null
          ].filter(Boolean)
        },
        dismissible ? {
          type: 'button',
          content: '×',
          style: { background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', padding: 0 },
          onClick: onDismiss
        } : null
      ].filter(Boolean)
    };
  }

  createModal(options = {}) {
    const { title = '', content = '', footer = null, onClose = null } = options;

    return {
      type: 'box',
      style: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      },
      children: [{
        type: 'box',
        style: {
          backgroundColor: this.theme.colors.bg,
          borderRadius: this.theme.radius.lg,
          boxShadow: this.theme.shadows.xl,
          padding: this.theme.spacing.xl,
          maxWidth: '500px',
          width: '90%'
        },
        children: [
          {
            type: 'box',
            style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: this.theme.spacing.lg },
            children: [
              title ? { type: 'heading', content: title, level: 3, style: { margin: 0 } } : null,
              {
                type: 'button',
                content: '×',
                style: { background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', padding: 0 },
                onClick: onClose
              }
            ].filter(Boolean)
          },
          content ? { type: 'paragraph', content, style: { margin: 0 } } : null,
          footer ? {
            type: 'box',
            style: {
              display: 'flex',
              gap: this.theme.spacing.md,
              marginTop: this.theme.spacing.lg,
              paddingTop: this.theme.spacing.lg,
              borderTop: `1px solid ${this.theme.colors.border}`
            },
            children: Array.isArray(footer) ? footer : [footer]
          } : null
        ].filter(Boolean)
      }]
    };
  }

  createTooltip(options = {}) {
    const { content = '', text = '' } = options;

    return {
      type: 'box',
      style: { position: 'relative', display: 'inline-block' },
      children: [
        content,
        {
          type: 'box',
          style: {
            position: 'absolute',
            backgroundColor: '#000',
            color: '#fff',
            padding: this.theme.spacing.sm,
            borderRadius: this.theme.radius.sm,
            fontSize: '12px',
            whiteSpace: 'nowrap',
            bottom: '125%',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 1000
          },
          children: [{ type: 'text', content: text }]
        }
      ]
    };
  }

  createTabs(options = {}) {
    const { tabs = [], activeTab = 0, onChange = null } = options;

    return {
      type: 'box',
      style: { display: 'flex', flexDirection: 'column' },
      children: [
        {
          type: 'box',
          style: {
            display: 'flex',
            borderBottom: `1px solid ${this.theme.colors.border}`,
            gap: 0
          },
          children: tabs.map((tab, idx) => ({
            type: 'button',
            content: tab.label,
            style: {
              padding: this.theme.spacing.md,
              backgroundColor: 'transparent',
              border: 'none',
              borderBottom: idx === activeTab ? `2px solid ${this.theme.colors.primary}` : 'none',
              color: idx === activeTab ? this.theme.colors.primary : this.theme.colors.textSecondary,
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: idx === activeTab ? 600 : 400
            },
            onClick: () => onChange?.(idx)
          }))
        },
        tabs[activeTab]?.content ? {
          type: 'box',
          style: { padding: this.theme.spacing.lg },
          children: [tabs[activeTab].content]
        } : null
      ].filter(Boolean)
    };
  }

  createAccordion(options = {}) {
    const { items = [], allowMultiple = false } = options;

    return {
      type: 'box',
      style: { display: 'flex', flexDirection: 'column', gap: this.theme.spacing.sm },
      children: items.map((item, idx) => ({
        type: 'box',
        style: {
          border: `1px solid ${this.theme.colors.border}`,
          borderRadius: this.theme.radius.md,
          overflow: 'hidden'
        },
        children: [
          {
            type: 'button',
            content: item.title,
            style: {
              width: '100%',
              padding: this.theme.spacing.lg,
              backgroundColor: this.theme.colors.bgSecondary,
              border: 'none',
              textAlign: 'left',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 500
            },
            onClick: () => item.onToggle?.(idx)
          },
          item.isOpen ? {
            type: 'box',
            style: { padding: this.theme.spacing.lg, borderTop: `1px solid ${this.theme.colors.border}` },
            children: [item.content]
          } : null
        ].filter(Boolean)
      }))
    };
  }

  createDropdown(options = {}) {
    const { label = '', items = [], onChange = null } = options;

    return {
      type: 'box',
      style: { position: 'relative', display: 'inline-block' },
      children: [
        { type: 'button', content: label, style: { padding: this.theme.spacing.md } },
        {
          type: 'box',
          style: {
            position: 'absolute',
            backgroundColor: this.theme.colors.bg,
            minWidth: '160px',
            boxShadow: this.theme.shadows.lg,
            borderRadius: this.theme.radius.md,
            top: '100%',
            left: 0,
            zIndex: 1
          },
          children: items.map(item => ({
            type: 'button',
            content: item.label,
            style: {
              width: '100%',
              padding: this.theme.spacing.md,
              border: 'none',
              background: 'none',
              textAlign: 'left',
              cursor: 'pointer',
              fontSize: '14px'
            },
            onClick: () => onChange?.(item.value)
          }))
        }
      ]
    };
  }

  createPagination(options = {}) {
    const { currentPage = 1, totalPages = 5, onChange = null } = options;

    return {
      type: 'box',
      style: { display: 'flex', gap: this.theme.spacing.sm, alignItems: 'center' },
      children: [
        ...Array.from({ length: totalPages }, (_, i) => ({
          type: 'button',
          content: String(i + 1),
          style: {
            padding: this.theme.spacing.sm,
            backgroundColor: i + 1 === currentPage ? this.theme.colors.primary : this.theme.colors.bgSecondary,
            color: i + 1 === currentPage ? '#fff' : this.theme.colors.text,
            border: 'none',
            borderRadius: this.theme.radius.md,
            cursor: 'pointer',
            fontSize: '14px',
            minWidth: '32px'
          },
          onClick: () => onChange?.(i + 1)
        }))
      ]
    };
  }

  createBreadcrumb(options = {}) {
    const { items = [] } = options;

    return {
      type: 'box',
      style: { display: 'flex', gap: this.theme.spacing.sm, alignItems: 'center' },
      children: items.flatMap((item, idx) => [
        {
          type: 'link',
          content: item.label,
          href: item.href || '#',
          style: { color: this.theme.colors.primary, textDecoration: 'none' }
        },
        idx < items.length - 1 ? { type: 'text', content: '/' } : null
      ]).filter(Boolean)
    };
  }

  createProgress(options = {}) {
    const { value = 0, max = 100, label = null } = options;

    const percent = Math.round((value / max) * 100);

    return {
      type: 'box',
      style: { display: 'flex', flexDirection: 'column', gap: this.theme.spacing.sm },
      children: [
        label ? { type: 'paragraph', content: `${label} (${percent}%)`, style: { margin: 0, fontSize: '12px' } } : null,
        {
          type: 'box',
          style: {
            width: '100%',
            height: '8px',
            backgroundColor: this.theme.colors.bgSecondary,
            borderRadius: this.theme.radius.full,
            overflow: 'hidden'
          },
          children: [{
            type: 'box',
            style: {
              width: `${percent}%`,
              height: '100%',
              backgroundColor: this.theme.colors.success,
              transition: 'width 0.3s ease'
            }
          }]
        }
      ].filter(Boolean)
    };
  }

  createSpinner(options = {}) {
    const { size = 'md' } = options;

    const sizeMap = { sm: '20px', md: '40px', lg: '60px' };

    return {
      type: 'box',
      style: {
        width: sizeMap[size],
        height: sizeMap[size],
        border: `4px solid ${this.theme.colors.bgSecondary}`,
        borderTop: `4px solid ${this.theme.colors.primary}`,
        borderRadius: this.theme.radius.full,
        animation: 'spin 0.8s linear infinite'
      }
    };
  }

  createAvatar(options = {}) {
    const { src = '', alt = '', size = 'md', initials = '' } = options;

    const sizeMap = { sm: '32px', md: '40px', lg: '56px' };

    return {
      type: 'box',
      style: {
        width: sizeMap[size],
        height: sizeMap[size],
        borderRadius: this.theme.radius.full,
        backgroundColor: this.theme.colors.primary,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
        fontSize: '14px',
        fontWeight: 600,
        overflow: 'hidden'
      },
      children: [
        src ? { type: 'image', src, alt } : { type: 'text', content: initials }
      ]
    };
  }

  createHero(options = {}) {
    const { title = '', subtitle = '', image = '', actionButtons = [] } = options;

    return {
      type: 'box',
      style: {
        backgroundImage: `url(${image})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        padding: this.theme.spacing.xxl,
        textAlign: 'center',
        color: '#fff',
        minHeight: '400px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
      },
      children: [
        title ? { type: 'heading', content: title, level: 1, style: { margin: 0, fontSize: '48px' } } : null,
        subtitle ? { type: 'paragraph', content: subtitle, style: { margin: this.theme.spacing.lg + ' 0 0 0', fontSize: '20px' } } : null,
        actionButtons.length > 0 ? {
          type: 'box',
          style: { display: 'flex', gap: this.theme.spacing.md, marginTop: this.theme.spacing.xl },
          children: actionButtons
        } : null
      ].filter(Boolean)
    };
  }

  createFooter(options = {}) {
    const { sections = [], copyright = '' } = options;

    return {
      type: 'footer',
      style: {
        backgroundColor: this.theme.colors.bgSecondary,
        padding: this.theme.spacing.xxl,
        borderTop: `1px solid ${this.theme.colors.border}`
      },
      children: [
        {
          type: 'box',
          style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: this.theme.spacing.xl, marginBottom: this.theme.spacing.xl },
          children: sections.map(section => ({
            type: 'box',
            children: [
              { type: 'heading', content: section.title, level: 4, style: { margin: 0 } },
              { type: 'box', style: { marginTop: this.theme.spacing.md }, children: section.links }
            ]
          }))
        },
        copyright ? { type: 'paragraph', content: copyright, style: { margin: 0, textAlign: 'center', color: this.theme.colors.textSecondary } } : null
      ].filter(Boolean)
    };
  }

  create(componentName, options = {}) {
    const renderer = this.components.get(componentName);
    if (!renderer) {
      throw new Error(`Unknown component: ${componentName}`);
    }
    return renderer(options);
  }

  getAvailableComponents() {
    return Array.from(this.components.keys());
  }

  setTheme(theme) {
    this.theme = { ...this.defaultTheme(), ...theme };
    return this;
  }
}

function createUIToolkit(options = {}) {
  return new UIToolkit(options);
}

export { UIToolkit, createUIToolkit };
