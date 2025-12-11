// Container component creators (alert, modal, tooltip, tabs, accordion, dropdown)
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
