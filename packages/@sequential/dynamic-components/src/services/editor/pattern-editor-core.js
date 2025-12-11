export class PatternEditorCore {
  constructor() {
    this.currentPattern = null;
    this.editorState = {
      selectedPath: null,
      selectedElement: null,
      editMode: 'visual',
      zoom: 100,
      showGrid: false
    };
    this.undoStack = [];
    this.redoStack = [];
    this.listeners = [];
  }

  openPattern(patternId, definition) {
    this.currentPattern = {
      id: patternId,
      definition: JSON.parse(JSON.stringify(definition)),
      originalDefinition: JSON.parse(JSON.stringify(definition))
    };
    this.undoStack = [];
    this.redoStack = [];
    this.editorState.selectedPath = null;
    this.editorState.selectedElement = null;
    this.notifyListeners('patternOpened', { patternId, definition });
    return this.currentPattern;
  }

  selectElement(path) {
    const element = this.getElementByPath(this.currentPattern.definition, path);
    if (!element) return false;
    this.editorState.selectedPath = path;
    this.editorState.selectedElement = element;
    this.notifyListeners('elementSelected', { path, element });
    return true;
  }

  getElementByPath(definition, path) {
    if (!path) return definition;
    const parts = path.split('.');
    let current = definition;
    for (const part of parts) {
      if (part.startsWith('children[')) {
        const match = part.match(/children\[(\d+)\]/);
        if (match) {
          const index = parseInt(match[1], 10);
          current = current.children?.[index];
        }
      } else {
        current = current[part];
      }
      if (!current) return null;
    }
    return current;
  }

  updateElementStyle(path, styleUpdates) {
    const element = this.getElementByPath(this.currentPattern.definition, path);
    if (!element) return false;
    this.saveToUndoStack();
    element.style = { ...element.style, ...styleUpdates };
    this.notifyListeners('styleUpdated', { path, styleUpdates });
    return true;
  }

  updateElementContent(path, content) {
    const element = this.getElementByPath(this.currentPattern.definition, path);
    if (!element) return false;
    this.saveToUndoStack();
    element.content = content;
    this.notifyListeners('contentUpdated', { path, content });
    return true;
  }

  updateElementAttributes(path, attributes) {
    const element = this.getElementByPath(this.currentPattern.definition, path);
    if (!element) return false;
    this.saveToUndoStack();
    element.attributes = { ...element.attributes, ...attributes };
    this.notifyListeners('attributesUpdated', { path, attributes });
    return true;
  }

  addChild(parentPath, childDefinition) {
    const parent = parentPath
      ? this.getElementByPath(this.currentPattern.definition, parentPath)
      : this.currentPattern.definition;
    if (!parent) return false;
    this.saveToUndoStack();
    if (!parent.children) {
      parent.children = [];
    }
    parent.children.push(JSON.parse(JSON.stringify(childDefinition)));
    this.notifyListeners('childAdded', { parentPath, childDefinition });
    return true;
  }

  removeElement(path) {
    if (!path) return false;
    const parts = path.split('.');
    const lastPart = parts.pop();
    const parentPath = parts.join('.');
    const parent = parentPath
      ? this.getElementByPath(this.currentPattern.definition, parentPath)
      : this.currentPattern.definition;
    if (!parent) return false;
    this.saveToUndoStack();
    if (lastPart.startsWith('children[')) {
      const match = lastPart.match(/children\[(\d+)\]/);
      if (match) {
        const index = parseInt(match[1], 10);
        parent.children?.splice(index, 1);
      }
    } else {
      delete parent[lastPart];
    }
    this.notifyListeners('elementRemoved', { path });
    return true;
  }

  duplicateElement(path) {
    const element = this.getElementByPath(this.currentPattern.definition, path);
    if (!element) return false;
    const parts = path.split('.');
    const lastPart = parts.pop();
    const parentPath = parts.join('.');
    const parent = parentPath
      ? this.getElementByPath(this.currentPattern.definition, parentPath)
      : this.currentPattern.definition;
    if (!parent) return false;
    this.saveToUndoStack();
    const duplicate = JSON.parse(JSON.stringify(element));
    if (lastPart.startsWith('children[')) {
      const match = lastPart.match(/children\[(\d+)\]/);
      if (match) {
        const index = parseInt(match[1], 10);
        parent.children?.splice(index + 1, 0, duplicate);
      }
    }
    this.notifyListeners('elementDuplicated', { path });
    return true;
  }

  saveToUndoStack() {
    this.undoStack.push(JSON.parse(JSON.stringify(this.currentPattern.definition)));
    this.redoStack = [];
    if (this.undoStack.length > 50) {
      this.undoStack.shift();
    }
  }

  undo() {
    if (this.undoStack.length === 0) return false;
    this.redoStack.push(JSON.parse(JSON.stringify(this.currentPattern.definition)));
    this.currentPattern.definition = this.undoStack.pop();
    this.notifyListeners('undo', {});
    return true;
  }

  redo() {
    if (this.redoStack.length === 0) return false;
    this.undoStack.push(JSON.parse(JSON.stringify(this.currentPattern.definition)));
    this.currentPattern.definition = this.redoStack.pop();
    this.notifyListeners('redo', {});
    return true;
  }

  resetToOriginal() {
    this.currentPattern.definition = JSON.parse(JSON.stringify(this.currentPattern.originalDefinition));
    this.undoStack = [];
    this.redoStack = [];
    this.notifyListeners('resetToOriginal', {});
    return true;
  }

  getCurrentDefinition() {
    return this.currentPattern?.definition || null;
  }

  hasChanges() {
    if (!this.currentPattern) return false;
    return JSON.stringify(this.currentPattern.definition) !==
           JSON.stringify(this.currentPattern.originalDefinition);
  }

  on(event, callback) {
    this.listeners.push({ event, callback });
    return this;
  }

  off(event, callback) {
    this.listeners = this.listeners.filter(
      l => !(l.event === event && l.callback === callback)
    );
    return this;
  }

  notifyListeners(event, data) {
    this.listeners
      .filter(l => l.event === event)
      .forEach(l => {
        try {
          l.callback(data);
        } catch (e) {
          console.error(`Pattern editor listener error for ${event}:`, e);
        }
      });
  }

  clear() {
    this.currentPattern = null;
    this.listeners = [];
    this.undoStack = [];
    this.redoStack = [];
    return this;
  }
}
