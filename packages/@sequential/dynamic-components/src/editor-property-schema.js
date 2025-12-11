// Component property schema definitions
export class EditorPropertySchema {
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
