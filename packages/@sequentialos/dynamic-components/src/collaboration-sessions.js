// Collaboration session and user management
export class CollaborationSessions {
  constructor() {
    this.sessions = new Map();
    this.activeUsers = new Map();
    this.localUserId = this.generateUserId();
    this.changeHistory = [];
  }

  generateUserId() {
    return `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  createSession(sessionName, sessionId = null) {
    const id = sessionId || `session-${Date.now()}`;
    const session = {
      id,
      name: sessionName,
      createdAt: Date.now(),
      participants: [],
      changes: [],
      locks: new Map()
    };
    this.sessions.set(id, session);
    return session;
  }

  getSession(sessionId) {
    return this.sessions.get(sessionId);
  }

  joinSession(sessionId, userId, userData = {}) {
    const session = this.sessions.get(sessionId);
    if (!session) return null;

    const participant = {
      userId,
      ...userData,
      joinedAt: Date.now(),
      lastActivity: Date.now()
    };

    if (!session.participants.find(p => p.userId === userId)) {
      session.participants.push(participant);
    }

    this.activeUsers.set(userId, participant);
    return session;
  }

  leaveSession(sessionId, userId) {
    const session = this.sessions.get(sessionId);
    if (!session) return false;

    session.participants = session.participants.filter(p => p.userId !== userId);
    this.activeUsers.delete(userId);
    return true;
  }

  addChange(sessionId, change) {
    const session = this.sessions.get(sessionId);
    if (!session) return null;

    session.changes.push({
      ...change,
      timestamp: Date.now()
    });

    this.changeHistory.push(change);
    return change;
  }

  lockResource(sessionId, resourceId, userId, lockDuration = 30000) {
    const session = this.sessions.get(sessionId);
    if (!session) return null;

    const lockId = `lock-${Date.now()}`;
    session.locks.set(lockId, {
      resourceId,
      userId,
      lockedAt: Date.now(),
      expiresAt: Date.now() + lockDuration
    });

    return lockId;
  }

  unlockResource(sessionId, lockId) {
    const session = this.sessions.get(sessionId);
    if (!session) return false;

    return session.locks.delete(lockId);
  }

  getSessionParticipants(sessionId) {
    const session = this.sessions.get(sessionId);
    return session ? session.participants : [];
  }

  clear() {
    this.sessions.clear();
    this.activeUsers.clear();
    this.changeHistory = [];
  }
}
