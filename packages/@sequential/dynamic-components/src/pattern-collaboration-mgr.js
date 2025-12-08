class PatternCollaborationManager {
  constructor() {
    this.sessions = new Map();
    this.activeEditors = new Map();
    this.cursorPositions = new Map();
    this.locks = new Map();
    this.conflicts = [];
    this.changeLog = [];
    this.listeners = [];
    this.maxConflicts = 100;
    this.lockTimeout = 30000;
  }

  createSession(sessionId, patternName, userId) {
    const session = {
      id: sessionId,
      patternName,
      createdBy: userId,
      createdAt: new Date().toISOString(),
      participants: new Set([userId]),
      changes: [],
      locks: new Map(),
      cursors: new Map(),
      isActive: true
    };

    this.sessions.set(sessionId, session);
    this.notifyListeners('sessionCreated', { sessionId, patternName, userId });
    return session;
  }

  joinSession(sessionId, userId) {
    const session = this.sessions.get(sessionId);
    if (!session) return false;

    session.participants.add(userId);
    this.activeEditors.set(`${sessionId}:${userId}`, {
      userId,
      sessionId,
      joinedAt: new Date().toISOString(),
      cursor: null
    });

    this.notifyListeners('userJoined', { sessionId, userId });
    return true;
  }

  leaveSession(sessionId, userId) {
    const session = this.sessions.get(sessionId);
    if (!session) return false;

    session.participants.delete(userId);
    this.activeEditors.delete(`${sessionId}:${userId}`);
    this.locks.delete(`${sessionId}:${userId}`);

    if (session.participants.size === 0) {
      this.sessions.delete(sessionId);
    }

    this.notifyListeners('userLeft', { sessionId, userId });
    return true;
  }

  acquireLock(sessionId, userId, resourcePath, timeout = null) {
    const lockKey = `${sessionId}:${resourcePath}`;

    if (this.locks.has(lockKey)) {
      const existingLock = this.locks.get(lockKey);
      if (existingLock.userId !== userId) {
        return false;
      }
    }

    const lock = {
      userId,
      resourcePath,
      acquiredAt: Date.now(),
      expiresAt: Date.now() + (timeout || this.lockTimeout)
    };

    this.locks.set(lockKey, lock);
    this.notifyListeners('lockAcquired', { sessionId, userId, resourcePath });
    return true;
  }

  releaseLock(sessionId, userId, resourcePath) {
    const lockKey = `${sessionId}:${resourcePath}`;
    const lock = this.locks.get(lockKey);

    if (!lock || lock.userId !== userId) {
      return false;
    }

    this.locks.delete(lockKey);
    this.notifyListeners('lockReleased', { sessionId, userId, resourcePath });
    return true;
  }

  isLocked(sessionId, resourcePath, userId = null) {
    const lockKey = `${sessionId}:${resourcePath}`;
    const lock = this.locks.get(lockKey);

    if (!lock) return false;

    if (Date.now() > lock.expiresAt) {
      this.locks.delete(lockKey);
      return false;
    }

    return userId ? lock.userId !== userId : true;
  }

  recordChange(sessionId, userId, change) {
    const session = this.sessions.get(sessionId);
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

  updateCursor(sessionId, userId, cursorData) {
    const key = `${sessionId}:${userId}`;

    const cursor = {
      userId,
      sessionId,
      line: cursorData.line || 0,
      column: cursorData.column || 0,
      updatedAt: Date.now(),
      color: cursorData.color || this.generateUserColor(userId)
    };

    this.cursorPositions.set(key, cursor);
    this.notifyListeners('cursorMoved', { sessionId, userId, cursor });
    return cursor;
  }

  getCursorPositions(sessionId) {
    const cursors = [];

    for (const [key, cursor] of this.cursorPositions.entries()) {
      if (key.startsWith(sessionId + ':')) {
        cursors.push(cursor);
      }
    }

    return cursors;
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

  getSessionHistory(sessionId, limit = 50) {
    const session = this.sessions.get(sessionId);
    if (!session) return [];

    return session.changes.slice(-limit).reverse();
  }

  getChangesSince(sessionId, timestamp) {
    const session = this.sessions.get(sessionId);
    if (!session) return [];

    return session.changes.filter(c => c.timestamp > timestamp);
  }

  generateUserColor(userId) {
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1',
      '#FFA07A', '#98D8C8', '#F7DC6F',
      '#BB8FCE', '#85C1E2', '#F8B88B'
    ];

    const hash = userId.split('').reduce((acc, char) => {
      return acc + char.charCodeAt(0);
    }, 0);

    return colors[hash % colors.length];
  }

  buildCollaborationUI(sessionId) {
    const session = this.sessions.get(sessionId);
    if (!session) return null;

    const cursors = this.getCursorPositions(sessionId);

    return {
      type: 'box',
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        padding: '16px',
        backgroundColor: '#f9f9f9',
        borderRadius: '6px'
      },
      children: [
        {
          type: 'heading',
          content: `Collaborators (${session.participants.size})`,
          level: 4,
          style: { margin: 0, fontSize: '14px', fontWeight: 600 }
        },
        {
          type: 'box',
          style: {
            display: 'flex',
            gap: '8px',
            flexWrap: 'wrap'
          },
          children: Array.from(session.participants).map(userId => {
            const cursor = cursors.find(c => c.userId === userId);
            return {
              type: 'box',
              style: {
                padding: '8px 12px',
                backgroundColor: '#fff',
                border: `2px solid ${cursor?.color || '#ddd'}`,
                borderRadius: '4px',
                fontSize: '12px'
              },
              children: [
                {
                  type: 'text',
                  content: `${userId}${cursor ? ` (${cursor.line}:${cursor.column})` : ''}`
                }
              ]
            };
          })
        }
      ]
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
          console.error(`Collaboration listener error for ${event}:`, e);
        }
      });
  }

  cleanup() {
    const now = Date.now();

    for (const [key, lock] of this.locks.entries()) {
      if (now > lock.expiresAt) {
        this.locks.delete(key);
      }
    }

    return this;
  }

  clear() {
    this.sessions.clear();
    this.activeEditors.clear();
    this.cursorPositions.clear();
    this.locks.clear();
    this.conflicts = [];
    this.changeLog = [];
    this.listeners = [];
    return this;
  }
}

function createPatternCollaborationManager() {
  return new PatternCollaborationManager();
}

export { PatternCollaborationManager, createPatternCollaborationManager };
