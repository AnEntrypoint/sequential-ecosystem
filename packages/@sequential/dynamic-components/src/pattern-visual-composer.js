// Pattern visual composer facade - maintains 100% backward compatibility
import { CanvasManager } from './canvas-manager.js';
import { ComponentManager } from './component-manager.js';
import { ComponentAlignment } from './component-alignment.js';
import { ComponentGrouping } from './component-grouping.js';
import { ComponentClipboard } from './component-clipboard.js';
import { HistoryManager } from './history-manager.js';
import { ComposerUIBuilder } from './composer-ui-builder.js';
import { CompositionPersistence } from './composition-persistence.js';

class PatternVisualComposer {
  constructor() {
    this.canvasManager = new CanvasManager();
    this.componentManager = new ComponentManager(this.canvasManager);
    this.componentAlignment = new ComponentAlignment(this.componentManager);
    this.componentGrouping = new ComponentGrouping(this.componentManager);
    this.componentClipboard = new ComponentClipboard(this.componentManager, this.canvasManager);
    this.historyManager = new HistoryManager(this.componentManager, this.canvasManager);
    this.uiBuilder = new ComposerUIBuilder(this.componentManager, this.canvasManager);
    this.persistence = new CompositionPersistence(this.componentManager, this.canvasManager);

    // Expose for backward compatibility
    this.canvas = null;
    this.components = this.componentManager.components;
    this.layout = null;
    this.selectedComponent = this.componentManager.selectedComponent;
    this.clipboard = this.componentClipboard.clipboard;
    this.history = this.historyManager.history;
    this.historyIndex = this.historyManager.historyIndex;
    this.grid = this.canvasManager.grid;
    this.zoom = this.canvasManager.zoom;
    this.pan = this.canvasManager.pan;
  }

  // Delegate to canvas manager
  createCanvas(width = 800, height = 600) {
    const canvas = this.canvasManager.createCanvas(width, height);
    this.canvas = canvas;
    this.layout = { type: 'absolute', children: [] };
    return canvas;
  }

  snapToGrid(value) {
    return this.canvasManager.snapToGrid(value);
  }

  // Delegate to component manager
  addComponent(componentDef, x = 0, y = 0) {
    const component = this.componentManager.addComponent(componentDef, x, y);
    this.historyManager.saveState();
    return component;
  }

  removeComponent(componentId) {
    this.componentManager.removeComponent(componentId);
    this.historyManager.saveState();
  }

  moveComponent(componentId, x, y) {
    const result = this.componentManager.moveComponent(componentId, x, y);
    if (result) this.historyManager.saveState();
    return result;
  }

  resizeComponent(componentId, width, height) {
    const result = this.componentManager.resizeComponent(componentId, width, height);
    if (result) this.historyManager.saveState();
    return result;
  }

  selectComponent(componentId) {
    this.componentManager.selectComponent(componentId);
    this.selectedComponent = this.componentManager.selectedComponent;
  }

  setComponentProperty(componentId, property, value) {
    const result = this.componentManager.setComponentProperty(componentId, property, value);
    if (result) this.historyManager.saveState();
    return result;
  }

  getComponentProperty(componentId, property) {
    return this.componentManager.getComponentProperty(componentId, property);
  }

  // Delegate to alignment
  alignComponents(componentIds, direction) {
    const result = this.componentAlignment.alignComponents(componentIds, direction);
    if (result) this.historyManager.saveState();
    return result;
  }

  distributeComponentsHorizontally(components) {
    return this.componentAlignment.distributeComponentsHorizontally(components);
  }

  distributeComponentsVertically(components) {
    return this.componentAlignment.distributeComponentsVertically(components);
  }

  // Delegate to grouping
  groupComponents(componentIds) {
    const group = this.componentGrouping.groupComponents(componentIds);
    if (group) this.historyManager.saveState();
    return group;
  }

  // Delegate to clipboard
  copyComponent(componentId) {
    return this.componentClipboard.copyComponent(componentId);
  }

  pasteComponent() {
    const pasted = this.componentClipboard.pasteComponent();
    if (pasted) this.historyManager.saveState();
    return pasted;
  }

  // Delegate to history
  undo() {
    return this.historyManager.undo();
  }

  redo() {
    return this.historyManager.redo();
  }

  restoreFromHistory() {
    return this.historyManager.restoreFromHistory();
  }

  saveHistory() {
    this.historyManager.saveState();
  }

  // Delegate to UI builder
  buildCanvasUI() {
    return this.uiBuilder.buildCanvasUI();
  }

  buildPropertiesPanel() {
    return this.uiBuilder.buildPropertiesPanel();
  }

  buildPropertyField(label, value) {
    return this.uiBuilder.buildPropertyField(label, value);
  }

  // Delegate to persistence
  exportComposition() {
    return this.persistence.exportComposition();
  }

  importComposition(data) {
    this.persistence.importComposition(data);
    this.historyManager.saveState();
  }

  getCompositionJSON() {
    return this.persistence.getCompositionJSON();
  }
}

function createPatternVisualComposer() {
  return new PatternVisualComposer();
}

export { PatternVisualComposer, createPatternVisualComposer };
