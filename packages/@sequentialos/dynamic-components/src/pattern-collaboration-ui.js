// Facade maintaining 100% backward compatibility
import { CollaborationState } from './collaboration-state.js';
import { CollaborationUIBuilder } from './collaboration-ui-builder.js';

class PatternCollaborationUI {
  constructor(collaborationManager) {
    this.collaborationManager = collaborationManager;
    this.state = new CollaborationState(collaborationManager);
    this.uiBuilder = new CollaborationUIBuilder(collaborationManager);
  }

  // UI methods (delegated to uiBuilder)
  buildMainUI() {
    return this.uiBuilder.buildMainUI();
  }

  buildConnectionStatus() {
    return this.uiBuilder.buildConnectionStatus();
  }

  buildActiveSession() {
    return this.uiBuilder.buildActiveSession();
  }

  buildCollaborators() {
    return this.uiBuilder.buildCollaborators();
  }

  buildConflictResolutionUI(change1, change2) {
    return this.uiBuilder.buildConflictResolutionUI(change1, change2);
  }

  buildChangeHistoryUI(sessionId) {
    const changes = this.state.getChangeHistory(sessionId);
    return this.uiBuilder.buildChangeHistoryUI(changes);
  }

  formatDuration(ms) {
    return this.uiBuilder.formatDuration(ms);
  }

  // State methods (delegated to state)
  startEditingPattern(patternId, patternDef) {
    return this.state.startEditingPattern(patternId, patternDef);
  }

  updatePattern(updates, metadata = {}) {
    return this.state.updatePattern(updates, metadata);
  }

  lockPattern(lockKey) {
    return this.state.lockPattern(lockKey);
  }

  unlockPattern(lockId) {
    return this.state.unlockPattern(lockId);
  }

  getActiveSession() {
    return this.state.getActiveSession();
  }

  setActiveSession(sessionId) {
    return this.state.setActiveSession(sessionId);
  }

  getChangeHistory(sessionId) {
    return this.state.getChangeHistory(sessionId);
  }

  // Properties
  get currentSessionId() {
    return this.state.currentSessionId;
  }

  set currentSessionId(value) {
    this.state.currentSessionId = value;
  }

  get editingPatternId() {
    return this.state.editingPatternId;
  }

  set editingPatternId(value) {
    this.state.editingPatternId = value;
  }

  get editLocks() {
    return this.state.editLocks;
  }

  get changeHistory() {
    return this.state.changeHistory;
  }

  clear() {
    this.state.clear();
  }
}

export { PatternCollaborationUI };
