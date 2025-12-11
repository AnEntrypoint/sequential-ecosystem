// Editor UI components
export class EditorUIBuilders {
  constructor(themeEngine) {
    this.themeEngine = themeEngine;
  }

  buildValidationSummary(component, properties, validateProperty) {
    const errors = [];

    Object.entries(properties).forEach(([propName, propConfig]) => {
      const value = component.props?.[propName];
      const validation = validateProperty(propName, value, propConfig);
      if (!validation.valid) {
        errors.push({ prop: propName, error: validation.error });
      }
    });

    if (errors.length === 0) {
      return {
        type: 'card',
        variant: 'flat',
        style: {
          background: `${this.themeEngine.getColor('success')}22`,
          borderLeft: `4px solid ${this.themeEngine.getColor('success')}`,
          padding: this.themeEngine.getSpacing('md')
        },
        children: [{
          type: 'paragraph',
          content: '✅ All validations passed',
          style: { color: this.themeEngine.getColor('success'), fontWeight: '500' }
        }]
      };
    }

    return {
      type: 'card',
      variant: 'flat',
      style: {
        background: `${this.themeEngine.getColor('danger')}22`,
        borderLeft: `4px solid ${this.themeEngine.getColor('danger')}`,
        padding: this.themeEngine.getSpacing('md')
      },
      children: [{
        type: 'flex',
        direction: 'column',
        gap: this.themeEngine.getSpacing('xs'),
        children: [
          {
            type: 'paragraph',
            content: `⚠️ ${errors.length} validation issue${errors.length > 1 ? 's' : ''}`,
            style: { color: this.themeEngine.getColor('danger'), fontWeight: '600' }
          },
          ...errors.map(err => ({
            type: 'paragraph',
            content: `• ${err.prop}: ${err.error}`,
            style: { fontSize: '12px', color: this.themeEngine.getColor('danger') }
          }))
        ]
      }]
    };
  }

  buildCodePreviewUI(code, exportCallback, copyCallback) {
    return {
      type: 'flex',
      direction: 'column',
      gap: this.themeEngine.getSpacing('md'),
      children: [
        {
          type: 'heading',
          content: 'Generated Code',
          level: 4
        },
        {
          type: 'card',
          variant: 'flat',
          style: {
            background: '#1e1e1e',
            padding: this.themeEngine.getSpacing('md'),
            fontFamily: 'monospace',
            fontSize: '12px',
            color: '#d4d4d4',
            overflow: 'auto',
            maxHeight: '400px'
          },
          children: [{
            type: 'paragraph',
            content: code,
            style: { whiteSpace: 'pre-wrap', wordBreak: 'break-word' }
          }]
        },
        {
          type: 'flex',
          direction: 'row',
          gap: this.themeEngine.getSpacing('sm'),
          children: [
            {
              type: 'button',
              label: '📋 Copy Code',
              onClick: copyCallback,
              variant: 'primary'
            },
            {
              type: 'button',
              label: '📥 Export JSON',
              onClick: exportCallback,
              variant: 'secondary'
            }
          ]
        }
      ]
    };
  }
}
