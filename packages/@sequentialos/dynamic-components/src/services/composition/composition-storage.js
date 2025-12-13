// Persistence layer - saving, loading, and managing compositions
export class CompositionStorage {
  constructor() {
    this.compositions = new Map();
    this.compositionId = null;
  }

  save(name, selectedPatterns, layoutMode, layoutConfig, gridConfig) {
    const id = `composition-${Date.now()}`;

    this.compositions.set(id, {
      id,
      name,
      patterns: JSON.parse(JSON.stringify(selectedPatterns)),
      layoutMode,
      layoutConfig: JSON.parse(JSON.stringify(layoutConfig)),
      gridConfig: JSON.parse(JSON.stringify(gridConfig)),
      created: Date.now()
    });

    this.compositionId = id;
    return id;
  }

  load(id) {
    const composition = this.compositions.get(id);
    if (!composition) return null;

    this.compositionId = id;
    return composition;
  }

  delete(id) {
    if (this.compositions.delete(id)) {
      if (this.compositionId === id) {
        this.compositionId = null;
      }
      return true;
    }
    return false;
  }

  list() {
    return Array.from(this.compositions.values()).map(c => ({
      id: c.id,
      name: c.name,
      patternCount: c.patterns.length,
      created: c.created
    }));
  }

  export(selectedPatterns, layoutMode, layoutConfig, gridConfig) {
    if (!selectedPatterns || selectedPatterns.length === 0) {
      return null;
    }

    return {
      layoutMode,
      layoutConfig,
      gridConfig,
      patterns: selectedPatterns,
      exported: new Date().toISOString()
    };
  }

  import(data) {
    if (!data.patterns || !Array.isArray(data.patterns)) {
      return false;
    }
    return JSON.parse(JSON.stringify(data));
  }

  clear() {
    this.compositions.clear();
    this.compositionId = null;
  }
}
