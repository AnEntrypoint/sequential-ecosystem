export function createButton(theme, options = {}) {
  const {
    content = 'Button',
    variant = 'primary',
    size = 'md',
    disabled = false,
    onClick = null
  } = options;

  const sizeMap = { sm: '6px 12px', md: '8px 16px', lg: '12px 24px' };
  const colorMap = {
    primary: theme.colors.primary,
    secondary: theme.colors.secondary,
    success: theme.colors.success,
    danger: theme.colors.danger
  };

  return {
    type: 'button',
    content,
    style: {
      padding: sizeMap[size],
      backgroundColor: colorMap[variant],
      color: '#ffffff',
      border: 'none',
      borderRadius: theme.radius.md,
      fontSize: '14px',
      fontWeight: 500,
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.6 : 1,
      transition: 'opacity 0.2s'
    },
    onClick: disabled ? null : onClick
  };
}

export function createCard(theme, options = {}) {
  const { title = null, content = null, children = [], footer = null } = options;

  return {
    type: 'box',
    style: {
      backgroundColor: theme.colors.bg,
      border: `1px solid ${theme.colors.border}`,
      borderRadius: theme.radius.lg,
      boxShadow: theme.shadows.md,
      padding: theme.spacing.lg,
      display: 'flex',
      flexDirection: 'column',
      gap: theme.spacing.md
    },
    children: [
      title ? { type: 'heading', content: title, level: 3, style: { margin: 0 } } : null,
      content ? { type: 'paragraph', content, style: { margin: 0, color: theme.colors.textSecondary } } : null,
      ...children,
      footer ? {
        type: 'box',
        style: {
          paddingTop: theme.spacing.md,
          borderTop: `1px solid ${theme.colors.border}`,
          display: 'flex',
          gap: theme.spacing.md
        },
        children: Array.isArray(footer) ? footer : [footer]
      } : null
    ].filter(Boolean)
  };
}

export function createInput(theme, options = {}) {
  const { placeholder = '', value = '', label = null, error = null, size = 'md' } = options;

  const sizeMap = { sm: '8px 8px', md: '8px 12px', lg: '12px 16px' };

  return {
    type: 'box',
    style: { display: 'flex', flexDirection: 'column', gap: theme.spacing.sm },
    children: [
      label ? {
        type: 'paragraph',
        content: label,
        style: { margin: 0, fontSize: '14px', fontWeight: 500, color: theme.colors.text }
      } : null,
      {
        type: 'input',
        placeholder,
        value,
        style: {
          padding: sizeMap[size],
          border: `1px solid ${error ? theme.colors.danger : theme.colors.border}`,
          borderRadius: theme.radius.md,
          fontSize: '14px',
          fontFamily: 'inherit'
        }
      },
      error ? {
        type: 'paragraph',
        content: error,
        style: { margin: 0, fontSize: '12px', color: theme.colors.danger }
      } : null
    ].filter(Boolean)
  };
}

export function createSelect(theme, options = {}) {
  const { label = null, items = [], value = '', onChange = null } = options;

  return {
    type: 'box',
    style: { display: 'flex', flexDirection: 'column', gap: theme.spacing.sm },
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
          padding: theme.spacing.md,
          border: `1px solid ${theme.colors.border}`,
          borderRadius: theme.radius.md,
          fontSize: '14px'
        },
        onChange
      }
    ].filter(Boolean)
  };
}

