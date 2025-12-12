/**
 * hot-reload-footer-builder.js - Preview footer UI builder
 *
 * Constructs undo/redo/refresh button controls
 */

export function buildPreviewFooter(canUndo, canRedo, onUndo, onRedo, onRefresh) {
  return {
    type: 'box',
    style: {
      display: 'flex',
      gap: '8px',
      padding: '12px 16px',
      backgroundColor: '#161b22',
      borderTop: '1px solid #30363d',
      justifyContent: 'flex-end'
    },
    children: [
      {
        type: 'button',
        content: '↶ Undo',
        style: {
          padding: '6px 12px',
          backgroundColor: canUndo ? '#58a6ff' : '#30363d',
          color: '#e6edf3',
          border: 'none',
          borderRadius: '4px',
          cursor: canUndo ? 'pointer' : 'not-allowed',
          fontSize: '12px',
          opacity: canUndo ? 1 : 0.5
        },
        onClick: canUndo ? onUndo : null
      },
      {
        type: 'button',
        content: '↷ Redo',
        style: {
          padding: '6px 12px',
          backgroundColor: canRedo ? '#58a6ff' : '#30363d',
          color: '#e6edf3',
          border: 'none',
          borderRadius: '4px',
          cursor: canRedo ? 'pointer' : 'not-allowed',
          fontSize: '12px',
          opacity: canRedo ? 1 : 0.5
        },
        onClick: canRedo ? onRedo : null
      },
      {
        type: 'button',
        content: '🔄 Refresh',
        style: {
          padding: '6px 12px',
          backgroundColor: '#238636',
          color: '#e6edf3',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '12px'
        },
        onClick: onRefresh
      }
    ]
  };
}
