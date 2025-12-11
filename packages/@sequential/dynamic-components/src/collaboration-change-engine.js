// Change recording and conflict detection for collaboration
export class CollaborationChangeEngine {
  constructor(maxConflicts = 100, notifyListeners = null) {
    this.changeLog = [];
    this.conflicts = [];
    this.maxConflicts = maxConflicts;
    this.notifyListeners = notifyListeners || (() => {});
  }

  recordChange(sessionId, userId, change, session) {
    if (!session) return false;

    const changeRecord = {
      id: `${sessionId}:${Date.now()}:${Math.random()}`,
      userId,
      timestamp: Date.now(),
      iso: new Date().toISOString(),
      ...change,
      version: session.changes.length
    };

    session.changes.push(changeRecord);
    this.changeLog.push(changeRecord);

    if (this.changeLog.length > 1000) {
      this.changeLog.shift();
    }

    this.notifyListeners('changeRecorded', { sessionId, userId, change: changeRecord });
    return changeRecord;
  }

  detectConflict(sessionId, change1, change2) {
    if (!change1 || !change2) return null;

    if (change1.path === change2.path && change1.userId !== change2.userId) {
      if (Math.abs(change1.timestamp - change2.timestamp) < 1000) {
        const conflict = {
          id: `conflict:${Date.now()}:${Math.random()}`,
          sessionId,
          change1,
          change2,
          detectedAt: new Date().toISOString(),
          isResolved: false,
          resolution: null
        };

        this.conflicts.push(conflict);

        if (this.conflicts.length > this.maxConflicts) {
          this.conflicts.shift();
        }

        this.notifyListeners('conflictDetected', { sessionId, conflict });
        return conflict;
      }
    }

    return null;
  }

  resolveConflict(conflictId, resolutionStrategy, mergedChange = null) {
    const conflict = this.conflicts.find(c => c.id === conflictId);
    if (!conflict) return false;

    conflict.isResolved = true;
    conflict.resolution = {
      strategy: resolutionStrategy,
      resolvedAt: new Date().toISOString(),
      mergedChange
    };

    this.notifyListeners('conflictResolved', { conflictId, conflict });
    return true;
  }

  mergeChanges(changes) {
    const merged = {
      id: `merge:${Date.now()}`,
      timestamp: Date.now(),
      changes: changes.map(c => c.id)
    };

    this.changeLog.push(merged);
    return merged;
  }

  buildOperationalTransform(change, otherChanges) {
    const transformed = JSON.parse(JSON.stringify(change));

    otherChanges.forEach(other => {
      if (other.timestamp < change.timestamp && other.path === change.path) {
        if (other.type === 'insert' && transformed.position >= other.position) {
          transformed.position += other.length || 1;
        } else if (other.type === 'delete' && transformed.position > other.position) {
          transformed.position -= Math.min(other.length || 1, transformed.position - other.position);
        }
      }
    });

    return transformed;
  }

  getSessionHistory(session, limit = 50) {
    if (!session) return [];
    return session.changes.slice(-limit).reverse();
  }

  getChangesSince(session, timestamp) {
    if (!session) return [];
    return session.changes.filter(c => c.timestamp > timestamp);
  }

  clearChanges() {
    this.changeLog = [];
    this.conflicts = [];
  }
}
