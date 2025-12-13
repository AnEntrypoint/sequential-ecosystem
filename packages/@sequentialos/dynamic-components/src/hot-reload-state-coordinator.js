/**
 * Hot Reload State Coordinator
 * Coordinates state operations across core and history
 */

export class HotReloadStateCoordinator {
  constructor(core, history) {
    this.core = core;
    this.history = history;
  }

  /**
   * Undo changes
   */
  undo(steps = 1) {
    const result = this.history.undo(steps);
    if (result.success) {
      this.core.currentComponent = result.snapshot;
      this.core.render();
      return result;
    }
    return { success: false };
  }

  /**
   * Redo changes
   */
  redo(steps = 1) {
    const result = this.history.redo(steps);
    if (result.success) {
      this.core.currentComponent = result.snapshot;
      this.core.render();
      return result;
    }
    return { success: false };
  }

  /**
   * Jump to history point
   */
  jumpToHistory(index) {
    const result = this.history.jumpToHistory(index);
    if (result.success) {
      this.core.currentComponent = result.snapshot;
      this.core.render();
      return result;
    }
    return { success: false };
  }

  /**
   * Import state
   */
  importState(state) {
    const component = this.history.importState(state);
    if (component) {
      this.core.currentComponent = component;
      this.core.render();
    }
    return component;
  }

  /**
   * Export current state
   */
  exportState() {
    return this.history.exportState(this.core.currentComponent);
  }
}
