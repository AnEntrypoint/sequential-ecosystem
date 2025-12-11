export class UndoRedoManager {
  constructor(maxSize = 100) {
    this.undoStack = [];
    this.redoStack = [];
    this.maxSize = maxSize;
  }

  push(state) {
    this.undoStack.push(state);
    this.redoStack = [];

    if (this.undoStack.length > this.maxSize) {
      this.undoStack.shift();
    }
  }

  undo() {
    if (this.undoStack.length === 0) return null;

    const current = this.undoStack.pop();
    this.redoStack.push(current);
    return this.undoStack[this.undoStack.length - 1] || null;
  }

  redo() {
    if (this.redoStack.length === 0) return null;

    const state = this.redoStack.pop();
    this.undoStack.push(state);
    return state;
  }

  canUndo() {
    return this.undoStack.length > 0;
  }

  canRedo() {
    return this.redoStack.length > 0;
  }

  clear() {
    this.undoStack = [];
    this.redoStack = [];
  }

  getUndoCount() {
    return this.undoStack.length;
  }

  getRedoCount() {
    return this.redoStack.length;
  }
}

export class StateTracker {
  constructor(initialState = {}) {
    this.state = JSON.parse(JSON.stringify(initialState));
    this.listeners = [];
  }

  setState(newState) {
    const oldState = this.state;
    this.state = { ...this.state, ...newState };
    this.notifyListeners(oldState, this.state);
    return this;
  }

  getState(key) {
    return key ? this.state[key] : this.state;
  }

  resetState(initialState = {}) {
    this.state = JSON.parse(JSON.stringify(initialState));
    return this;
  }

  onChange(callback) {
    this.listeners.push(callback);
    return this;
  }

  notifyListeners(oldState, newState) {
    this.listeners.forEach(callback => {
      try {
        callback(newState, oldState);
      } catch (e) {
        console.error('State change listener error:', e);
      }
    });
  }

  clear() {
    this.listeners = [];
  }
}