export function createCheckbox(theme, options = {}) {
  const { label = '', checked = false, onChange = null } = options;

  return {
    type: 'box',
    style: { display: 'flex', alignItems: 'center', gap: theme.spacing.sm, cursor: 'pointer' },
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

export function createRadio(theme, options = {}) {
  const { label = '', name = '', value = '', checked = false, onChange = null } = options;

  return {
    type: 'box',
    style: { display: 'flex', alignItems: 'center', gap: theme.spacing.sm, cursor: 'pointer' },
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

export function createBadge(theme, options = {}) {
  const { content = '', variant = 'primary', size = 'md' } = options;

  const sizeMap = { sm: '4px 8px', md: '6px 12px', lg: '8px 16px' };
  const colorMap = {
    primary: { bg: theme.colors.primary, text: '#fff' },
    secondary: { bg: theme.colors.secondary, text: '#fff' },
    success: { bg: theme.colors.success, text: '#fff' },
    danger: { bg: theme.colors.danger, text: '#fff' },
    warning: { bg: theme.colors.warning, text: '#fff' }
  };

  const colors = colorMap[variant];

  return {
    type: 'box',
    style: {
      display: 'inline-block',
      padding: sizeMap[size],
      backgroundColor: colors.bg,
      color: colors.text,
      borderRadius: theme.radius.full,
      fontSize: '12px',
      fontWeight: 600
    },
    children: [{ type: 'text', content }]
  };
}

export function createAlert(theme, options = {}) {
  const { type = 'info', title = '', message = '', dismissible = false, onDismiss = null } = options;

  const colorMap = {
    success: theme.colors.success,
    danger: theme.colors.danger,
    warning: theme.colors.warning,
    info: theme.colors.info
  };

  return {
    type: 'box',
    style: {
      padding: theme.spacing.lg,
      backgroundColor: `${colorMap[type]}15`,
      border: `1px solid ${colorMap[type]}`,
      borderLeft: `4px solid ${colorMap[type]}`,
      borderRadius: theme.radius.md,
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

export function createModal(theme, options = {}) {
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
        backgroundColor: theme.colors.bg,
        borderRadius: theme.radius.lg,
        boxShadow: theme.shadows.xl,
        padding: theme.spacing.xl,
        maxWidth: '500px',
        width: '90%'
      },
      children: [
        {
          type: 'box',
          style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.spacing.lg },
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
            gap: theme.spacing.md,
            marginTop: theme.spacing.lg,
            paddingTop: theme.spacing.lg,
            borderTop: `1px solid ${theme.colors.border}`
          },
          children: Array.isArray(footer) ? footer : [footer]
        } : null
      ].filter(Boolean)
    }]
  };
}

export function createTooltip(theme, options = {}) {
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
          padding: theme.spacing.sm,
          borderRadius: theme.radius.sm,
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

export function createTabs(theme, options = {}) {
  const { tabs = [], activeTab = 0, onChange = null } = options;

  return {
    type: 'box',
    style: { display: 'flex', flexDirection: 'column' },
    children: [
      {
        type: 'box',
        style: {
          display: 'flex',
          borderBottom: `1px solid ${theme.colors.border}`,
          gap: 0
        },
        children: tabs.map((tab, idx) => ({
          type: 'button',
          content: tab.label,
          style: {
            padding: theme.spacing.md,
            backgroundColor: 'transparent',
            border: 'none',
            borderBottom: idx === activeTab ? `2px solid ${theme.colors.primary}` : 'none',
            color: idx === activeTab ? theme.colors.primary : theme.colors.textSecondary,
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: idx === activeTab ? 600 : 400
          },
          onClick: () => onChange?.(idx)
        }))
      },
      tabs[activeTab]?.content ? {
        type: 'box',
        style: { padding: theme.spacing.lg },
        children: [tabs[activeTab].content]
      } : null
    ].filter(Boolean)
  };
}

export function createAccordion(theme, options = {}) {
  const { items = [], allowMultiple = false } = options;

  return {
    type: 'box',
    style: { display: 'flex', flexDirection: 'column', gap: theme.spacing.sm },
    children: items.map((item, idx) => ({
      type: 'box',
      style: {
        border: `1px solid ${theme.colors.border}`,
        borderRadius: theme.radius.md,
        overflow: 'hidden'
      },
      children: [
        {
          type: 'button',
          content: item.title,
          style: {
            width: '100%',
            padding: theme.spacing.lg,
            backgroundColor: theme.colors.bgSecondary,
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
          style: { padding: theme.spacing.lg, borderTop: `1px solid ${theme.colors.border}` },
          children: [item.content]
        } : null
      ].filter(Boolean)
    }))
  };
}

export function createDropdown(theme, options = {}) {
  const { label = '', items = [], onChange = null } = options;

  return {
    type: 'box',
    style: { position: 'relative', display: 'inline-block' },
    children: [
      { type: 'button', content: label, style: { padding: theme.spacing.md } },
      {
        type: 'box',
        style: {
          position: 'absolute',
          backgroundColor: theme.colors.bg,
          minWidth: '160px',
          boxShadow: theme.shadows.lg,
          borderRadius: theme.radius.md,
          top: '100%',
          left: 0,
          zIndex: 1
        },
        children: items.map(item => ({
          type: 'button',
          content: item.label,
          style: {
            width: '100%',
            padding: theme.spacing.md,
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

export function createPagination(theme, options = {}) {
  const { currentPage = 1, totalPages = 5, onChange = null } = options;

  return {
    type: 'box',
    style: { display: 'flex', gap: theme.spacing.sm, alignItems: 'center' },
    children: [
      ...Array.from({ length: totalPages }, (_, i) => ({
        type: 'button',
        content: String(i + 1),
        style: {
          padding: theme.spacing.sm,
          backgroundColor: i + 1 === currentPage ? theme.colors.primary : theme.colors.bgSecondary,
          color: i + 1 === currentPage ? '#fff' : theme.colors.text,
          border: 'none',
          borderRadius: theme.radius.md,
          cursor: 'pointer',
          fontSize: '14px',
          minWidth: '32px'
        },
        onClick: () => onChange?.(i + 1)
      }))
    ]
  };
}

export function createBreadcrumb(theme, options = {}) {
  const { items = [] } = options;

  return {
    type: 'box',
    style: { display: 'flex', gap: theme.spacing.sm, alignItems: 'center' },
    children: items.flatMap((item, idx) => [
      {
        type: 'link',
        content: item.label,
        href: item.href || '#',
        style: { color: theme.colors.primary, textDecoration: 'none' }
      },
      idx < items.length - 1 ? { type: 'text', content: '/' } : null
    ]).filter(Boolean)
  };
}

export function createProgress(theme, options = {}) {
  const { value = 0, max = 100, label = null } = options;

  const percent = Math.round((value / max) * 100);

  return {
    type: 'box',
    style: { display: 'flex', flexDirection: 'column', gap: theme.spacing.sm },
    children: [
      label ? { type: 'paragraph', content: `${label} (${percent}%)`, style: { margin: 0, fontSize: '12px' } } : null,
      {
        type: 'box',
        style: {
          width: '100%',
          height: '8px',
          backgroundColor: theme.colors.bgSecondary,
          borderRadius: theme.radius.full,
          overflow: 'hidden'
        },
        children: [{
          type: 'box',
          style: {
            width: `${percent}%`,
            height: '100%',
            backgroundColor: theme.colors.success,
            transition: 'width 0.3s ease'
          }
        }]
      }
    ].filter(Boolean)
  };
}

export function createSpinner(theme, options = {}) {
  const { size = 'md' } = options;

  const sizeMap = { sm: '20px', md: '40px', lg: '60px' };

  return {
    type: 'box',
    style: {
      width: sizeMap[size],
      height: sizeMap[size],
      border: `4px solid ${theme.colors.bgSecondary}`,
      borderTop: `4px solid ${theme.colors.primary}`,
      borderRadius: theme.radius.full,
      animation: 'spin 0.8s linear infinite'
    }
  };
}

export function createAvatar(theme, options = {}) {
  const { src = '', alt = '', size = 'md', initials = '' } = options;

  const sizeMap = { sm: '32px', md: '40px', lg: '56px' };

  return {
    type: 'box',
    style: {
      width: sizeMap[size],
      height: sizeMap[size],
      borderRadius: theme.radius.full,
      backgroundColor: theme.colors.primary,
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

export function createHero(theme, options = {}) {
  const { title = '', subtitle = '', image = '', actionButtons = [] } = options;

  return {
    type: 'box',
    style: {
      backgroundImage: `url(${image})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      padding: theme.spacing.xxl,
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
      subtitle ? { type: 'paragraph', content: subtitle, style: { margin: theme.spacing.lg + ' 0 0 0', fontSize: '20px' } } : null,
      actionButtons.length > 0 ? {
        type: 'box',
        style: { display: 'flex', gap: theme.spacing.md, marginTop: theme.spacing.xl },
        children: actionButtons
      } : null
    ].filter(Boolean)
  };
}

export function createFooter(theme, options = {}) {
  const { sections = [], copyright = '' } = options;

  return {
    type: 'footer',
    style: {
      backgroundColor: theme.colors.bgSecondary,
      padding: theme.spacing.xxl,
      borderTop: `1px solid ${theme.colors.border}`
    },
    children: [
      {
        type: 'box',
        style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: theme.spacing.xl, marginBottom: theme.spacing.xl },
        children: sections.map(section => ({
          type: 'box',
          children: [
            { type: 'heading', content: section.title, level: 4, style: { margin: 0 } },
            { type: 'box', style: { marginTop: theme.spacing.md }, children: section.links }
          ]
        }))
      },
      copyright ? { type: 'paragraph', content: copyright, style: { margin: 0, textAlign: 'center', color: theme.colors.textSecondary } } : null
    ].filter(Boolean)
  };
}
