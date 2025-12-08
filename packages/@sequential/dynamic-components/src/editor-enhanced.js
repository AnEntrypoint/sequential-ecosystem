export class EnhancedPropertyEditor {
  constructor(registry, themeEngine) {
    this.registry = registry;
    this.themeEngine = themeEngine;
    this.validators = new Map();
    this.initializeValidators();
    this.listeners = new Map();
  }

  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
    return this;
  }

  emit(event, data) {
    const callbacks = this.listeners.get(event) || [];
    callbacks.forEach(cb => cb(data));
  }

  initializeValidators() {
    this.validators.set('string', (val) => typeof val === 'string');
    this.validators.set('number', (val) => !isNaN(val) && val !== '');
    this.validators.set('boolean', (val) => val === true || val === false);
    this.validators.set('array', (val) => Array.isArray(val));
    this.validators.set('object', (val) => typeof val === 'object' && val !== null);
    this.validators.set('color', (val) => /^#[0-9A-F]{6}$/i.test(val));
    this.validators.set('url', (val) => {
      try {
        new URL(val);
        return true;
      } catch {
        return false;
      }
    });
    this.validators.set('email', (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val));
  }

  buildPropertyEditor(component, onPropertyChange) {
    const properties = this.getComponentProperties(component.type);

    return {
      type: 'flex',
      direction: 'column',
      gap: this.themeEngine.getSpacing('md'),
      style: { padding: this.themeEngine.getSpacing('lg') },
      children: [
        {
          type: 'heading',
          content: `Edit ${component.type}`,
          level: 4,
          style: { marginBottom: this.themeEngine.getSpacing('md') }
        },
        ...Object.entries(properties).map(([propName, propConfig]) =>
          this.buildPropertyField(component, propName, propConfig, onPropertyChange)
        ),
        this.buildValidationSummary(component)
      ]
    };
  }

  buildPropertyField(component, propName, propConfig, onPropertyChange) {
    const currentValue = component.props?.[propName] ?? propConfig.default ?? '';
    const validation = this.validateProperty(propName, currentValue, propConfig);

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
        this.buildFieldControl(propName, propConfig, currentValue, onPropertyChange),
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

  buildFieldControl(propName, propConfig, currentValue, onPropertyChange) {
    const fieldType = propConfig.type || 'string';

    const controls = {
      'string': {
        type: 'input',
        value: currentValue,
        placeholder: propConfig.placeholder || '',
        onChange: (value) => {
          this.emit('propertyChanging', { prop: propName, value });
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
            onClick: () => this.emit('colorPickerRequested', { prop: propName }),
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

  validateProperty(propName, value, propConfig) {
    if (propConfig.required && !value) {
      return { valid: false, error: `${propName} is required` };
    }

    if (propConfig.type && propConfig.type !== 'select') {
      const validator = this.validators.get(propConfig.type);
      if (validator && value && !validator(value)) {
        return { valid: false, error: `Invalid ${propConfig.type}` };
      }
    }

    if (propConfig.minLength && value.length < propConfig.minLength) {
      return { valid: false, error: `Minimum ${propConfig.minLength} characters` };
    }

    if (propConfig.maxLength && value.length > propConfig.maxLength) {
      return { valid: false, error: `Maximum ${propConfig.maxLength} characters` };
    }

    if (propConfig.min !== undefined && Number(value) < propConfig.min) {
      return { valid: false, error: `Minimum value ${propConfig.min}` };
    }

    if (propConfig.max !== undefined && Number(value) > propConfig.max) {
      return { valid: false, error: `Maximum value ${propConfig.max}` };
    }

    if (propConfig.pattern && !new RegExp(propConfig.pattern).test(value)) {
      return { valid: false, error: `Invalid format` };
    }

    return { valid: true };
  }

  buildValidationSummary(component) {
    const properties = this.getComponentProperties(component.type);
    const errors = [];

    Object.entries(properties).forEach(([propName, propConfig]) => {
      const value = component.props?.[propName];
      const validation = this.validateProperty(propName, value, propConfig);
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

  getComponentProperties(componentType) {
    const commonProps = {
      className: { type: 'string', label: 'CSS Classes', hint: 'Space-separated classes' },
      style: { type: 'object', label: 'Inline Styles' }
    };

    const typeProps = {
      button: {
        label: { type: 'string', required: true, hint: 'Button text' },
        variant: { type: 'select', options: ['primary', 'secondary', 'danger', 'outline'], default: 'primary' },
        disabled: { type: 'boolean', default: false },
        onClick: { type: 'string', hint: 'Event handler name' }
      },
      input: {
        type: { type: 'select', options: ['text', 'email', 'password', 'number', 'date'], default: 'text' },
        placeholder: { type: 'string', hint: 'Placeholder text' },
        value: { type: 'string', hint: 'Initial value' },
        required: { type: 'boolean', default: false },
        disabled: { type: 'boolean', default: false }
      },
      heading: {
        content: { type: 'string', required: true, hint: 'Heading text' },
        level: { type: 'number', min: 1, max: 6, default: 1, hint: 'H1-H6 level' }
      },
      card: {
        title: { type: 'string', hint: 'Card title' },
        variant: { type: 'select', options: ['default', 'elevated', 'flat'], default: 'default' }
      },
      flex: {
        direction: { type: 'select', options: ['row', 'column'], default: 'row' },
        gap: { type: 'string', hint: 'Gap size (e.g., "12px" or "md")' },
        align: { type: 'select', options: ['stretch', 'center', 'flex-start', 'flex-end'], default: 'stretch' }
      },
      grid: {
        cols: { type: 'string', hint: 'Grid template (e.g., "1fr 1fr")' },
        gap: { type: 'string', hint: 'Gap size' }
      }
    };

    return { ...commonProps, ...(typeProps[componentType] || {}) };
  }
}

export class LiveCodePreview {
  constructor(registry, themeEngine) {
    this.registry = registry;
    this.themeEngine = themeEngine;
  }

  buildCodePreview(component) {
    const code = this.generateComponentCode(component);

    return {
      type: 'flex',
      direction: 'column',
      gap: this.themeEngine.getSpacing('md'),
      style: { padding: this.themeEngine.getSpacing('lg') },
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
              onClick: () => this.copyToClipboard(code),
              variant: 'primary'
            },
            {
              type: 'button',
              label: '📥 Export JSON',
              onClick: () => this.exportJSON(component),
              variant: 'secondary'
            }
          ]
        }
      ]
    };
  }

  generateComponentCode(component, indent = 0) {
    const spaces = '  '.repeat(indent);
    const nextSpaces = '  '.repeat(indent + 1);

    let code = `{\n`;
    code += `${nextSpaces}type: '${component.type}',\n`;

    if (Object.keys(component.props || {}).length > 0) {
      code += `${nextSpaces}props: {\n`;
      Object.entries(component.props).forEach(([key, value]) => {
        const valueStr = typeof value === 'string' ? `'${value}'` : JSON.stringify(value);
        code += `${nextSpaces}  ${key}: ${valueStr},\n`;
      });
      code += `${nextSpaces}},\n`;
    }

    if (component.style && Object.keys(component.style).length > 0) {
      code += `${nextSpaces}style: ${JSON.stringify(component.style)},\n`;
    }

    if (component.content) {
      code += `${nextSpaces}content: '${component.content}',\n`;
    }

    if (component.children && component.children.length > 0) {
      code += `${nextSpaces}children: [\n`;
      component.children.forEach((child, idx) => {
        code += `${this.generateComponentCode(child, indent + 2)}${idx < component.children.length - 1 ? ',' : ''}\n`;
      });
      code += `${nextSpaces}]\n`;
    }

    code += `${spaces}}`;
    return code;
  }

  copyToClipboard(text) {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        console.log('Code copied to clipboard');
      });
    }
  }

  exportJSON(component) {
    const json = JSON.stringify(component, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `component-${component.type}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }
}

export const createEnhancedPropertyEditor = (registry, themeEngine) =>
  new EnhancedPropertyEditor(registry, themeEngine);

export const createLiveCodePreview = (registry, themeEngine) =>
  new LiveCodePreview(registry, themeEngine);
