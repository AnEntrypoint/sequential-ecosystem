// Lock management for collaborative editing
export class CollaborationLockManager {
  constructor(lockTimeout = 30000, notifyListeners = null) {
    this.locks = new Map();
    this.lockTimeout = lockTimeout;
    this.notifyListeners = notifyListeners || (() => {});
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

  cleanup() {
    const now = Date.now();

    for (const [key, lock] of this.locks.entries()) {
      if (now > lock.expiresAt) {
        this.locks.delete(key);
      }
    }
  }

  clearLocks() {
    this.locks.clear();
  }
}
