export function createDashboardPanel(title, icon, style = {}) {
  return {
    type: 'box',
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      padding: '16px',
      backgroundColor: '#2a2a2a',
      borderRadius: '6px',
      border: '1px solid #3a3a3a',
      ...style
    },
    children: [
      {
        type: 'heading',
        content: `${icon} ${title}`,
        level: 3,
        style: { margin: 0, fontSize: '14px', color: '#e0e0e0', fontWeight: 600 }
      }
    ]
  };
}

export function createMetricCard(label, value, color = '#667eea', style = {}) {
  return {
    type: 'box',
    style: {
      padding: '12px',
      backgroundColor: '#1e1e1e',
      borderRadius: '4px',
      border: `1px solid ${color}33`,
      ...style
    },
    children: [
      {
        type: 'paragraph',
        content: label,
        style: { margin: '0 0 4px 0', fontSize: '11px', color: '#858585' }
      },
      {
        type: 'paragraph',
        content: String(value),
        style: { margin: 0, fontSize: '16px', color, fontWeight: 600 }
      }
    ]
  };
}

export function createButton(label, onClick, style = {}, variant = 'primary') {
  const variants = {
    primary: { bg: '#667eea', color: '#fff' },
    secondary: { bg: '#3a3a3a', color: '#e0e0e0' },
    danger: { bg: '#dc3545', color: '#fff' },
    success: { bg: '#28a745', color: '#fff' }
  };

  const v = variants[variant] || variants.primary;

  return {
    type: 'button',
    content: label,
    style: {
      padding: '8px 16px',
      backgroundColor: v.bg,
      color: v.color,
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      fontSize: '12px',
      fontWeight: 600,
      ...style
    },
    onClick
  };
}

export function createLabel(text, style = {}) {
  return {
    type: 'paragraph',
    content: text,
    style: {
      margin: 0,
      fontSize: '11px',
      fontWeight: 600,
      color: '#858585',
      ...style
    }
  };
}

export function createErrorDisplay(message, style = {}) {
  return {
    type: 'box',
    style: {
      padding: '12px',
      backgroundColor: '#3d2b2b',
      border: '1px solid #dc3545',
      borderRadius: '4px',
      ...style
    },
    children: [
      {
        type: 'paragraph',
        content: message,
        style: { margin: 0, fontSize: '11px', color: '#ff6b6b' }
      }
    ]
  };
}

export function createSuccessDisplay(message, style = {}) {
  return {
    type: 'box',
    style: {
      padding: '12px',
      backgroundColor: '#2b3d2b',
      border: '1px solid #28a745',
      borderRadius: '4px',
      ...style
    },
    children: [
      {
        type: 'paragraph',
        content: message,
        style: { margin: 0, fontSize: '11px', color: '#51cf66' }
      }
    ]
  };
}

export function createEmptyState(message, icon = '📭', style = {}) {
  return {
    type: 'box',
    style: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px',
      backgroundColor: '#1a1a1a',
      borderRadius: '6px',
      ...style
    },
    children: [
      {
        type: 'paragraph',
        content: icon,
        style: { margin: '0 0 8px 0', fontSize: '32px' }
      },
      {
        type: 'paragraph',
        content: message,
        style: { margin: 0, fontSize: '12px', color: '#858585' }
      }
    ]
  };
}

export function createList(items, style = {}) {
  return {
    type: 'box',
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      ...style
    },
    children: items.map(item => ({
      type: 'box',
      style: {
        padding: '8px 12px',
        backgroundColor: '#1e1e1e',
        borderRadius: '4px',
        borderLeft: `3px solid ${item.color || '#667eea'}`
      },
      children: [
        {
          type: 'paragraph',
          content: item.label || item,
          style: { margin: 0, fontSize: '11px', color: '#e0e0e0' }
        }
      ]
    }))
  };
}
