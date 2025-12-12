/**
 * composition-state.js - State aggregation for composition core
 *
 * Collects and provides current state of patterns, layouts, and compositions
 */

export class CompositionState {
  constructor(patternManager, layoutManager, storage) {
    this.patternManager = patternManager;
    this.layoutManager = layoutManager;
    this.storage = storage;
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

  getPatternState() {
    return {
      selectedPatterns: this.patternManager.selectedPatterns,
      patternCount: this.patternManager.selectedPatterns.length
    };
  }

  getLayoutState() {
    const { layoutMode, layoutConfig, gridConfig } = this.layoutManager.getLayoutState();
    return {
      layoutMode,
      layoutConfig,
      gridConfig
    };
  }

  getStorageState() {
    return {
      compositions: Array.from(this.storage.compositions.values()),
      currentCompositionId: this.storage.compositionId,
      compositionCount: this.storage.compositions.size
    };
  }
}
