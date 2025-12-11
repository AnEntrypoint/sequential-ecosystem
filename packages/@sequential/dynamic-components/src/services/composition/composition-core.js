// Facade maintaining 100% backward compatibility with composition layers
import { PatternManager } from './composition-patterns.js';
import { LayoutManager } from './composition-layouts.js';
import { CompositionStorage } from './composition-storage.js';

export class CompositionCore {
  constructor(patternLibraries = {}) {
    this.patternLibraries = patternLibraries;
    this.patternManager = new PatternManager();
    this.layoutManager = new LayoutManager();
    this.storage = new CompositionStorage();
    this.listeners = [];
  }

  addPattern(patternId, patternDef, position = null) {
    const pattern = this.patternManager.addPattern(patternId, patternDef, position);
    this.notifyListeners('patternAdded', { pattern });
    return this;
  }

  removePattern(patternId) {
    const removed = this.patternManager.removePattern(patternId);
    if (removed) {
      this.notifyListeners('patternRemoved', { pattern: removed });
    }
    return this;
  }

  reorderPatterns(fromIndex, toIndex) {
    const result = this.layoutManager.layoutMode || this.patternManager.reorderPatterns(fromIndex, toIndex);
    if (result) {
      this.notifyListeners('patternsReordered', { fromIndex, toIndex });
    }
    return result;
  }

  setLayoutMode(mode) {
    this.layoutManager.setLayoutMode(mode);
    this.notifyListeners('layoutModeChanged', { mode });
    return this;
  }

  updateLayoutConfig(config) {
    this.layoutManager.updateLayoutConfig(config);
    this.notifyListeners('layoutConfigChanged', { config: this.layoutManager.layoutConfig });
    return this;
  }

  updateGridConfig(config) {
    this.layoutManager.updateGridConfig(config);
    this.notifyListeners('gridConfigChanged', { config: this.layoutManager.gridConfig });
    return this;
  }

  customizePattern(patternId, customizations) {
    const result = this.patternManager.customizePattern(patternId, customizations);
    if (result) {
      this.notifyListeners('patternCustomized', { patternId, customizations });
    }
    return result;
  }

  applyPatternVariant(patternId, variantName) {
    const result = this.patternManager.applyPatternVariant(patternId, variantName);
    if (result) {
      this.notifyListeners('variantApplied', { patternId, variantName });
    }
    return result;
  }

  saveComposition(name) {
    const id = this.storage.save(name, this.patternManager.selectedPatterns, this.layoutManager.layoutMode, this.layoutManager.layoutConfig, this.layoutManager.gridConfig);
    this.notifyListeners('compositionSaved', { id, name });
    return id;
  }

  loadComposition(id) {
    const composition = this.storage.load(id);
    if (!composition) return false;

    this.patternManager.setPatterns(composition.patterns);
    this.layoutManager.setLayoutState(composition.layoutMode, composition.layoutConfig, composition.gridConfig);
    this.notifyListeners('compositionLoaded', { id, composition });
    return true;
  }

  deleteComposition(id) {
    const result = this.storage.delete(id);
    if (result) {
      this.notifyListeners('compositionDeleted', { id });
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
      this.notifyListeners('compositionImported', { data });
      return true;
    }
    return false;
  }

  getState() {
    const { layoutMode, layoutConfig, gridConfig } = this.layoutManager.getLayoutState();
    return {
      selectedPatterns: this.patternManager.selectedPatterns,
      layoutMode,
      layoutConfig,
      gridConfig,
      compositions: Array.from(this.storage.compositions.values()),
      currentCompositionId: this.storage.compositionId
    };
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
          console.error(`Pattern composition listener error for ${event}:`, e);
        }
      });
  }

  clear() {
    this.patternManager.clear();
    this.storage.clear();
    this.listeners = [];
    return this;
  }
}
