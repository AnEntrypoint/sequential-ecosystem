// Empty state builder - shown when no validation results available
export function buildEmptyState() {
  return {
    type: 'box',
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      padding: '16px',
      backgroundColor: '#f9f9f9',
      borderRadius: '6px'
    },
    children: [
      {
        type: 'heading',
        content: 'Accessibility Validator',
        level: 4,
        style: { margin: 0, fontSize: '14px', fontWeight: 600 }
      },
      {
        type: 'text',
        content: 'Select a pattern to audit for WCAG compliance'
      }
    ]
  };
}
