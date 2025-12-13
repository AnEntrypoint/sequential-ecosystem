// Composition export, import, and serialization
export class CompositionPersistence {
  constructor(componentManager, canvasManager) {
    this.componentManager = componentManager;
    this.canvasManager = canvasManager;
  }

  exportComposition() {
    return {
      canvas: this.canvasManager.canvas,
      components: Array.from(this.componentManager.components.entries()).map(([id, comp]) => ({
        id,
        ...comp
      })),
      exportedAt: new Date().toISOString()
    };
  }

  importComposition(data) {
    this.canvasManager.canvas = data.canvas;
    this.componentManager.components.clear();
    data.components.forEach(comp => {
      this.componentManager.components.set(comp.id, comp);
    });
  }

  getCompositionJSON() {
    const comp = this.componentManager.selectedComponent;
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
