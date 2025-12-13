// Component lifecycle and property management
export class ComponentManager {
  constructor(canvasManager) {
    this.canvasManager = canvasManager;
    this.components = new Map();
    this.selectedComponent = null;
  }

  addComponent(componentDef, x = 0, y = 0) {
    const component = {
      id: `comp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ...componentDef,
      position: { x: this.canvasManager.snapToGrid(x), y: this.canvasManager.snapToGrid(y) },
      size: componentDef.size || { width: 100, height: 50 },
      zIndex: this.canvasManager.canvas?.components?.length || 0,
      selected: false,
      locked: false
    };

    if (this.canvasManager.canvas) {
      this.canvasManager.canvas.components.push(component);
    }
    this.components.set(component.id, component);
    return component;
  }

  removeComponent(componentId) {
    this.components.delete(componentId);
    if (this.canvasManager.canvas) {
      this.canvasManager.canvas.components = this.canvasManager.canvas.components.filter(c => c.id !== componentId);
    }
    if (this.selectedComponent?.id === componentId) {
      this.selectedComponent = null;
    }
  }

  moveComponent(componentId, x, y) {
    const component = this.components.get(componentId);
    if (!component) return false;

    component.position.x = this.canvasManager.snapToGrid(x);
    component.position.y = this.canvasManager.snapToGrid(y);
    return true;
  }

  resizeComponent(componentId, width, height) {
    const component = this.components.get(componentId);
    if (!component) return false;

    component.size.width = this.canvasManager.snapToGrid(Math.max(width, 50));
    component.size.height = this.canvasManager.snapToGrid(Math.max(height, 30));
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

  getComponent(componentId) {
    return this.components.get(componentId);
  }

  getAllComponents() {
    return Array.from(this.components.values());
  }

  clear() {
    this.components.clear();
    this.selectedComponent = null;
  }
}
