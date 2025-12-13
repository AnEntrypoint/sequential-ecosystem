export function createAtomicWriteController() {
  const writeLocks = new Map();
  const pendingWrites = new Map();

  return {
    acquireLock(lockKey) {
      if (writeLocks.has(lockKey)) {
        return null;
      }

      const lock = {
        key: lockKey,
        acquiredAt: new Date().toISOString(),
        released: false
      };

      writeLocks.set(lockKey, lock);
      return lock;
    },

    releaseLock(lockKey) {
      if (!writeLocks.has(lockKey)) {
        return false;
      }

      const lock = writeLocks.get(lockKey);
      lock.released = true;
      writeLocks.delete(lockKey);
      return true;
    },

    isLocked(lockKey) {
      return writeLocks.has(lockKey);
    },

    async waitForLock(lockKey, timeoutMs = 5000) {
      const startTime = Date.now();

      while (this.isLocked(lockKey)) {
        if (Date.now() - startTime > timeoutMs) {
          return false;
        }
        await new Promise(function(resolve) { setTimeout(resolve, 100); });
      }

      return true;
    },

    queueWrite(lockKey, data) {
      if (!pendingWrites.has(lockKey)) {
        pendingWrites.set(lockKey, []);
      }

      const queue = pendingWrites.get(lockKey);
      const write = {
        data: data,
        queuedAt: new Date().toISOString()
      };

      queue.push(write);
      return write;
    },

    getPendingWrites(lockKey) {
      const queue = pendingWrites.get(lockKey) || [];
      return queue.slice();
    },

    flushWrites(lockKey) {
      const queue = pendingWrites.get(lockKey) || [];
      const flushed = queue.slice();
      pendingWrites.set(lockKey, []);
      return flushed;
    },

    validateJSON(content) {
      try {
        JSON.parse(content);
        return { valid: true, error: null };
      } catch (err) {
        return { valid: false, error: err.message };
      }
    },

    createAtomicWritePlan(lockKey, data) {
      const plan = {
        lockKey: lockKey,
        tempFile: lockKey + '.tmp',
        originalFile: lockKey,
        data: data,
        steps: [
          { step: 'acquire_lock', status: 'pending' },
          { step: 'write_temp', status: 'pending' },
          { step: 'validate_json', status: 'pending' },
          { step: 'atomic_rename', status: 'pending' },
          { step: 'release_lock', status: 'pending' }
        ]
      };

      return plan;
    },

    markStepComplete(plan, stepName) {
      for (const step of plan.steps) {
        if (step.step === stepName) {
          step.status = 'complete';
          return true;
        }
      }
      return false;
    },

    markStepFailed(plan, stepName, error) {
      for (const step of plan.steps) {
        if (step.step === stepName) {
          step.status = 'failed';
          step.error = error;
          return true;
        }
      }
      return false;
    },

    getPlanStatus(plan) {
      const completed = plan.steps.filter(function(s) { return s.status === 'complete'; }).length;
      const failed = plan.steps.filter(function(s) { return s.status === 'failed'; }).length;

      return {
        lockKey: plan.lockKey,
        progress: completed + '/' + plan.steps.length,
        failed: failed,
        complete: completed === plan.steps.length,
        steps: plan.steps
      };
    },

    getAllLocks() {
      return Array.from(writeLocks.keys());
    },

    clearLocks() {
      writeLocks.clear();
      pendingWrites.clear();
    }
  };
}
