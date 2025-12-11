export class CompositionCore {
  constructor(patternLibraries = {}) {
    this.compositions = new Map();
    this.patternLibraries = patternLibraries;
    this.selectedPatterns = [];
    this.layoutMode = 'grid';
    this.layoutConfig = {
      columns: 2,
      gap: '16px',
      direction: 'row',
      alignItems: 'stretch',
      justifyContent: 'flex-start'
    };
    this.gridConfig = {
      columns: 'repeat(2, 1fr)',
      gap: '16px',
      autoFlow: 'row',
      templateAreas: null
    };
    this.compositionId = null;
    this.listeners = [];
  }

  addPattern(patternId, patternDef, position = null) {
    const pattern = {
      id: patternId,
      definition: JSON.parse(JSON.stringify(patternDef)),
      position: position || this.selectedPatterns.length,
      customizations: {}
    };

    this.selectedPatterns.push(pattern);
    this.notifyListeners('patternAdded', { pattern });

    return this;
  }

  removePattern(patternId) {
    const idx = this.selectedPatterns.findIndex(p => p.id === patternId);
    if (idx >= 0) {
      const removed = this.selectedPatterns.splice(idx, 1)[0];
      this.notifyListeners('patternRemoved', { pattern: removed });
    }

    return this;
  }

  reorderPatterns(fromIndex, toIndex) {
    if (fromIndex < 0 || fromIndex >= this.selectedPatterns.length ||
        toIndex < 0 || toIndex >= this.selectedPatterns.length) {
      return false;
    }

    const [pattern] = this.selectedPatterns.splice(fromIndex, 1);
    this.selectedPatterns.splice(toIndex, 0, pattern);

    this.notifyListeners('patternsReordered', { fromIndex, toIndex });

    return true;
  }

  setLayoutMode(mode) {
    if (!['grid', 'flex', 'stack', 'carousel'].includes(mode)) {
      throw new Error(`Unknown layout mode: ${mode}`);
    }

    this.layoutMode = mode;
    this.notifyListeners('layoutModeChanged', { mode });

    return this;
  }

  updateLayoutConfig(config) {
    this.layoutConfig = { ...this.layoutConfig, ...config };
    this.notifyListeners('layoutConfigChanged', { config: this.layoutConfig });

    return this;
  }

  updateGridConfig(config) {
    this.gridConfig = { ...this.gridConfig, ...config };
    this.notifyListeners('gridConfigChanged', { config: this.gridConfig });

    return this;
  }

  customizePattern(patternId, customizations) {
    const pattern = this.selectedPatterns.find(p => p.id === patternId);
    if (!pattern) return false;

    pattern.customizations = { ...pattern.customizations, ...customizations };
    this.notifyListeners('patternCustomized', { patternId, customizations });

    return true;
  }

  applyPatternVariant(patternId, variantName) {
    const pattern = this.selectedPatterns.find(p => p.id === patternId);
    if (!pattern) return false;

    pattern.variant = variantName;
    this.notifyListeners('variantApplied', { patternId, variantName });

    return true;
  }

  saveComposition(name) {
    const id = `composition-${Date.now()}`;

    this.compositions.set(id, {
      id,
      name,
      patterns: JSON.parse(JSON.stringify(this.selectedPatterns)),
      layoutMode: this.layoutMode,
      layoutConfig: JSON.parse(JSON.stringify(this.layoutConfig)),
      gridConfig: JSON.parse(JSON.stringify(this.gridConfig)),
      created: Date.now()
    });

    this.compositionId = id;
    this.notifyListeners('compositionSaved', { id, name });

    return id;
  }

  loadComposition(id) {
    const composition = this.compositions.get(id);
    if (!composition) return false;

    this.selectedPatterns = JSON.parse(JSON.stringify(composition.patterns));
    this.layoutMode = composition.layoutMode;
    this.layoutConfig = JSON.parse(JSON.stringify(composition.layoutConfig));
    this.gridConfig = JSON.parse(JSON.stringify(composition.gridConfig));
    this.compositionId = id;

    this.notifyListeners('compositionLoaded', { id, composition });

    return true;
  }

  deleteComposition(id) {
    if (this.compositions.delete(id)) {
      if (this.compositionId === id) {
        this.compositionId = null;
      }

      this.notifyListeners('compositionDeleted', { id });

      return true;
    }

    return false;
  }

  listCompositions() {
    return Array.from(this.compositions.values()).map(c => ({
      id: c.id,
      name: c.name,
      patternCount: c.patterns.length,
      created: c.created
    }));
  }

  exportComposition() {
    if (!this.selectedPatterns || this.selectedPatterns.length === 0) {
      return null;
    }

    return {
      layoutMode: this.layoutMode,
      layoutConfig: this.layoutConfig,
      gridConfig: this.gridConfig,
      patterns: this.selectedPatterns,
      exported: new Date().toISOString()
    };
  }

  importComposition(data) {
    if (!data.patterns || !Array.isArray(data.patterns)) {
      return false;
    }

    this.selectedPatterns = JSON.parse(JSON.stringify(data.patterns));
    this.layoutMode = data.layoutMode || 'grid';
    this.layoutConfig = data.layoutConfig || this.layoutConfig;
    this.gridConfig = data.gridConfig || this.gridConfig;

    this.notifyListeners('compositionImported', { data });

    return true;
  }

  getState() {
    return {
      selectedPatterns: this.selectedPatterns,
      layoutMode: this.layoutMode,
      layoutConfig: this.layoutConfig,
      gridConfig: this.gridConfig,
      compositions: Array.from(this.compositions.values()),
      currentCompositionId: this.compositionId
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
    this.selectedPatterns = [];
    this.compositions.clear();
    this.compositionId = null;
    this.listeners = [];
    return this;
  }
}
