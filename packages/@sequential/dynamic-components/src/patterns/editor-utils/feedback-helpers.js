/**
 * feedback-helpers.js
 *
 * Feedback UI helpers (error, success, empty states)
 */

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
