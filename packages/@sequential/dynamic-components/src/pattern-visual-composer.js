class PatternVisualComposer {
  constructor() {
    this.canvas = null;
    this.components = new Map();
    this.layout = null;
    this.selectedComponent = null;
    this.clipboard = null;
    this.history = [];
    this.historyIndex = 0;
    this.grid = { enabled: true, size: 8 };
    this.zoom = 1;
    this.pan = { x: 0, y: 0 };
  }

  createCanvas(width = 800, height = 600) {
    this.canvas = {
      width,
      height,
      backgroundColor: '#ffffff',
      components: [],
      grid: this.grid,
      created: Date.now()
    };
    this.layout = { type: 'absolute', children: [] };
    return this.canvas;
  }

  addComponent(componentDef, x = 0, y = 0) {
    const component = {
      id: `comp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ...componentDef,
      position: { x: this.snapToGrid(x), y: this.snapToGrid(y) },
      size: componentDef.size || { width: 100, height: 50 },
      zIndex: this.canvas?.components?.length || 0,
      selected: false,
      locked: false
    };

    if (this.canvas) {
      this.canvas.components.push(component);
    }
    this.components.set(component.id, component);
    this.saveHistory();

    return component;
  }

  removeComponent(componentId) {
    this.components.delete(componentId);
    if (this.canvas) {
      this.canvas.components = this.canvas.components.filter(c => c.id !== componentId);
    }
    if (this.selectedComponent?.id === componentId) {
      this.selectedComponent = null;
    }
    this.saveHistory();
  }

  moveComponent(componentId, x, y) {
    const component = this.components.get(componentId);
    if (!component) return false;

    component.position.x = this.snapToGrid(x);
    component.position.y = this.snapToGrid(y);
    this.saveHistory();
    return true;
  }

  resizeComponent(componentId, width, height) {
    const component = this.components.get(componentId);
    if (!component) return false;

    component.size.width = this.snapToGrid(Math.max(width, 50));
    component.size.height = this.snapToGrid(Math.max(height, 30));
    this.saveHistory();
    return true;
  }

  selectComponent(componentId) {
    if (this.selectedComponent?.id) {
      this.selectedComponent.selected = false;
    }
    const component = this.components.get(componentId);
    if (component) {
      component.selected = true;
      this.selectedComponent = component;
    }
  }

  snapToGrid(value) {
    if (!this.grid.enabled) return value;
    return Math.round(value / this.grid.size) * this.grid.size;
  }

  setComponentProperty(componentId, property, value) {
    const component = this.components.get(componentId);
    if (!component) return false;

    const props = property.split('.');
    let target = component;

    for (let i = 0; i < props.length - 1; i++) {
      if (!target[props[i]]) {
        target[props[i]] = {};
      }
      target = target[props[i]];
    }

    target[props[props.length - 1]] = value;
    this.saveHistory();
    return true;
  }

  getComponentProperty(componentId, property) {
    const component = this.components.get(componentId);
    if (!component) return null;

    const props = property.split('.');
    let target = component;

    for (const prop of props) {
      if (target && typeof target === 'object') {
        target = target[prop];
      } else {
        return null;
      }
    }

    return target;
  }

  alignComponents(componentIds, direction) {
    const components = componentIds.map(id => this.components.get(id)).filter(Boolean);
    if (components.length < 2) return false;

    const positions = components.map(c => c.position);

    switch (direction) {
      case 'left':
        const minX = Math.min(...positions.map(p => p.x));
        components.forEach(c => c.position.x = minX);
        break;
      case 'right':
        const maxX = Math.max(...positions.map(p => p.x));
        components.forEach(c => c.position.x = maxX);
        break;
      case 'top':
        const minY = Math.min(...positions.map(p => p.y));
        components.forEach(c => c.position.y = minY);
        break;
      case 'bottom':
        const maxY = Math.max(...positions.map(p => p.y));
        components.forEach(c => c.position.y = maxY);
        break;
      case 'center-h':
        const centerX = (Math.max(...positions.map(p => p.x)) + Math.min(...positions.map(p => p.x))) / 2;
        components.forEach(c => c.position.x = centerX - c.size.width / 2);
        break;
      case 'center-v':
        const centerY = (Math.max(...positions.map(p => p.y)) + Math.min(...positions.map(p => p.y))) / 2);
        components.forEach(c => c.position.y = centerY - c.size.height / 2);
        break;
      case 'space-h':
        this.distributeComponentsHorizontally(components);
        break;
      case 'space-v':
        this.distributeComponentsVertically(components);
        break;
    }

    this.saveHistory();
    return true;
  }

  distributeComponentsHorizontally(components) {
    const sorted = [...components].sort((a, b) => a.position.x - b.position.x);
    const minX = sorted[0].position.x;
    const maxX = sorted[sorted.length - 1].position.x;
    const gap = (maxX - minX) / (sorted.length - 1);

    sorted.forEach((c, idx) => {
      c.position.x = minX + gap * idx;
    });
  }

  distributeComponentsVertically(components) {
    const sorted = [...components].sort((a, b) => a.position.y - b.position.y);
    const minY = sorted[0].position.y;
    const maxY = sorted[sorted.length - 1].position.y;
    const gap = (maxY - minY) / (sorted.length - 1);

    sorted.forEach((c, idx) => {
      c.position.y = minY + gap * idx;
    });
  }

  groupComponents(componentIds) {
    const components = componentIds.map(id => this.components.get(id)).filter(Boolean);
    if (components.length < 2) return null;

    const minX = Math.min(...components.map(c => c.position.x));
    const minY = Math.min(...components.map(c => c.position.y));
    const maxX = Math.max(...components.map(c => c.position.x + c.size.width));
    const maxY = Math.max(...components.map(c => c.position.y + c.size.height));

    const group = {
      id: `group-${Date.now()}`,
      type: 'group',
      position: { x: minX, y: minY },
      size: { width: maxX - minX, height: maxY - minY },
      children: componentIds,
      locked: false
    };

    this.components.set(group.id, group);
    this.saveHistory();
    return group;
  }

  copyComponent(componentId) {
    const component = this.components.get(componentId);
    if (!component) return false;

    this.clipboard = JSON.parse(JSON.stringify(component));
    return true;
  }

  pasteComponent() {
    if (!this.clipboard) return null;

    const pasted = JSON.parse(JSON.stringify(this.clipboard));
    pasted.id = `comp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    pasted.position.x += 10;
    pasted.position.y += 10;

    this.components.set(pasted.id, pasted);
    if (this.canvas) {
      this.canvas.components.push(pasted);
    }
    this.saveHistory();

    return pasted;
  }

  saveHistory() {
    this.history = this.history.slice(0, this.historyIndex + 1);
    this.history.push(JSON.parse(JSON.stringify({
      components: Array.from(this.components.values()),
      canvas: this.canvas,
      timestamp: Date.now()
    })));
    this.historyIndex++;
  }

  undo() {
    if (this.historyIndex > 0) {
      this.historyIndex--;
      this.restoreFromHistory();
      return true;
    }
    return false;
  }

  redo() {
    if (this.historyIndex < this.history.length - 1) {
      this.historyIndex++;
      this.restoreFromHistory();
      return true;
    }
    return false;
  }

  restoreFromHistory() {
    const state = this.history[this.historyIndex];
    this.components.clear();
    state.components.forEach(comp => {
      this.components.set(comp.id, comp);
    });
    this.canvas = state.canvas;
  }

  buildCanvasUI() {
    const componentElements = Array.from(this.components.values())
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
        width: `${this.canvas?.width || 800}px`,
        height: `${this.canvas?.height || 600}px`,
        background: '#1a1a1a',
        border: '1px solid #3e3e42',
        borderRadius: '6px',
        overflow: 'hidden',
        backgroundImage: this.grid.enabled
          ? `linear-gradient(90deg, transparent ${this.grid.size - 1}px, #333 ${this.grid.size - 1}px, #333 ${this.grid.size}px),
             linear-gradient(0deg, transparent ${this.grid.size - 1}px, #333 ${this.grid.size - 1}px, #333 ${this.grid.size}px)`
          : 'none',
        backgroundSize: this.grid.enabled ? `${this.grid.size}px ${this.grid.size}px` : 'auto'
      },
      children: componentElements
    };
  }

  buildPropertiesPanel() {
    if (!this.selectedComponent) {
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

    const comp = this.selectedComponent;
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

  exportComposition() {
    return {
      canvas: this.canvas,
      components: Array.from(this.components.entries()).map(([id, comp]) => ({
        id,
        ...comp
      })),
      exportedAt: new Date().toISOString()
    };
  }

  importComposition(data) {
    this.canvas = data.canvas;
    this.components.clear();
    data.components.forEach(comp => {
      this.components.set(comp.id, comp);
    });
    this.saveHistory();
  }

  getCompositionJSON() {
    const comp = this.selectedComponent;
    if (!comp) return null;

    return {
      type: comp.type,
      style: {
        position: 'absolute',
        left: `${comp.position.x}px`,
        top: `${comp.position.y}px`,
        width: `${comp.size.width}px`,
        height: `${comp.size.height}px`,
        ...comp.style
      },
      content: comp.content,
      children: comp.children
    };
  }
}

function createPatternVisualComposer() {
  return new PatternVisualComposer();
}

export { PatternVisualComposer, createPatternVisualComposer };
