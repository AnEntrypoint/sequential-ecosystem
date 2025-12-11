export function createPatternPalette(patternBridge) {
  const categories = patternBridge.getPatternCategories();

  return {
    type: 'box',
    className: 'pattern-ui-palette',
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      padding: '12px',
      background: '#1e1e1e',
      borderRadius: '6px',
      height: '100%',
      overflow: 'auto'
    },
    children: [
      {
        type: 'heading',
        content: '🎨 Pattern Library',
        level: 3,
        style: { margin: 0, fontSize: '12px', color: '#e0e0e0', paddingBottom: '8px' }
      },
      {
        type: 'box',
        style: {
          display: 'flex',
          gap: '4px',
          marginBottom: '8px',
          flexWrap: 'wrap'
        },
        children: [
          { type: 'text', content: 'All' },
          ...categories.map(cat => ({
            type: 'text',
            content: cat.charAt(0).toUpperCase() + cat.slice(1),
            className: 'category-filter',
            style: { cursor: 'pointer', fontSize: '10px' }
          }))
        ]
      },
      ...categories.map(category => createCategorySection(patternBridge, category))
    ]
  };
}

function createCategorySection(patternBridge, category) {
  const patterns = patternBridge.getPatternsByCategory(category);

  return {
    type: 'box',
    className: `pattern-category-${category}`,
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: '6px'
    },
    children: [
      {
        type: 'heading',
        content: category.charAt(0).toUpperCase() + category.slice(1),
        level: 4,
        style: { margin: 0, fontSize: '10px', color: '#667eea', fontWeight: 600, padding: '6px 0' }
      },
      ...patterns.slice(0, 5).map(pattern => ({
        type: 'box',
        className: 'pattern-item',
        dataset: { patternId: pattern.id || pattern.name },
        style: {
          padding: '8px',
          background: '#2d2d30',
          borderRadius: '4px',
          cursor: 'pointer',
          border: '1px solid #3e3e42',
          transition: 'all 0.2s',
          userSelect: 'none'
        },
        children: [
          {
            type: 'paragraph',
            content: pattern.name,
            style: { margin: '0 0 2px 0', fontSize: '10px', fontWeight: 500, color: '#d4d4d4' }
          },
          {
            type: 'paragraph',
            content: pattern.description || '',
            style: { margin: 0, fontSize: '8px', color: '#858585' }
          }
        ]
      }))
    ]
  };
}

export function createInspectorPanel(patternBridge, componentId) {
  if (!componentId) {
    return {
      type: 'box',
      style: {
        padding: '20px',
        background: '#1e1e1e',
        borderRadius: '6px',
        textAlign: 'center'
      },
      children: [{
        type: 'paragraph',
        content: 'Select a component to inspect',
        style: { margin: 0, color: '#858585', fontSize: '12px' }
      }]
    };
  }

  return patternBridge.buildInspectorPanel(componentId);
}

export function createValidationPanel(patternBridge, componentId) {
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

  const validation = patternBridge.validateComponentAgainstPattern(componentId);

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
        content: '✓ Validation',
        level: 3,
        style: { margin: 0, fontSize: '12px', color: '#e0e0e0' }
      },
      {
        type: 'box',
        style: {
          padding: '8px 12px',
          background: validation.valid ? 'rgba(74, 222, 128, 0.1)' : 'rgba(239, 68, 68, 0.1)',
          borderLeft: `3px solid ${validation.valid ? '#4ade80' : '#ef4444'}`,
          borderRadius: '4px'
        },
        children: [{
          type: 'paragraph',
          content: validation.valid ? 'All checks passed' : `${validation.issues?.length || 0} issue(s) found`,
          style: { margin: 0, fontSize: '11px', color: '#d4d4d4' }
        }]
      },
      ...(validation.issues || []).slice(0, 5).map(issue => ({
        type: 'box',
        style: {
          padding: '8px',
          background: '#2d2d30',
          borderLeft: `3px solid ${issue.severity === 'error' ? '#ef4444' : '#f59e0b'}`,
          borderRadius: '4px'
        },
        children: [{
          type: 'paragraph',
          content: issue.message,
          style: { margin: 0, fontSize: '9px', color: '#d4d4d4' }
        }]
      }))
    ]
  };
}

export function createAccessibilityPanel(patternBridge, componentId) {
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

  const audit = patternBridge.auditComponentAccessibility(componentId);

  if (!audit) {
    return {
      type: 'box',
      style: { padding: '12px', background: '#1e1e1e', borderRadius: '6px' },
      children: [{
        type: 'paragraph',
        content: 'Accessibility auditor not available',
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
        content: '♿ Accessibility',
        level: 3,
        style: { margin: 0, fontSize: '12px', color: '#e0e0e0' }
      },
      {
        type: 'box',
        style: {
          padding: '8px 12px',
          background: '#2d2d30',
          borderRadius: '4px',
          borderLeft: `3px solid ${audit.wcagLevel === 'Compliant' ? '#4ade80' : '#f59e0b'}`
        },
        children: [{
          type: 'paragraph',
          content: `WCAG Level: ${audit.wcagLevel}`,
          style: { margin: 0, fontSize: '10px', color: '#d4d4d4' }
        }]
      },
      ...(audit.issues || []).slice(0, 5).map(issue => ({
        type: 'box',
        style: {
          padding: '8px',
          background: '#2d2d30',
          borderLeft: '3px solid #3b82f6',
          borderRadius: '4px'
        },
        children: [{
          type: 'paragraph',
          content: `${issue.type}: ${issue.message}`,
          style: { margin: 0, fontSize: '9px', color: '#d4d4d4' }
        }]
      }))
    ]
  };
}

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
          children: [{
            type: 'text',
            content: anim
          }]
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
          children: [{
            type: 'text',
            content: layout.replace('-', ' ')
          }]
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
          children: [{
            type: 'text',
            content: fw.toUpperCase().replace('-', ' ')
          }]
        }))
      }
    ]
  };
}
