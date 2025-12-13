// Cursor position tracking for real-time collaboration
export class CollaborationCursorTracker {
  constructor(notifyListeners = null) {
    this.cursorPositions = new Map();
    this.notifyListeners = notifyListeners || (() => {});
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

  removeCursors(sessionId, userId) {
    const key = `${sessionId}:${userId}`;
    this.cursorPositions.delete(key);
  }

  clearCursors() {
    this.cursorPositions.clear();
  }
}
