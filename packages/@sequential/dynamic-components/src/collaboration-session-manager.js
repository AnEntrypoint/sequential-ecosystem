// Collaboration session management
export class CollaborationSessionManager {
  constructor() {
    this.sessions = new Map();
    this.activeEditors = new Map();
    this.listeners = [];
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

    if (session.participants.size === 0) {
      this.sessions.delete(sessionId);
    }

    this.notifyListeners('userLeft', { sessionId, userId });
    return true;
  }

  getSession(sessionId) {
    return this.sessions.get(sessionId);
  }

  getActiveSessions() {
    return Array.from(this.sessions.values());
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

  addListener(event, callback) {
    this.listeners.push({ event, callback });
  }

  removeListener(event, callback) {
    this.listeners = this.listeners.filter(
      l => !(l.event === event && l.callback === callback)
    );
  }

  clearSessions() {
    this.sessions.clear();
    this.activeEditors.clear();
  }
}
