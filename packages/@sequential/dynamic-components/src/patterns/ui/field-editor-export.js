// Export controls field editor
export function buildExportControls() {
  return {
    type: 'box',
    style: {
      display: 'flex',
      gap: '8px'
    },
    children: [
      {
        type: 'button',
        content: 'Export CSS',
        style: {
          flex: 1,
          padding: '10px 12px',
          backgroundColor: '#667eea',
          color: '#fff',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontWeight: 600,
          fontSize: '12px'
        }
      },
      {
        type: 'button',
        content: 'Export JSON',
        style: {
          flex: 1,
          padding: '10px 12px',
          backgroundColor: '#f0f0f0',
          color: '#333',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '12px'
        }
      }
    ]
  };
}
