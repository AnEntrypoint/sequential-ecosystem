/**
 * panel-and-metric-helpers.js
 *
 * Dashboard panel and metric card UI helpers
 */

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
