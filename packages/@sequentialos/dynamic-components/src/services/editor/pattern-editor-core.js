// Facade maintaining 100% backward compatibility with pattern editor layers
import { PatternEditorNavigation } from './pattern-editor-navigation.js';
import { PatternEditorMutations } from './pattern-editor-mutations.js';
import { PatternEditorHistory } from './pattern-editor-history.js';

export class PatternEditorCore {
  constructor() {
    this.navigation = new PatternEditorNavigation();
    this.mutations = new PatternEditorMutations(this.navigation);
    this.history = new PatternEditorHistory();
    this.editorState = {
      selectedPath: null,
      selectedElement: null,
      editMode: 'visual',
      zoom: 100,
      showGrid: false
    };
    this.listeners = [];
  }

  openPattern(patternId, definition) {
    const pattern = this.navigation.openPattern(patternId, definition);
    this.history.reset();
    this.editorState.selectedPath = null;
    this.editorState.selectedElement = null;
    this.notifyListeners('patternOpened', { patternId, definition });
    return pattern;
  }

  selectElement(path) {
    const result = this.mutations.selectElement(path);
    if (!result) return false;
    this.editorState.selectedPath = result.path;
    this.editorState.selectedElement = result.element;
    this.notifyListeners('elementSelected', result);
    return true;
  }

  getElementByPath(definition, path) {
    return this.navigation.getElementByPath(definition, path);
  }

  updateElementStyle(path, styleUpdates) {
    this.history.saveToUndoStack(this.navigation.currentPattern.definition);
    const result = this.mutations.updateElementStyle(path, styleUpdates);
    if (result) {
      this.notifyListeners('styleUpdated', { path, styleUpdates });
    }
    return result;
  }

  updateElementContent(path, content) {
    this.history.saveToUndoStack(this.navigation.currentPattern.definition);
    const result = this.mutations.updateElementContent(path, content);
    if (result) {
      this.notifyListeners('contentUpdated', { path, content });
    }
    return result;
  }

  updateElementAttributes(path, attributes) {
    this.history.saveToUndoStack(this.navigation.currentPattern.definition);
    const result = this.mutations.updateElementAttributes(path, attributes);
    if (result) {
      this.notifyListeners('attributesUpdated', { path, attributes });
    }
    return result;
  }

  addChild(parentPath, childDefinition) {
    this.history.saveToUndoStack(this.navigation.currentPattern.definition);
    const result = this.mutations.addChild(parentPath, childDefinition);
    if (result) {
      this.notifyListeners('childAdded', { parentPath, childDefinition });
    }
    return result;
  }

  removeElement(path) {
    this.history.saveToUndoStack(this.navigation.currentPattern.definition);
    const result = this.mutations.removeElement(path);
    if (result) {
      this.notifyListeners('elementRemoved', { path });
    }
    return result;
  }

  duplicateElement(path) {
    this.history.saveToUndoStack(this.navigation.currentPattern.definition);
    const result = this.mutations.duplicateElement(path);
    if (result) {
      this.notifyListeners('elementDuplicated', { path });
    }
    return result;
  }

  undo() {
    const newDef = this.history.undo(this.navigation.currentPattern.definition);
    if (!newDef) return false;
    this.navigation.currentPattern.definition = newDef;
    this.notifyListeners('undo', {});
    return true;
  }

  redo() {
    const newDef = this.history.redo(this.navigation.currentPattern.definition);
    if (!newDef) return false;
    this.navigation.currentPattern.definition = newDef;
    this.notifyListeners('redo', {});
    return true;
  }

  resetToOriginal() {
    this.navigation.currentPattern.definition = JSON.parse(JSON.stringify(this.navigation.currentPattern.originalDefinition));
    this.history.reset();
    this.notifyListeners('resetToOriginal', {});
    return true;
  }

  getCurrentDefinition() {
    return this.navigation.getCurrentDefinition();
  }

  hasChanges() {
    if (!this.navigation.currentPattern) return false;
    return this.history.hasChanges(this.navigation.currentPattern.definition, this.navigation.currentPattern.originalDefinition);
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
    this.navigation.clear();
    this.history.clear();
    this.listeners = [];
    return this;
  }

  get currentPattern() {
    return this.navigation.currentPattern;
  }
}
