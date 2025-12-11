/**
 * list-and-state-helpers.js
 *
 * List and state display UI helpers
 */

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
