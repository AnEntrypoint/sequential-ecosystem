// History layer - undo/redo and change tracking
export class PatternEditorHistory {
  constructor() {
    this.undoStack = [];
    this.redoStack = [];
  }

  saveToUndoStack(definition) {
    this.undoStack.push(JSON.parse(JSON.stringify(definition)));
    this.redoStack = [];
    if (this.undoStack.length > 50) {
      this.undoStack.shift();
    }
  }

  undo(definition) {
    if (this.undoStack.length === 0) return null;
    this.redoStack.push(JSON.parse(JSON.stringify(definition)));
    return this.undoStack.pop();
  }

  redo(definition) {
    if (this.redoStack.length === 0) return null;
    this.undoStack.push(JSON.parse(JSON.stringify(definition)));
    return this.redoStack.pop();
  }

  hasChanges(definition, originalDefinition) {
    return JSON.stringify(definition) !== JSON.stringify(originalDefinition);
  }

  reset() {
    this.undoStack = [];
    this.redoStack = [];
  }

  clear() {
    this.undoStack = [];
    this.redoStack = [];
  }
}
