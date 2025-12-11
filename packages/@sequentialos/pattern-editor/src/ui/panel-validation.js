// Validation and accessibility panels
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
