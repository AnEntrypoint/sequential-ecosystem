import { PatternEditorCore } from './pattern-editor-core.js';
import { EditorRenderer } from './editor-renderer.js';
import { EditorUI } from './editor-ui.js';

export class PatternEditor {
  constructor(universalRenderer) {
    this.core = new PatternEditorCore();
    this.renderer = new EditorRenderer(universalRenderer, this.core);
    this.ui = new EditorUI(this.core);
  }

  openPattern(patternId, definition) {
    return this.core.openPattern(patternId, definition);
  }

  initializePreview(containerId) {
    return this.renderer.initializePreview(containerId);
  }

  renderPreview() {
    return this.renderer.renderPreview();
  }

  renderPreviewError(error) {
    return this.renderer.renderPreviewError(error);
  }

  selectElement(path) {
    return this.core.selectElement(path);
  }

  getElementByPath(definition, path) {
    return this.core.getElementByPath(definition, path);
  }

  updateElementStyle(path, styleUpdates) {
    const result = this.core.updateElementStyle(path, styleUpdates);
    if (result) this.renderPreview();
    return result;
  }

  updateElementContent(path, content) {
    const result = this.core.updateElementContent(path, content);
    if (result) this.renderPreview();
    return result;
  }

  updateElementAttributes(path, attributes) {
    const result = this.core.updateElementAttributes(path, attributes);
    if (result) this.renderPreview();
    return result;
  }

  addChild(parentPath, childDefinition) {
    const result = this.core.addChild(parentPath, childDefinition);
    if (result) this.renderPreview();
    return result;
  }

  removeElement(path) {
    const result = this.core.removeElement(path);
    if (result) this.renderPreview();
    return result;
  }

  duplicateElement(path) {
    const result = this.core.duplicateElement(path);
    if (result) this.renderPreview();
    return result;
  }

  saveToUndoStack() {
    return this.core.saveToUndoStack();
  }

  undo() {
    const result = this.core.undo();
    if (result) this.renderPreview();
    return result;
  }

  redo() {
    const result = this.core.redo();
    if (result) this.renderPreview();
    return result;
  }

  resetToOriginal() {
    const result = this.core.resetToOriginal();
    if (result) this.renderPreview();
    return result;
  }

  getCurrentDefinition() {
    return this.core.getCurrentDefinition();
  }

  hasChanges() {
    return this.core.hasChanges();
  }

  buildEditorUI() {
    return this.ui.buildEditorUI();
  }

  buildComponentTree() {
    return this.ui.buildComponentTree();
  }

  buildTreeNode(element, path) {
    return this.ui.buildTreeNode(element, path);
  }

  buildCanvas() {
    return this.ui.buildCanvas();
  }

  buildPropertyInspector() {
    return this.ui.buildPropertyInspector();
  }

  buildStylePropertyInputs(styles) {
    return this.ui.buildStylePropertyInputs(styles);
  }

  on(event, callback) {
    return this.core.on(event, callback);
  }

  off(event, callback) {
    return this.core.off(event, callback);
  }

  notifyListeners(event, data) {
    return this.core.notifyListeners(event, data);
  }

  clear() {
    return this.core.clear();
  }
}

export const createPatternEditor = (universalRenderer) => new PatternEditor(universalRenderer);
