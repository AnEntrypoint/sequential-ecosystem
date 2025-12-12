// Facade maintaining 100% backward compatibility with composition layers
import { PatternManager } from './composition-patterns.js';
import { LayoutManager } from './composition-layouts.js';
import { CompositionStorage } from './composition-storage.js';
import { CompositionEventManager } from './composition-event-manager.js';
import { CompositionState } from './composition-state.js';

export class CompositionCore {
  constructor(patternLibraries = {}) {
    this.patternLibraries = patternLibraries;
    this.patternManager = new PatternManager();
    this.layoutManager = new LayoutManager();
    this.storage = new CompositionStorage();
    this.eventManager = new CompositionEventManager();
    this.stateManager = new CompositionState(this.patternManager, this.layoutManager, this.storage);
  }

  addPattern(patternId, patternDef, position = null) {
    const pattern = this.patternManager.addPattern(patternId, patternDef, position);
    this.eventManager.notifyListeners('patternAdded', { pattern });
    return this;
  }

  removePattern(patternId) {
    const removed = this.patternManager.removePattern(patternId);
    if (removed) {
      this.eventManager.notifyListeners('patternRemoved', { pattern: removed });
    }
    return this;
  }

  reorderPatterns(fromIndex, toIndex) {
    const result = this.layoutManager.layoutMode || this.patternManager.reorderPatterns(fromIndex, toIndex);
    if (result) {
      this.eventManager.notifyListeners('patternsReordered', { fromIndex, toIndex });
    }
    return result;
  }

  setLayoutMode(mode) {
    this.layoutManager.setLayoutMode(mode);
    this.eventManager.notifyListeners('layoutModeChanged', { mode });
    return this;
  }

  updateLayoutConfig(config) {
    this.layoutManager.updateLayoutConfig(config);
    this.eventManager.notifyListeners('layoutConfigChanged', { config: this.layoutManager.layoutConfig });
    return this;
  }

  updateGridConfig(config) {
    this.layoutManager.updateGridConfig(config);
    this.eventManager.notifyListeners('gridConfigChanged', { config: this.layoutManager.gridConfig });
    return this;
  }

  customizePattern(patternId, customizations) {
    const result = this.patternManager.customizePattern(patternId, customizations);
    if (result) {
      this.eventManager.notifyListeners('patternCustomized', { patternId, customizations });
    }
    return result;
  }

  applyPatternVariant(patternId, variantName) {
    const result = this.patternManager.applyPatternVariant(patternId, variantName);
    if (result) {
      this.eventManager.notifyListeners('variantApplied', { patternId, variantName });
    }
    return result;
  }

  saveComposition(name) {
    const id = this.storage.save(name, this.patternManager.selectedPatterns, this.layoutManager.layoutMode, this.layoutManager.layoutConfig, this.layoutManager.gridConfig);
    this.eventManager.notifyListeners('compositionSaved', { id, name });
    return id;
  }

  loadComposition(id) {
    const composition = this.storage.load(id);
    if (!composition) return false;

    this.patternManager.setPatterns(composition.patterns);
    this.layoutManager.setLayoutState(composition.layoutMode, composition.layoutConfig, composition.gridConfig);
    this.eventManager.notifyListeners('compositionLoaded', { id, composition });
    return true;
  }

  deleteComposition(id) {
    const result = this.storage.delete(id);
    if (result) {
      this.eventManager.notifyListeners('compositionDeleted', { id });
    }
    return result;
  }

  listCompositions() {
    return this.storage.list();
  }

  exportComposition() {
    return this.storage.export(this.patternManager.selectedPatterns, this.layoutManager.layoutMode, this.layoutManager.layoutConfig, this.layoutManager.gridConfig);
  }

  importComposition(data) {
    const imported = this.storage.import(data);
    if (imported) {
      this.patternManager.setPatterns(imported.patterns);
      this.layoutManager.setLayoutState(imported.layoutMode || 'grid', imported.layoutConfig, imported.gridConfig);
      this.eventManager.notifyListeners('compositionImported', { data });
      return true;
    }
    return false;
  }

  getState() {
    return this.stateManager.getState();
  }

  on(event, callback) {
    return this.eventManager.on(event, callback);
  }

  off(event, callback) {
    return this.eventManager.off(event, callback);
  }

  notifyListeners(event, data) {
    return this.eventManager.notifyListeners(event, data);
  }

  clear() {
    this.patternManager.clear();
    this.storage.clear();
    this.eventManager.clear();
    return this;
  }
}
