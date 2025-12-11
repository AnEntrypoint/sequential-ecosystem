// Component copy/paste clipboard
export class ComponentClipboard {
  constructor(componentManager, canvasManager) {
    this.componentManager = componentManager;
    this.canvasManager = canvasManager;
    this.clipboard = null;
  }

  copyComponent(componentId) {
    const component = this.componentManager.components.get(componentId);
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

    this.componentManager.components.set(pasted.id, pasted);
    if (this.canvasManager.canvas) {
      this.canvasManager.canvas.components.push(pasted);
    }

    return pasted;
  }

  clear() {
    this.clipboard = null;
  }
}
