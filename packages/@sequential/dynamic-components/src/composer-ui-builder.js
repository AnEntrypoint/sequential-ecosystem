// UI builder for canvas and properties panel
export class ComposerUIBuilder {
  constructor(componentManager, canvasManager) {
    this.componentManager = componentManager;
    this.canvasManager = canvasManager;
  }

  buildCanvasUI() {
    const componentElements = Array.from(this.componentManager.components.values())
      .filter(c => c.type !== 'group')
      .sort((a, b) => a.zIndex - b.zIndex)
      .map(comp => ({
        type: 'box',
        style: {
          position: 'absolute',
          left: `${comp.position.x}px`,
          top: `${comp.position.y}px`,
          width: `${comp.size.width}px`,
          height: `${comp.size.height}px`,
          background: comp.selected ? '#667eea' : '#2d2d30',
          border: comp.selected ? '2px solid #667eea' : '1px solid #3e3e42',
          borderRadius: '4px',
          cursor: 'move',
          zIndex: comp.zIndex,
          padding: '8px',
          boxSizing: 'border-box'
        },
        children: [{
          type: 'paragraph',
          content: comp.name || comp.type,
          style: {
            margin: 0,
            fontSize: '12px',
            color: comp.selected ? '#fff' : '#d4d4d4'
          }
        }]
      }));

    return {
      type: 'box',
      style: {
        position: 'relative',
        width: `${this.canvasManager.canvas?.width || 800}px`,
        height: `${this.canvasManager.canvas?.height || 600}px`,
        background: '#1a1a1a',
        border: '1px solid #3e3e42',
        borderRadius: '6px',
        overflow: 'hidden',
        backgroundImage: this.canvasManager.grid.enabled
          ? `linear-gradient(90deg, transparent ${this.canvasManager.grid.size - 1}px, #333 ${this.canvasManager.grid.size - 1}px, #333 ${this.canvasManager.grid.size}px),
             linear-gradient(0deg, transparent ${this.canvasManager.grid.size - 1}px, #333 ${this.canvasManager.grid.size - 1}px, #333 ${this.canvasManager.grid.size}px)`
          : 'none',
        backgroundSize: this.canvasManager.grid.enabled ? `${this.canvasManager.grid.size}px ${this.canvasManager.grid.size}px` : 'auto'
      },
      children: componentElements
    };
  }

  buildPropertiesPanel() {
    if (!this.componentManager.selectedComponent) {
      return {
        type: 'box',
        style: { padding: '12px', background: '#1e1e1e', borderRadius: '6px' },
        children: [{
          type: 'paragraph',
          content: 'Select a component to edit properties',
          style: { margin: 0, fontSize: '11px', color: '#858585' }
        }]
      };
    }

    const comp = this.componentManager.selectedComponent;
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
          content: comp.name || 'Component',
          level: 3,
          style: { margin: 0, fontSize: '12px', color: '#667eea' }
        },
        {
          type: 'box',
          style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' },
          children: [
            this.buildPropertyField('X', comp.position.x),
            this.buildPropertyField('Y', comp.position.y),
            this.buildPropertyField('Width', comp.size.width),
            this.buildPropertyField('Height', comp.size.height),
            this.buildPropertyField('Z-Index', comp.zIndex)
          ]
        }
      ]
    };
  }

  buildPropertyField(label, value) {
    return {
      type: 'box',
      style: { display: 'flex', flexDirection: 'column', gap: '4px' },
      children: [
        {
          type: 'paragraph',
          content: label,
          style: { margin: 0, fontSize: '9px', color: '#858585' }
        },
        {
          type: 'box',
          style: {
            padding: '6px 8px',
            background: '#2d2d30',
            borderRadius: '3px',
            border: '1px solid #3e3e42',
            fontSize: '11px',
            color: '#d4d4d4'
          },
          children: [{
            type: 'paragraph',
            content: String(value),
            style: { margin: 0 }
          }]
        }
      ]
    };
  }
}
