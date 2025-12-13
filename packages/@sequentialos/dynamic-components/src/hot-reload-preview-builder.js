/**
 * hot-reload-preview-builder.js - Preview panel UI builder
 *
 * Constructs the main preview container and header
 */

export function buildPreviewUI(currentComponent, metrics, buildHeaderFn, buildFooterFn) {
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
      buildHeaderFn(metrics),
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
      buildFooterFn()
    ]
  };
}

export function buildPreviewHeader(metrics) {
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
