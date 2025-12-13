// Component palette builder for visual builder
export class VisualPalette {
  constructor(themeEngine) {
    this.themeEngine = themeEngine;
    this.listeners = new Map();
  }

  emit(event, data) {
    const callbacks = this.listeners.get(event) || [];
    callbacks.forEach(cb => cb(data));
  }

  addComponentToCanvas(componentType) {
    this.emit('componentAdded', { type: componentType });
  }

  buildComponentPalette() {
    const categories = {
      'Layout': ['flex', 'grid', 'container', 'spacer'],
      'Input': ['input', 'button', 'textarea', 'select'],
      'Display': ['heading', 'paragraph', 'card', 'badge'],
      'Navigation': ['tabs-nav', 'breadcrumb', 'pagination'],
      'Feedback': ['alert', 'tooltip', 'skeleton-loader'],
      'Data': ['data-table', 'stat-card', 'progress-ring']
    };

    return {
      type: 'flex',
      direction: 'column',
      gap: this.themeEngine.getSpacing('md'),
      style: {
        padding: this.themeEngine.getSpacing('lg'),
        borderRight: `1px solid ${this.themeEngine.getColor('border')}`
      },
      children: Object.entries(categories).map(([cat, items]) => ({
        type: 'flex',
        direction: 'column',
        gap: this.themeEngine.getSpacing('sm'),
        children: [
          {
            type: 'paragraph',
            content: cat,
            style: {
              fontWeight: '600',
              fontSize: '12px',
              color: this.themeEngine.getColor('textMuted'),
              textTransform: 'uppercase',
              marginBottom: this.themeEngine.getSpacing('xs')
            }
          },
          {
            type: 'flex',
            direction: 'column',
            gap: this.themeEngine.getSpacing('xs'),
            children: items.map(item => ({
              type: 'button',
              label: item,
              onClick: () => this.addComponentToCanvas(item),
              variant: 'flat',
              style: {
                width: '100%',
                textAlign: 'left',
                cursor: 'grab'
              }
            }))
          }
        ]
      }))
    };
  }
}
