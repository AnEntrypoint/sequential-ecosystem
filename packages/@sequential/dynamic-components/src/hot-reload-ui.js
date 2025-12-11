// Hot reload preview UI components
export class HotReloadUI {
  buildPreviewUI(currentComponent, metrics) {
    return {
      type: 'box',
      style: {
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundColor: '#1e1e1e',
        borderRadius: '6px',
        overflow: 'hidden'
      },
      children: [
        this.buildPreviewHeader(metrics),
        {
          type: 'box',
          style: {
            flex: 1,
            overflow: 'auto',
            padding: '16px',
            backgroundColor: '#0d1117'
          },
          children: [currentComponent || { type: 'paragraph', content: 'No component loaded' }]
        },
        this.buildPreviewFooter()
      ]
    };
  }

  buildPreviewHeader(metrics) {
    return {
      type: 'box',
      style: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '12px 16px',
        backgroundColor: '#161b22',
        borderBottom: '1px solid #30363d'
      },
      children: [
        {
          type: 'paragraph',
          content: '🔄 Live Preview',
          style: { margin: 0, fontWeight: 600, color: '#e6edf3' }
        },
        {
          type: 'box',
          style: { display: 'flex', gap: '12px', fontSize: '11px', color: '#8b949e' },
          children: [
            { type: 'text', content: `Reloads: ${metrics.reloads}` },
            { type: 'text', content: `Avg: ${metrics.averageTime.toFixed(1)}ms` },
            { type: 'text', content: `Last: ${metrics.lastReloadTime.toFixed(1)}ms` }
          ]
        }
      ]
    };
  }

  buildPreviewFooter(canUndo, canRedo, onUndo, onRedo, onRefresh) {
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

  buildHistoryPanel(history) {
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
}
