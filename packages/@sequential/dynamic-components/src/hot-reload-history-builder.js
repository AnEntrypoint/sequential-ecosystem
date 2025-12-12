/**
 * hot-reload-history-builder.js - History panel UI builder
 *
 * Constructs change history visualization
 */

export function buildHistoryPanel(history) {
  return {
    type: 'box',
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      padding: '12px',
      backgroundColor: '#1e1e1e',
      borderRadius: '6px',
      maxHeight: '300px',
      overflow: 'auto'
    },
    children: [
      {
        type: 'heading',
        content: '📜 Change History',
        level: 3,
        style: { margin: 0, fontSize: '12px', color: '#e6edf3' }
      },
      ...history.map((record) => ({
        type: 'box',
        style: {
          padding: '8px',
          backgroundColor: '#161b22',
          borderRadius: '4px',
          border: '1px solid #30363d',
          cursor: 'pointer',
          transition: 'all 0.2s'
        },
        children: [
          {
            type: 'paragraph',
            content: `#${record.index + 1} • ${new Date(record.timestamp).toLocaleTimeString()}`,
            style: { margin: 0, fontSize: '11px', fontWeight: 500, color: '#58a6ff' }
          },
          {
            type: 'paragraph',
            content: `${record.changeCount} change(s): ${record.summary.join(', ')}`,
            style: { margin: '4px 0 0 0', fontSize: '10px', color: '#8b949e' }
          }
        ]
      }))
    ]
  };
}
