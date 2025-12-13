// Component property schema and validation
export class ComponentPropertyEditor {
  constructor(component, registry) {
    this.component = component;
    this.registry = registry;
  }

  getPropertySchema() {
    const meta = this.registry.metadata.get(this.component.type) || {};
    return {
      type: this.component.type,
      description: meta.description || '',
      properties: this.getComponentProperties()
    };
  }

  getComponentProperties() {
    const commonProps = {
      className: { type: 'string', label: 'CSS Classes', hint: 'Space-separated class names' },
      style: { type: 'object', label: 'Inline Styles', hint: 'CSS style object' }
    };

    const typeSpecificProps = {
      heading: {
        content: { type: 'string', label: 'Content', required: true },
        level: { type: 'number', label: 'Level', min: 1, max: 6 },
        variant: { type: 'select', label: 'Variant', options: ['h1', 'h2', 'h3', 'highlight'] }
      },
      button: {
        label: { type: 'string', label: 'Label', required: true },
        variant: { type: 'select', label: 'Variant', options: ['primary', 'secondary', 'danger', 'outline'] },
        disabled: { type: 'boolean', label: 'Disabled' }
      },
      input: {
        placeholder: { type: 'string', label: 'Placeholder' },
        type: { type: 'select', label: 'Type', options: ['text', 'email', 'password', 'number', 'date'] },
        value: { type: 'string', label: 'Value' },
        disabled: { type: 'boolean', label: 'Disabled' }
      },
      card: {
        title: { type: 'string', label: 'Title' },
        content: { type: 'string', label: 'Content' },
        variant: { type: 'select', label: 'Variant', options: ['default', 'elevated', 'flat'] }
      },
      flex: {
        direction: { type: 'select', label: 'Direction', options: ['row', 'column'] },
        gap: { type: 'string', label: 'Gap', hint: 'e.g., "12px"' },
        align: { type: 'select', label: 'Align Items', options: ['stretch', 'center', 'flex-start', 'flex-end'] }
      },
      grid: {
        cols: { type: 'string', label: 'Columns', hint: 'e.g., "1fr 1fr"' },
        rows: { type: 'string', label: 'Rows', hint: 'e.g., "auto 1fr"' },
        gap: { type: 'string', label: 'Gap', hint: 'e.g., "16px"' }
      }
    };

    return { ...commonProps, ...(typeSpecificProps[this.component.type] || {}) };
  }

  validateProperty(propName, value) {
    const schema = this.getComponentProperties();
    const propSchema = schema[propName];
    if (!propSchema) return { valid: true };

    if (propSchema.required && !value) {
      return { valid: false, error: `${propName} is required` };
    }

    if (propSchema.type === 'number') {
      const num = Number(value);
      if (isNaN(num)) return { valid: false, error: 'Must be a number' };
      if (propSchema.min !== undefined && num < propSchema.min) {
        return { valid: false, error: `Minimum value is ${propSchema.min}` };
      }
      if (propSchema.max !== undefined && num > propSchema.max) {
        return { valid: false, error: `Maximum value is ${propSchema.max}` };
      }
    }

    if (propSchema.type === 'select' && propSchema.options) {
      if (!propSchema.options.includes(value)) {
        return { valid: false, error: `Must be one of: ${propSchema.options.join(', ')}` };
      }
    }

    return { valid: true };
  }

  getPropertyHint(propName) {
    const schema = this.getComponentProperties();
    const propSchema = schema[propName];
    if (!propSchema) return '';

    let hint = propSchema.hint || '';
    if (propSchema.required) hint = '* ' + hint;
    if (propSchema.options) hint += ` (${propSchema.options.join(' | ')})`;
    return hint;
  }
}
