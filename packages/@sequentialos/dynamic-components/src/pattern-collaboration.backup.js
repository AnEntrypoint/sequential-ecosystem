class PatternCollaborationManager {
  constructor(appId = 'default') {
    this.appId = appId;
    this.ws = null;
    this.sessions = new Map();
    this.activeUsers = new Map();
    this.pendingChanges = [];
    this.changeHistory = [];
    this.localUserId = this.generateUserId();
    this.channelId = `pattern-collab-${appId}`;
    this.listeners = new Map();
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
  }

  generateUserId() {
    return `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  connect(wsUrl) {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(wsUrl);

        this.ws.onopen = () => {
          this.isConnected = true;
          this.reconnectAttempts = 0;
          this.joinChannel();
          this.emit('connected', { userId: this.localUserId });
          resolve();
        };

        this.ws.onmessage = (event) => {
          const message = JSON.parse(event.data);
          this.handleMessage(message);
        };

        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          this.emit('error', error);
          reject(error);
        };

        this.ws.onclose = () => {
          this.isConnected = false;
          this.emit('disconnected');
          this.attemptReconnect(wsUrl);
        };
      } catch (e) {
        reject(e);
      }
    });
  }

  attemptReconnect(wsUrl) {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts - 1), 30000);
      setTimeout(() => this.connect(wsUrl), delay);
    }
  }

  joinChannel() {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'join-channel',
        channelId: this.channelId,
        userId: this.localUserId,
        metadata: {
          joinedAt: new Date().toISOString()
        }
      }));
    }
  }

  startEditingPattern(patternId, patternDef) {
    const session = {
      patternId,
      sessionId: `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      owner: this.localUserId,
      definition: patternDef,
      startedAt: Date.now(),
      lastModified: Date.now(),
      locks: new Map(),
      collaborators: new Set([this.localUserId])
    };

    this.sessions.set(session.sessionId, session);

    this.broadcast({
      type: 'pattern-edit-start',
      sessionId: session.sessionId,
      patternId,
      userId: this.localUserId,
      definition: patternDef,
      timestamp: new Date().toISOString()
    });

    return session.sessionId;
  }

  updatePattern(sessionId, updates, metadata = {}) {
    const session = this.sessions.get(sessionId);
    if (!session) return null;

    const change = {
      id: `change-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      sessionId,
      patternId: session.patternId,
      userId: this.localUserId,
      updates,
      metadata,
      timestamp: Date.now(),
      isoTime: new Date().toISOString(),
      applied: false,
      conflicted: false
    };

    session.definition = { ...session.definition, ...updates };
    session.lastModified = Date.now();
    this.changeHistory.push(change);

    this.broadcast({
      type: 'pattern-update',
      sessionId,
      patternId: session.patternId,
      change,
      userId: this.localUserId
    });

    return change;
  }

  lockPattern(patternId, lockKey = null) {
    const lockId = lockKey || `lock-${Date.now()}`;
    const lock = {
      id: lockId,
      patternId,
      owner: this.localUserId,
      acquiredAt: Date.now(),
      isoTime: new Date().toISOString()
    };

    this.broadcast({
      type: 'pattern-lock',
      patternId,
      lockId,
      userId: this.localUserId,
      timestamp: new Date().toISOString()
    });

    return lock;
  }

  unlockPattern(patternId, lockId) {
    this.broadcast({
      type: 'pattern-unlock',
      patternId,
      lockId,
      userId: this.localUserId,
      timestamp: new Date().toISOString()
    });
  }

  resolveConflict(change1, change2) {
    const conflict = {
      change1,
      change2,
      detectedAt: Date.now(),
      resolution: null
    };

    const updates1 = JSON.stringify(change1.updates);
    const updates2 = JSON.stringify(change2.updates);

    if (updates1 === updates2) {
      conflict.resolution = 'identical';
      return conflict;
    }

    const keys1 = Object.keys(change1.updates);
    const keys2 = Object.keys(change2.updates);
    const overlap = keys1.filter(k => keys2.includes(k));

    if (overlap.length === 0) {
      conflict.resolution = 'non-overlapping';
      return conflict;
    }

    conflict.resolution = 'requires-manual-merge';
    conflict.conflictingFields = overlap;
    conflict.strategy = 'last-write-wins';
    conflict.winner = change2.timestamp > change1.timestamp ? change2 : change1;

    return conflict;
  }

  addUser(userId, userInfo = {}) {
    this.activeUsers.set(userId, {
      id: userId,
      joinedAt: Date.now(),
      lastSeen: Date.now(),
      editingPatterns: new Set(),
      ...userInfo
    });

    this.emit('user-joined', { userId, userInfo });
  }

  removeUser(userId) {
    this.activeUsers.delete(userId);
    this.emit('user-left', { userId });
  }

  getSessionCollaborators(sessionId) {
    const session = this.sessions.get(sessionId);
    if (!session) return [];

    return Array.from(session.collaborators).map(userId => {
      const user = this.activeUsers.get(userId);
      return user || { id: userId, unknown: true };
    });
  }

  on(eventType, callback) {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, []);
    }
    this.listeners.get(eventType).push(callback);

    return () => {
      const callbacks = this.listeners.get(eventType);
      const idx = callbacks.indexOf(callback);
      if (idx > -1) callbacks.splice(idx, 1);
    };
  }

  emit(eventType, data) {
    const callbacks = this.listeners.get(eventType) || [];
    callbacks.forEach(callback => {
      try {
        callback(data);
      } catch (e) {
        console.error(`Error in ${eventType} listener:`, e);
      }
    });
  }

  handleMessage(message) {
    const { type } = message;

    switch (type) {
      case 'user-joined':
        this.addUser(message.userId, message.userInfo);
        this.emit('remote-user-joined', message);
        break;

      case 'user-left':
        this.removeUser(message.userId);
        this.emit('remote-user-left', message);
        break;

      case 'pattern-edit-start':
        if (message.userId !== this.localUserId) {
          this.emit('remote-edit-start', message);
        }
        break;

      case 'pattern-update':
        if (message.userId !== this.localUserId) {
          this.handleRemoteUpdate(message);
        }
        break;

      case 'pattern-lock':
        if (message.userId !== this.localUserId) {
          this.emit('remote-lock', message);
        }
        break;

      case 'pattern-unlock':
        if (message.userId !== this.localUserId) {
          this.emit('remote-unlock', message);
        }
        break;

      case 'presence-update':
        this.emit('presence-update', message);
        break;

      case 'sync-request':
        this.handleSyncRequest(message);
        break;

      default:
        this.emit('message', message);
    }
  }

  handleRemoteUpdate(message) {
    const { change, userId } = message;
    change.applied = true;
    this.changeHistory.push(change);
    this.emit('remote-update', { change, userId });
  }

  handleSyncRequest(message) {
    const { sessionId, userId } = message;
    const session = this.sessions.get(sessionId);

    if (session) {
      this.broadcast({
        type: 'sync-response',
        sessionId,
        definition: session.definition,
        changeHistory: this.changeHistory.filter(c => c.sessionId === sessionId),
        timestamp: new Date().toISOString()
      });
    }
  }

  broadcast(message) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        ...message,
        channelId: this.channelId,
        userId: this.localUserId
      }));
    } else {
      this.pendingChanges.push(message);
    }
  }

  getSessionStats(sessionId) {
    const session = this.sessions.get(sessionId);
    if (!session) return null;

    const sessionChanges = this.changeHistory.filter(c => c.sessionId === sessionId);
    const conflictedChanges = sessionChanges.filter(c => c.conflicted).length;
    const appliedChanges = sessionChanges.filter(c => c.applied).length;

    return {
      sessionId,
      patternId: session.patternId,
      owner: session.owner,
      collaborators: Array.from(session.collaborators),
      startedAt: session.startedAt,
      lastModified: session.lastModified,
      duration: Date.now() - session.startedAt,
      totalChanges: sessionChanges.length,
      appliedChanges,
      conflictedChanges,
      conflictRate: sessionChanges.length > 0 ? (conflictedChanges / sessionChanges.length) : 0
    };
  }

  buildCollaborationUI() {
    return {
      type: 'box',
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        padding: '12px',
        background: '#1e1e1e',
        borderRadius: '6px'
      },
      children: [
        {
          type: 'heading',
          content: '👥 Collaboration',
          level: 3,
          style: {
            margin: 0,
            fontSize: '12px',
            color: '#e0e0e0',
            textTransform: 'uppercase'
          }
        },
        {
          type: 'box',
          style: {
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 12px',
            background: '#2d2d30',
            borderRadius: '4px'
          },
          children: [
            {
              type: 'box',
              style: {
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: this.isConnected ? '#4ade80' : '#ef4444'
              }
            },
            {
              type: 'paragraph',
              content: this.isConnected ? 'Connected' : 'Disconnected',
              style: {
                margin: 0,
                fontSize: '11px',
                color: this.isConnected ? '#4ade80' : '#ef4444'
              }
            }
          ]
        },
        {
          type: 'box',
          style: {
            display: 'flex',
            flexDirection: 'column',
            gap: '4px'
          },
          children: Array.from(this.activeUsers.values())
            .slice(0, 5)
            .map(user => ({
              type: 'box',
              style: {
                padding: '6px 8px',
                background: '#3e3e42',
                borderRadius: '3px',
                fontSize: '10px',
                color: '#d4d4d4'
              },
              children: [
                {
                  type: 'paragraph',
                  content: user.id === this.localUserId ? `${user.id} (you)` : user.id,
                  style: {
                    margin: 0
                  }
                }
              ]
            }))
            .concat(this.activeUsers.size > 5 ? [{
              type: 'paragraph',
              content: `+${this.activeUsers.size - 5} more`,
              style: {
                margin: '4px 8px 0 8px',
                fontSize: '10px',
                color: '#858585'
              }
            }] : [])
        },
        {
          type: 'paragraph',
          content: `Active Sessions: ${this.sessions.size}`,
          style: {
            margin: '8px 0 0 0',
            fontSize: '10px',
            color: '#858585',
            paddingTop: '8px',
            borderTop: '1px solid #3e3e42'
          }
        }
      ]
    };
  }

  getActiveSessionsUI() {
    const activeSessions = Array.from(this.sessions.values()).slice(0, 10);

    return {
      type: 'box',
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        padding: '12px'
      },
      children: activeSessions.length > 0
        ? activeSessions.map(session => ({
          type: 'box',
          style: {
            padding: '8px 12px',
            background: '#2d2d30',
            borderRadius: '4px',
            borderLeft: '3px solid #667eea',
            cursor: 'pointer'
          },
          children: [
            {
              type: 'paragraph',
              content: `Pattern: ${session.patternId}`,
              style: {
                margin: 0,
                fontSize: '11px',
                fontWeight: 600,
                color: '#667eea'
              }
            },
            {
              type: 'paragraph',
              content: `Owner: ${session.owner === this.localUserId ? 'You' : session.owner}`,
              style: {
                margin: '2px 0 0 0',
                fontSize: '10px',
                color: '#858585'
              }
            },
            {
              type: 'paragraph',
              content: `Collaborators: ${session.collaborators.size}`,
              style: {
                margin: '2px 0 0 0',
                fontSize: '10px',
                color: '#858585'
              }
            }
          ]
        }))
        : [{
          type: 'paragraph',
          content: 'No active sessions',
          style: {
            margin: 0,
            fontSize: '11px',
            color: '#858585',
            textAlign: 'center',
            padding: '12px'
          }
        }]
    };
  }

  exportCollaborationHistory(sessionId = null) {
    const history = sessionId
      ? this.changeHistory.filter(c => c.sessionId === sessionId)
      : this.changeHistory;

    return {
      export: 'collaboration-history',
      appId: this.appId,
      localUserId: this.localUserId,
      totalChanges: history.length,
      changes: history.map(c => ({
        id: c.id,
        sessionId: c.sessionId,
        userId: c.userId,
        timestamp: c.isoTime,
        updates: c.updates,
        applied: c.applied,
        conflicted: c.conflicted
      })),
      exportedAt: new Date().toISOString()
    };
  }

  clearHistory() {
    this.changeHistory = [];
    this.pendingChanges = [];
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.isConnected = false;
    }
  }
}

function createPatternCollaborationManager(appId = 'default') {
  return new PatternCollaborationManager(appId);
}

export { PatternCollaborationManager, createPatternCollaborationManager };
