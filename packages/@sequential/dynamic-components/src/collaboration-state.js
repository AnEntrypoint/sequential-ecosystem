// Collaboration state management
export class CollaborationState {
  constructor(collaborationManager) {
    this.manager = collaborationManager;
    this.currentSessionId = null;
    this.editingPatternId = null;
    this.editLocks = new Map();
    this.changeHistory = [];
  }

  startEditingPattern(patternId, patternDef) {
    this.editingPatternId = patternId;
    this.manager?.notifyEditStart?.(patternId, patternDef);
  }

  updatePattern(updates, metadata = {}) {
    if (!this.currentSessionId) return null;
    const change = {
      timestamp: Date.now(),
      patternId: this.editingPatternId,
      updates,
      metadata,
      resolved: false
    };
    this.changeHistory.push(change);
    this.manager?.notifyChange?.(change);
    return change;
  }

  lockPattern(lockKey) {
    if (!this.editingPatternId) return null;
    const lockId = `lock-${Date.now()}`;
    this.editLocks.set(lockId, {
      patternId: this.editingPatternId,
      lockKey,
      timestamp: Date.now()
    });
    return lockId;
  }

  unlockPattern(lockId) {
    if (!this.editingPatternId) return null;
    const removed = this.editLocks.delete(lockId);
    return removed;
  }

  getActiveSession() {
    return this.manager?.getSession?.(this.currentSessionId);
  }

  setActiveSession(sessionId) {
    this.currentSessionId = sessionId;
  }

  getChangeHistory(sessionId) {
    return this.changeHistory.filter(c => !sessionId || this.manager?.getSession?.(sessionId)?.id === sessionId);
  }

  clear() {
    this.currentSessionId = null;
    this.editingPatternId = null;
    this.editLocks.clear();
    this.changeHistory = [];
  }
}
