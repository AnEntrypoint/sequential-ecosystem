// Property field UI building
export class EditorFieldBuilder {
  constructor(themeEngine) {
    this.themeEngine = themeEngine;
  }

  buildFieldControl(propName, propConfig, currentValue, onPropertyChange, emitCallback) {
    const fieldType = propConfig.type || 'string';

    const controls = {
      'string': {
        type: 'input',
        value: currentValue,
        placeholder: propConfig.placeholder || '',
        onChange: (value) => {
          emitCallback('propertyChanging', { prop: propName, value });
          onPropertyChange(propName, value);
        },
        style: { width: '100%' }
      },
      'number': {
        type: 'input',
        value: currentValue,
        placeholder: '0',
        onChange: (value) => {
          onPropertyChange(propName, Number(value));
        },
        style: { width: '100%' }
      },
      'boolean': {
        type: 'toggle-switch',
        checked: currentValue,
        onChange: (value) => {
          onPropertyChange(propName, value);
        }
      },
      'select': {
        type: 'select',
        options: propConfig.options || [],
        value: currentValue,
        onChange: (value) => {
          onPropertyChange(propName, value);
        },
        style: { width: '100%' }
      },
      'color': {
        type: 'flex',
        direction: 'row',
        gap: this.themeEngine.getSpacing('sm'),
        children: [
          {
            type: 'input',
            value: currentValue,
            placeholder: '#000000',
            onChange: (value) => {
              onPropertyChange(propName, value);
            },
            style: { flex: 1 }
          },
          {
            type: 'button',
            label: '🎨',
            onClick: () => emitCallback('colorPickerRequested', { prop: propName }),
            style: {
              width: '40px',
              padding: this.themeEngine.getSpacing('sm')
            }
          }
        ]
      },
      'textarea': {
        type: 'rich-textarea',
        value: currentValue,
        placeholder: propConfig.placeholder || '',
        onChange: (value) => {
          onPropertyChange(propName, value);
        },
        style: { width: '100%', minHeight: '100px' }
      }
    };

    return controls[fieldType] || controls['string'];
  }

  buildPropertyField(component, propName, propConfig, currentValue, validation, onPropertyChange, emitCallback) {
    return {
      type: 'flex',
      direction: 'column',
      gap: this.themeEngine.getSpacing('xs'),
      style: {
        padding: this.themeEngine.getSpacing('md'),
        background: this.themeEngine.getColor('backgroundLight'),
        borderRadius: this.themeEngine.getBorderRadius('sm'),
        borderLeft: validation.valid ? '' : `4px solid ${this.themeEngine.getColor('danger')}`
      },
      children: [
        {
          type: 'flex',
          direction: 'row',
          gap: this.themeEngine.getSpacing('sm'),
          style: { alignItems: 'center' },
          children: [
            {
              type: 'paragraph',
              content: propName,
              style: {
                fontWeight: '600',
                fontSize: '13px',
                flex: 1
              }
            },
            propConfig.required ? {
              type: 'badge-pill',
              content: 'Required',
              style: { fontSize: '10px', padding: '2px 6px' }
            } : null
          ].filter(Boolean)
        },
        this.buildFieldControl(propName, propConfig, currentValue, onPropertyChange, emitCallback),
        propConfig.hint ? {
          type: 'paragraph',
          content: propConfig.hint,
          style: {
            fontSize: '11px',
            color: this.themeEngine.getColor('textMuted'),
            fontStyle: 'italic'
          }
        } : null,
        !validation.valid ? {
          type: 'paragraph',
          content: `⚠️ ${validation.error}`,
          style: {
            fontSize: '11px',
            color: this.themeEngine.getColor('danger'),
            fontWeight: '500'
          }
        } : null
      ].filter(Boolean)
    };
  }
}
