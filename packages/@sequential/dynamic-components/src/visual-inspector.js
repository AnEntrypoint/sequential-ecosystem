// Property inspector and preview for visual builder
export class VisualInspector {
  constructor(themeEngine) {
    this.themeEngine = themeEngine;
    this.listeners = new Map();
  }

  emit(event, data) {
    const callbacks = this.listeners.get(event) || [];
    callbacks.forEach(cb => cb(data));
  }

  buildPropertyInspector(component) {
    if (!component) {
      return {
        type: 'paragraph',
        content: 'Select component to inspect',
        style: { padding: this.themeEngine.getSpacing('lg'), color: this.themeEngine.getColor('textMuted') }
      };
    }

    return {
      type: 'flex',
      direction: 'column',
      gap: this.themeEngine.getSpacing('md'),
      style: { padding: this.themeEngine.getSpacing('lg') },
      children: [
        {
          type: 'heading',
          content: `${component.type} Properties`,
          level: 4
        },
        ...this.buildPropertyFields(component),
        {
          type: 'flex',
          direction: 'row',
          gap: this.themeEngine.getSpacing('sm'),
          style: { marginTop: this.themeEngine.getSpacing('md') },
          children: [
            {
              type: 'button',
              label: 'Delete',
              onClick: () => this.emit('componentDeleted', { id: component.id }),
              variant: 'danger'
            },
            {
              type: 'button',
              label: 'Duplicate',
              onClick: () => this.emit('componentDuplicated', { id: component.id }),
              variant: 'secondary'
            }
          ]
        }
      ]
    };
  }

  buildPropertyFields(component) {
    const commonFields = [
      { name: 'className', label: 'CSS Classes', type: 'text' },
      { name: 'padding', label: 'Padding', type: 'text', hint: 'e.g., "8px" or "md"' },
      { name: 'margin', label: 'Margin', type: 'text', hint: 'e.g., "8px" or "md"' },
      { name: 'width', label: 'Width', type: 'text', hint: 'e.g., "100%" or "200px"' },
      { name: 'height', label: 'Height', type: 'text', hint: 'e.g., "auto" or "200px"' }
    ];

    return commonFields.map(field => ({
      type: 'flex',
      direction: 'column',
      gap: this.themeEngine.getSpacing('xs'),
      children: [
        {
          type: 'paragraph',
          content: field.label,
          style: { fontSize: '12px', fontWeight: '500' }
        },
        {
          type: 'input',
          value: component.props?.[field.name] || '',
          placeholder: field.hint || '',
          onChange: (value) => this.emit('propertyChanged', {
            id: component.id,
            prop: field.name,
            value
          }),
          style: { width: '100%' }
        }
      ]
    }));
  }

  buildLivePreview(component) {
    if (!component) {
      return {
        type: 'flex',
        direction: 'column',
        style: {
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          background: this.themeEngine.getColor('backgroundLight'),
          padding: this.themeEngine.getSpacing('lg')
        },
        children: [{
          type: 'paragraph',
          content: 'Select or add a component to preview',
          style: { color: this.themeEngine.getColor('textMuted') }
        }]
      };
    }

    return {
      type: 'flex',
      direction: 'column',
      style: {
        flex: 1,
        padding: this.themeEngine.getSpacing('lg'),
        background: this.themeEngine.getColor('background'),
        border: `2px dashed ${this.themeEngine.getColor('border')}`,
        borderRadius: this.themeEngine.getBorderRadius('md')
      },
      children: [component]
    };
  }
}
