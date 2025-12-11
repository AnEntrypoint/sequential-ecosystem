// Feature panels (code, animation, layout, export)
export function createCodePreview(patternBridge, componentId, framework = 'react') {
  if (!componentId) {
    return {
      type: 'box',
      style: { padding: '12px', background: '#1e1e1e', borderRadius: '6px' },
      children: [{
        type: 'paragraph',
        content: 'No component selected',
        style: { margin: 0, fontSize: '11px', color: '#858585' }
      }]
    };
  }

  const code = patternBridge.generateCode(componentId, framework);

  if (!code) {
    return {
      type: 'box',
      style: { padding: '12px', background: '#1e1e1e', borderRadius: '6px' },
      children: [{
        type: 'paragraph',
        content: 'Code generator not available',
        style: { margin: 0, fontSize: '11px', color: '#858585' }
      }]
    };
  }

  return {
    type: 'box',
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      padding: '12px',
      background: '#1e1e1e',
      borderRadius: '6px'
    },
    children: [
      {
        type: 'heading',
        content: `<> ${framework.toUpperCase()}`,
        level: 3,
        style: { margin: 0, fontSize: '12px', color: '#e0e0e0' }
      },
      {
        type: 'box',
        style: {
          padding: '12px',
          background: '#0d1117',
          borderRadius: '4px',
          border: '1px solid #30363d',
          fontFamily: 'monospace',
          fontSize: '11px',
          color: '#79c0ff',
          maxHeight: '300px',
          overflow: 'auto',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word'
        },
        children: [{
          type: 'text',
          content: code.substring(0, 500) + (code.length > 500 ? '...' : '')
        }]
      }
    ]
  };
}

export function createAnimationPanel(componentId) {
  if (!componentId) {
    return {
      type: 'box',
      style: { padding: '12px', background: '#1e1e1e', borderRadius: '6px' },
      children: [{
        type: 'paragraph',
        content: 'No component selected',
        style: { margin: 0, fontSize: '11px', color: '#858585' }
      }]
    };
  }

  const animations = ['fadeIn', 'slideInLeft', 'slideInRight', 'slideInUp', 'slideInDown', 'zoomIn', 'bounce'];

  return {
    type: 'box',
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      padding: '12px',
      background: '#1e1e1e',
      borderRadius: '6px'
    },
    children: [
      {
        type: 'heading',
        content: '✨ Animations',
        level: 3,
        style: { margin: 0, fontSize: '12px', color: '#e0e0e0' }
      },
      {
        type: 'box',
        style: {
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '8px'
        },
        children: animations.map(anim => ({
          type: 'box',
          className: 'animation-button',
          dataset: { animation: anim, componentId },
          style: {
            padding: '8px',
            background: '#2d2d30',
            borderRadius: '4px',
            cursor: 'pointer',
            border: '1px solid #3e3e42',
            fontSize: '10px',
            color: '#d4d4d4',
            textAlign: 'center',
            userSelect: 'none'
          },
          children: [{ type: 'text', content: anim }]
        }))
      }
    ]
  };
}

export function createLayoutPanel(componentId) {
  if (!componentId) {
    return {
      type: 'box',
      style: { padding: '12px', background: '#1e1e1e', borderRadius: '6px' },
      children: [{
        type: 'paragraph',
        content: 'No component selected',
        style: { margin: 0, fontSize: '11px', color: '#858585' }
      }]
    };
  }

  const layouts = ['grid-2col', 'grid-3col', 'flex-row', 'flex-column', 'flex-row-center', 'sidebar-left', 'sidebar-right', 'card-grid'];

  return {
    type: 'box',
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      padding: '12px',
      background: '#1e1e1e',
      borderRadius: '6px'
    },
    children: [
      {
        type: 'heading',
        content: '📐 Layouts',
        level: 3,
        style: { margin: 0, fontSize: '12px', color: '#e0e0e0' }
      },
      {
        type: 'box',
        style: {
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '8px'
        },
        children: layouts.map(layout => ({
          type: 'box',
          className: 'layout-button',
          dataset: { layout, componentId },
          style: {
            padding: '8px',
            background: '#2d2d30',
            borderRadius: '4px',
            cursor: 'pointer',
            border: '1px solid #3e3e42',
            fontSize: '9px',
            color: '#d4d4d4',
            textAlign: 'center',
            userSelect: 'none'
          },
          children: [{ type: 'text', content: layout.replace('-', ' ') }]
        }))
      }
    ]
  };
}

export function createExportPanel(componentId) {
  if (!componentId) {
    return {
      type: 'box',
      style: { padding: '12px', background: '#1e1e1e', borderRadius: '6px' },
      children: [{
        type: 'paragraph',
        content: 'No component selected',
        style: { margin: 0, fontSize: '11px', color: '#858585' }
      }]
    };
  }

  const frameworks = ['react', 'vue3', 'svelte', 'angular', 'web-components'];

  return {
    type: 'box',
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      padding: '12px',
      background: '#1e1e1e',
      borderRadius: '6px'
    },
    children: [
      {
        type: 'heading',
        content: '📦 Export',
        level: 3,
        style: { margin: 0, fontSize: '12px', color: '#e0e0e0' }
      },
      {
        type: 'box',
        style: {
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '8px'
        },
        children: frameworks.map(fw => ({
          type: 'box',
          className: 'export-button',
          dataset: { framework: fw, componentId },
          style: {
            padding: '8px 12px',
            background: '#2d2d30',
            borderRadius: '4px',
            cursor: 'pointer',
            border: '1px solid #3e3e42',
            fontSize: '10px',
            color: '#d4d4d4',
            textAlign: 'center',
            userSelect: 'none'
          },
          children: [{ type: 'text', content: fw.toUpperCase().replace('-', ' ') }]
        }))
      }
    ]
  };
}
