// Pattern collaboration manager facade - maintains 100% backward compatibility
import { CollaborationSessionManager } from './collaboration-session-manager.js';
import { CollaborationLockManager } from './collaboration-lock-manager.js';
import { CollaborationCursorTracker } from './collaboration-cursor-tracker.js';
import { CollaborationChangeEngine } from './collaboration-change-engine.js';
import { CollaborationUIBuilder } from './collaboration-ui.js';

class PatternCollaborationManager {
  constructor() {
    this.sessionManager = new CollaborationSessionManager();
    this.lockManager = new CollaborationLockManager(30000, this.notifyListeners.bind(this));
    this.cursorTracker = new CollaborationCursorTracker(this.notifyListeners.bind(this));
    this.changeEngine = new CollaborationChangeEngine(100, this.notifyListeners.bind(this));
    this.uiBuilder = new CollaborationUIBuilder();

    // Expose for backward compatibility
    this.sessions = this.sessionManager.sessions;
    this.activeEditors = this.sessionManager.activeEditors;
    this.cursorPositions = this.cursorTracker.cursorPositions;
    this.locks = this.lockManager.locks;
    this.conflicts = this.changeEngine.conflicts;
    this.changeLog = this.changeEngine.changeLog;
    this.listeners = this.sessionManager.listeners;
    this.maxConflicts = 100;
    this.lockTimeout = 30000;
  }

  createSession(sessionId, patternName, userId) {
    return this.sessionManager.createSession(sessionId, patternName, userId);
  }

  joinSession(sessionId, userId) {
    return this.sessionManager.joinSession(sessionId, userId);
  }

  leaveSession(sessionId, userId) {
    const result = this.sessionManager.leaveSession(sessionId, userId);
    if (result) {
      this.cursorTracker.removeCursors(sessionId, userId);
    }
    return result;
  }

  acquireLock(sessionId, userId, resourcePath, timeout = null) {
    return this.lockManager.acquireLock(sessionId, userId, resourcePath, timeout);
  }

  releaseLock(sessionId, userId, resourcePath) {
    return this.lockManager.releaseLock(sessionId, userId, resourcePath);
  }

  isLocked(sessionId, resourcePath, userId = null) {
    return this.lockManager.isLocked(sessionId, resourcePath, userId);
  }

  recordChange(sessionId, userId, change) {
    const session = this.sessionManager.getSession(sessionId);
    return this.changeEngine.recordChange(sessionId, userId, change, session);
  }

  updateCursor(sessionId, userId, cursorData) {
    return this.cursorTracker.updateCursor(sessionId, userId, cursorData);
  }

  getCursorPositions(sessionId) {
    return this.cursorTracker.getCursorPositions(sessionId);
  }

  detectConflict(sessionId, change1, change2) {
    return this.changeEngine.detectConflict(sessionId, change1, change2);
  }

  resolveConflict(conflictId, resolutionStrategy, mergedChange = null) {
    return this.changeEngine.resolveConflict(conflictId, resolutionStrategy, mergedChange);
  }

  mergeChanges(changes) {
    return this.changeEngine.mergeChanges(changes);
  }

  buildOperationalTransform(change, otherChanges) {
    return this.changeEngine.buildOperationalTransform(change, otherChanges);
  }

  getSessionHistory(sessionId, limit = 50) {
    const session = this.sessionManager.getSession(sessionId);
    return this.changeEngine.getSessionHistory(session, limit);
  }

  getChangesSince(sessionId, timestamp) {
    const session = this.sessionManager.getSession(sessionId);
    return this.changeEngine.getChangesSince(session, timestamp);
  }

  generateUserColor(userId) {
    return this.cursorTracker.generateUserColor(userId);
  }

  buildCollaborationUI(sessionId) {
    return this.uiBuilder.buildCollaborationUI(sessionId, this.sessionManager, this.cursorTracker);
  }

  on(event, callback) {
    this.sessionManager.addListener(event, callback);
    return this;
  }

  off(event, callback) {
    this.sessionManager.removeListener(event, callback);
    return this;
  }

  notifyListeners(event, data) {
    this.sessionManager.notifyListeners(event, data);
  }

  cleanup() {
    this.lockManager.cleanup();
    return this;
  }

  clear() {
    this.sessionManager.clearSessions();
    this.lockManager.clearLocks();
    this.cursorTracker.clearCursors();
    this.changeEngine.clearChanges();
    this.listeners = [];
    return this;
  }
}

function createPatternCollaborationManager() {
  return new PatternCollaborationManager();
}

export { PatternCollaborationManager, createPatternCollaborationManager };
