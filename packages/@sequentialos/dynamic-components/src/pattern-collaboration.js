// Facade maintaining 100% backward compatibility
import { CollaborationConnection } from './collaboration-connection.js';
import { CollaborationSessions } from './collaboration-sessions.js';

class PatternCollaborationManager {
  constructor(appId = 'default') {
    this.appId = appId;
    this.connection = new CollaborationConnection(appId);
    this.sessions = new CollaborationSessions();
    this.localUserId = this.sessions.localUserId;
    this.channelId = `pattern-collab-${appId}`;
    this.pendingChanges = [];
  }

  // Connection management (delegated to connection)
  connect(wsUrl) {
    this.connection.on('connected', (data) => this.emit('connected', data));
    this.connection.on('disconnected', () => this.emit('disconnected'));
    this.connection.on('error', (error) => this.emit('error', error));
    this.connection.on('message', (msg) => this.handleMessage(msg));
    return this.connection.connect(wsUrl);
  }

  disconnect() {
    return this.connection.disconnect();
  }

  // Session management (delegated to sessions)
  createSession(sessionName, sessionId) {
    return this.sessions.createSession(sessionName, sessionId);
  }

  getSession(sessionId) {
    return this.sessions.getSession(sessionId);
  }

  joinSession(sessionId, userId, userData) {
    return this.sessions.joinSession(sessionId, userId, userData);
  }

  leaveSession(sessionId, userId) {
    return this.sessions.leaveSession(sessionId, userId);
  }

  addChange(sessionId, change) {
    return this.sessions.addChange(sessionId, change);
  }

  lockResource(sessionId, resourceId, userId, duration) {
    return this.sessions.lockResource(sessionId, resourceId, userId, duration);
  }

  unlockResource(sessionId, lockId) {
    return this.sessions.unlockResource(sessionId, lockId);
  }

  // Messaging
  sendChange(change) {
    const message = {
      type: 'change',
      data: change,
      userId: this.localUserId,
      timestamp: Date.now()
    };
    this.connection.send(message);
  }

  handleMessage(message) {
    if (message.type === 'change') {
      this.pendingChanges.push(message.data);
      this.emit('change', message.data);
    } else if (message.type === 'lock') {
      this.emit('lock', message.data);
    } else if (message.type === 'unlock') {
      this.emit('unlock', message.data);
    }
  }

  // Event system
  on(event, callback) {
    this.connection.on(event, callback);
  }

  off(event, callback) {
    this.connection.off(event, callback);
  }

  emit(event, data) {
    this.connection.emit(event, data);
  }

  // Properties
  get isConnected() {
    return this.connection.isConnected;
  }

  clear() {
    this.sessions.clear();
    this.pendingChanges = [];
  }
}

export { PatternCollaborationManager };
