/**
 * pattern-composition.js - Pattern Composer Facade
 *
 * Delegates to composition operations and history modules
 */

import { CompositionOperations } from './composition-operations.js';
import { CompositionHistory } from './composition-history.js';

class PatternComposer {
  constructor(patternDiscovery) {
    this.discovery = patternDiscovery;
    this.compositions = new Map();
    this.operations = new CompositionOperations(this.compositions, patternDiscovery);
    this.history = new CompositionHistory();
  }

  createComposition(id, name, patterns, config = {}) {
    const composition = this.operations.createComposition(id, name, patterns, config);
    this.history.recordAction('create', { id });
    return composition;
  }

  buildCompositionComponent(compositionId) {
    return this.operations.buildCompositionComponent(compositionId);
  }

  nestPattern(parentId, childPattern, position = -1) {
    const result = this.operations.nestPattern(parentId, childPattern, position);
    if (result) {
      this.history.recordAction('nest', { parentId, childPattern });
    }
    return result;
  }

  removePatternFromComposition(compositionId, patternIndex) {
    const result = this.operations.removePatternFromComposition(compositionId, patternIndex);
    if (result) {
      this.history.recordAction('remove', { compositionId, patternIndex });
    }
    return result;
  }

  reorderPatterns(compositionId, fromIndex, toIndex) {
    const result = this.operations.reorderPatterns(compositionId, fromIndex, toIndex);
    if (result) {
      this.history.recordAction('reorder', { compositionId, fromIndex, toIndex });
    }
    return result;
  }

  updateCompositionConfig(compositionId, config) {
    const result = this.operations.updateCompositionConfig(compositionId, config);
    if (result) {
      this.history.recordAction('updateConfig', { compositionId });
    }
    return result;
  }

  getComposition(id) {
    return this.operations.getComposition(id);
  }

  getAllCompositions() {
    return this.operations.getAllCompositions();
  }

  deleteComposition(id) {
    const result = this.operations.deleteComposition(id);
    if (result) {
      this.history.recordAction('delete', { id });
    }
    return result;
  }

  exportComposition(id) {
    return this.operations.exportComposition(id);
  }

  importComposition(data) {
    const result = this.operations.importComposition(data);
    if (result) {
      this.history.recordAction('import', { id: data.composition?.id });
    }
    return result;
  }

  undo() {
    return this.history.undo();
  }

  getHistory() {
    return this.history.getHistory();
  }

  clearHistory() {
    this.history.clearHistory();
  }
}

function createPatternComposer(patternDiscovery) {
  return new PatternComposer(patternDiscovery);
}

export { PatternComposer, createPatternComposer };
