// Pattern versioning facade - maintains 100% backward compatibility
import { VersionManager } from './version-manager.js';
import { VersionQuery } from './version-query.js';
import { VersionMetadata } from './version-metadata.js';
import { VersionHistory } from './version-history.js';
import { VersionPersistence } from './version-persistence.js';
import { VersionUIBuilder } from './version-ui-builder.js';
import { VersionEvents } from './version-events.js';

class PatternVersioning {
  constructor() {
    this.versionManager = new VersionManager();
    this.versionQuery = new VersionQuery(this.versionManager);
    this.versionMetadata = new VersionMetadata(this.versionManager);
    this.versionHistory = new VersionHistory();
    this.versionPersistence = new VersionPersistence(this.versionManager);
    this.uiBuilder = new VersionUIBuilder(this.versionManager);
    this.versionEvents = new VersionEvents();

    // Expose for backward compatibility
    this.versions = this.versionManager.versions;
    this.currentVersions = this.versionManager.currentVersions;
    this.history = this.versionHistory.history;
    this.listeners = this.versionEvents.listeners;
    this.maxVersionsPerPattern = this.versionManager.maxVersionsPerPattern;
  }

  // Delegate to version manager
  createPatternVersion(patternName, definition, metadata = {}) {
    const versionId = this.versionManager.createPatternVersion(patternName, definition, metadata);
    this.versionHistory.recordHistory(patternName, 'create', { versionId, metadata });
    this.versionEvents.notifyListeners('versionCreated', { patternName, version: this.versionManager.getCurrentVersion(patternName) });
    return versionId;
  }

  getCurrentVersion(patternName) {
    return this.versionManager.getCurrentVersion(patternName);
  }

  getVersionById(patternName, versionId) {
    return this.versionManager.getVersionById(patternName, versionId);
  }

  rollback(patternName, versionId) {
    const result = this.versionManager.rollback(patternName, versionId);
    if (result) {
      this.versionHistory.recordHistory(patternName, 'rollback', {
        versionId,
        rolledBackAt: new Date().toISOString()
      });
      this.versionEvents.notifyListeners('rollbackPerformed', { patternName, versionId, version: this.getVersionById(patternName, versionId) });
    }
    return result;
  }

  deleteVersion(patternName, versionId) {
    const result = this.versionManager.deleteVersion(patternName, versionId);
    if (result) {
      this.versionHistory.recordHistory(patternName, 'delete', { versionId });
      this.versionEvents.notifyListeners('versionDeleted', { patternName, versionId });
    }
    return result;
  }

  // Delegate to query
  listVersions(patternName) {
    return this.versionQuery.listVersions(patternName);
  }

  compareVersions(patternName, versionId1, versionId2) {
    return this.versionQuery.compareVersions(patternName, versionId1, versionId2);
  }

  getVersionByTag(patternName, tag) {
    return this.versionQuery.getVersionByTag(patternName, tag);
  }

  getLatestStableVersion(patternName) {
    return this.versionQuery.getLatestStableVersion(patternName);
  }

  // Delegate to metadata
  tagVersion(patternName, versionId, tag) {
    const result = this.versionMetadata.tagVersion(patternName, versionId, tag);
    if (result) {
      this.versionHistory.recordHistory(patternName, 'tag', { versionId, tag });
      this.versionEvents.notifyListeners('versionTagged', { patternName, versionId, tag });
    }
    return result;
  }

  markStable(patternName, versionId) {
    const result = this.versionMetadata.markStable(patternName, versionId);
    if (result) {
      this.versionHistory.recordHistory(patternName, 'markStable', { versionId });
      this.versionEvents.notifyListeners('versionMarkedStable', { patternName, versionId });
    }
    return result;
  }

  markDeprecated(patternName, versionId, reason = '') {
    const result = this.versionMetadata.markDeprecated(patternName, versionId, reason);
    if (result) {
      this.versionHistory.recordHistory(patternName, 'markDeprecated', { versionId, reason });
      this.versionEvents.notifyListeners('versionMarkedDeprecated', { patternName, versionId });
    }
    return result;
  }

  // Delegate to history
  recordHistory(patternName, action, data) {
    return this.versionHistory.recordHistory(patternName, action, data);
  }

  getHistory(patternName, limit = 50) {
    return this.versionHistory.getHistory(patternName, limit);
  }

  // Delegate to persistence
  exportVersions(patternName) {
    return this.versionPersistence.exportVersions(patternName);
  }

  importVersions(patternName, exportedData) {
    const result = this.versionPersistence.importVersions(patternName, exportedData);
    if (result) {
      this.versionHistory.recordHistory(patternName, 'import', {
        versionCount: exportedData.versions.length
      });
      this.versionEvents.notifyListeners('versionsImported', { patternName });
    }
    return result;
  }

  // Delegate to UI builder
  buildVersionTimeline(patternName) {
    return this.uiBuilder.buildVersionTimeline(patternName);
  }

  buildVersionSelector(patternName) {
    return this.uiBuilder.buildVersionSelector(patternName);
  }

  // Delegate to events
  on(event, callback) {
    return this.versionEvents.on(event, callback);
  }

  off(event, callback) {
    return this.versionEvents.off(event, callback);
  }

  notifyListeners(event, data) {
    return this.versionEvents.notifyListeners(event, data);
  }

  clear() {
    this.versionManager.versions.clear();
    this.versionManager.currentVersions.clear();
    this.versionHistory.clear();
    this.versionEvents.clear();
    return this;
  }
}

function createPatternVersioning() {
  return new PatternVersioning();
}

export { PatternVersioning, createPatternVersioning };
