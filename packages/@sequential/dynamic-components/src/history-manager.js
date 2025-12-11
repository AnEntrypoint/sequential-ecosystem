// Undo/redo history management
export class HistoryManager {
  constructor(componentManager, canvasManager) {
    this.componentManager = componentManager;
    this.canvasManager = canvasManager;
    this.history = [];
    this.historyIndex = 0;
  }

  saveState() {
    this.history = this.history.slice(0, this.historyIndex + 1);
    this.history.push(JSON.parse(JSON.stringify({
      components: Array.from(this.componentManager.components.values()),
      canvas: this.canvasManager.canvas,
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
    this.componentManager.components.clear();
    state.components.forEach(comp => {
      this.componentManager.components.set(comp.id, comp);
    });
    this.canvasManager.canvas = state.canvas;
  }

  clear() {
    this.history = [];
    this.historyIndex = 0;
  }
}
