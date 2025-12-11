// Editor pattern integration facade - maintains 100% backward compatibility
import { PatternDiscovery } from './pattern-discovery.js';
import { PatternIntegrationEvents } from './pattern-integration-events.js';
import { PatternIntegrationLifecycle } from './pattern-integration-lifecycle.js';
import { PatternIntegrationState } from './pattern-integration-state.js';
import { PatternIntegrationPanels } from './pattern-integration-panels.js';

export class EditorPatternIntegration {
  constructor() {
    this.discovery = new PatternDiscovery();
    this.eventBus = new PatternIntegrationEvents();
    this.lifecycle = new PatternIntegrationLifecycle(this.discovery, this.eventBus);
    this.state = new PatternIntegrationState(this.eventBus);
    this.previewMode = false;
    this.listeners = this.eventBus.listeners;
  }

  on(event, callback) {
    return this.eventBus.on(event, callback);
  }

  emit(event, data) {
    return this.eventBus.emit(event, data);
  }

  searchPatterns(query) {
    return this.lifecycle.searchPatterns(query);
  }

  selectPattern(patternId) {
    const selected = this.lifecycle.selectPattern(patternId);
    this.state.setSelectedPattern(selected);
    return selected;
  }

  insertPattern(patternId, position = 'append') {
    const insertion = this.lifecycle.insertPattern(patternId, position);
    if (insertion) {
      this.state.setInsertedPatterns(this.lifecycle.insertedPatterns);
    }
    return insertion;
  }

  removeInsertion(insertionId) {
    const removed = this.lifecycle.removeInsertion(insertionId);
    if (removed) {
      this.state.setInsertedPatterns(this.lifecycle.insertedPatterns);
    }
    return removed;
  }

  getInsertedPatterns() {
    return this.lifecycle.getInsertedPatterns();
  }

  getPatternCode(patternId) {
    return this.lifecycle.getPatternCode(patternId);
  }

  exportEditorState() {
    this.state.setInsertedPatterns(this.lifecycle.insertedPatterns);
    this.state.setSelectedPattern(this.lifecycle.selectedPattern);
    return this.state.exportEditorState();
  }

  importEditorState(state) {
    this.state.importEditorState(state);
    this.lifecycle.insertedPatterns = state.insertedPatterns || [];
    this.lifecycle.selectedPattern = state.selectedPattern || null;
  }

  buildPatternSearchPanel() {
    const panels = new PatternIntegrationPanels(
      this.discovery,
      this.lifecycle.selectedPattern,
      this.lifecycle.insertedPatterns
    );
    return panels.buildPatternSearchPanel();
  }

  buildPatternPreviewPanel() {
    const panels = new PatternIntegrationPanels(
      this.discovery,
      this.lifecycle.selectedPattern,
      this.lifecycle.insertedPatterns
    );
    return panels.buildPatternPreviewPanel();
  }

  buildInsertedPatternsPanel() {
    const panels = new PatternIntegrationPanels(
      this.discovery,
      this.lifecycle.selectedPattern,
      this.lifecycle.insertedPatterns
    );
    return panels.buildInsertedPatternsPanel();
  }

  buildStatisticsPanel() {
    const panels = new PatternIntegrationPanels(
      this.discovery,
      this.lifecycle.selectedPattern,
      this.lifecycle.insertedPatterns
    );
    return panels.buildStatisticsPanel();
  }
}

export const createEditorPatternIntegration = () =>
  new EditorPatternIntegration();
