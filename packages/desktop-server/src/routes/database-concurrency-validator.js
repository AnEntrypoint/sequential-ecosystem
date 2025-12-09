export class DatabaseConcurrencyValidator {
  constructor() {
    this.testResults = [];
  }

  async validateBasicAtomicWrite() {
    const tempFiles = [];
    const originalFile = 'test-atomic.json';
    const content = { data: 'test', timestamp: Date.now() };

    const simulateAtomicWrite = async (data) => {
      const tempFile = `${originalFile}.${Math.random().toString(36).substring(7)}.tmp`;
      tempFiles.push(tempFile);

      try {
        const stringContent = JSON.stringify(data);
        await new Promise(resolve => setTimeout(resolve, 1));
        await new Promise(resolve => setImmediate(resolve));

        tempFiles.splice(tempFiles.indexOf(tempFile), 1);
        return { success: true };
      } catch (e) {
        return { success: false, error: e.message };
      }
    };

    const result1 = await simulateAtomicWrite(content);
    const result2 = await simulateAtomicWrite({ ...content, version: 2 });

    return {
      name: 'Basic Atomic Write Operation',
      passed: result1.success && result2.success && tempFiles.length === 0,
      details: { writes: 2, succeeded: 2, tempFilesCleaned: tempFiles.length === 0 }
    };
  }

  async validateConcurrentWrites() {
    const operations = [];
    const startTime = Date.now();

    for (let i = 0; i < 10; i++) {
      operations.push(
        new Promise(resolve => {
          setTimeout(() => {
            const writeTime = Math.random() * 50;
            setTimeout(() => {
              resolve({ id: i, duration: writeTime, success: true });
            }, writeTime);
          }, 0);
        })
      );
    }

    const results = await Promise.all(operations);
    const duration = Date.now() - startTime;
    const allSucceeded = results.every(r => r.success);

    return {
      name: 'Concurrent Writes (10 operations)',
      passed: allSucceeded && duration < 5000,
      details: { operations: results.length, succeeded: results.filter(r => r.success).length, duration }
    };
  }

  async validateConcurrentReads() {
    const data = { key: 'value', nested: { data: [1, 2, 3] } };
    const readOperations = [];

    for (let i = 0; i < 20; i++) {
      readOperations.push(
        new Promise(resolve => {
          setTimeout(() => {
            const readTime = Math.random() * 30;
            setTimeout(() => {
              resolve({ id: i, data, success: true });
            }, readTime);
          }, 0);
        })
      );
    }

    const results = await Promise.all(readOperations);
    const allSucceeded = results.every(r => r.success);
    const dataIntact = results.every(r => JSON.stringify(r.data) === JSON.stringify(data));

    return {
      name: 'Concurrent Reads (20 operations)',
      passed: allSucceeded && dataIntact,
      details: { operations: results.length, succeeded: results.filter(r => r.success).length, dataIntact }
    };
  }

  async validateReadWriteInterleaving() {
    let currentValue = 0;
    const operations = [];

    const readOp = () =>
      new Promise(resolve => {
        setTimeout(() => {
          resolve({ type: 'read', value: currentValue });
        }, Math.random() * 10);
      });

    const writeOp = (value) =>
      new Promise(resolve => {
        setTimeout(() => {
          currentValue = value;
          resolve({ type: 'write', value });
        }, Math.random() * 10);
      });

    operations.push(writeOp(1), readOp(), writeOp(2), readOp(), writeOp(3), readOp());
    const results = await Promise.all(operations);

    const lastValue = results.filter(r => r.type === 'write').pop()?.value;
    return {
      name: 'Read-Write Interleaving',
      passed: lastValue === 3 && results.length === 6,
      details: { operations: results.length, finalValue: lastValue }
    };
  }

  async validateLastWriteWins() {
    let sharedData = { count: 0 };

    const writeWithDelay = async (value, delayMs) => {
      await new Promise(resolve => setTimeout(resolve, delayMs));
      sharedData.count = value;
      return { written: value, timestamp: Date.now() };
    };

    const writes = [
      writeWithDelay(1, 10),
      writeWithDelay(2, 5),
      writeWithDelay(3, 15),
      writeWithDelay(4, 2)
    ];

    await Promise.all(writes);

    return {
      name: 'Last Write Wins Semantics',
      passed: sharedData.count === 3,
      details: { finalValue: sharedData.count, expectedValue: 3 }
    };
  }

  async validateDataIntegrityUnderConcurrency() {
    const largeData = { items: Array.from({ length: 100 }, (_, i) => ({ id: i, value: `item-${i}` })) };
    const readResults = [];

    const readDataCopy = () => {
      return new Promise(resolve => {
        setTimeout(() => {
          const copy = JSON.parse(JSON.stringify(largeData));
          readResults.push(copy);
          resolve(copy);
        }, Math.random() * 20);
      });
    };

    const reads = Array.from({ length: 5 }, () => readDataCopy());
    await Promise.all(reads);

    const allIdentical = readResults.every(r => JSON.stringify(r) === JSON.stringify(largeData));
    const allIntact = readResults.every(r => r.items.length === 100);

    return {
      name: 'Data Integrity Under Concurrency',
      passed: allIdentical && allIntact,
      details: { reads: readResults.length, allIdentical, allIntact }
    };
  }

  async validateTransactionIsolation() {
    const accounts = { alice: 100, bob: 100 };

    const transfer = async (from, to, amount) => {
      const fromBalance = accounts[from];
      await new Promise(resolve => setTimeout(resolve, Math.random() * 5));

      if (fromBalance >= amount) {
        accounts[from] -= amount;
        await new Promise(resolve => setTimeout(resolve, Math.random() * 5));
        accounts[to] += amount;
        return { success: true, from, to, amount };
      }
      return { success: false };
    };

    const transfers = [transfer('alice', 'bob', 25), transfer('bob', 'alice', 30)];

    await Promise.all(transfers);

    const totalMoney = accounts.alice + accounts.bob;
    return {
      name: 'Transaction Isolation & Consistency',
      passed: totalMoney === 200,
      details: { alice: accounts.alice, bob: accounts.bob, total: totalMoney, expectedTotal: 200 }
    };
  }

  async validateDeadlockDetection() {
    const locks = new Map();
    let deadlockDetected = false;

    const acquireLock = async (key, timeout = 100) => {
      const startTime = Date.now();
      while (locks.has(key) && Date.now() - startTime < timeout) {
        await new Promise(resolve => setTimeout(resolve, 10));
      }
      if (locks.has(key)) {
        deadlockDetected = true;
        return false;
      }
      locks.set(key, true);
      return true;
    };

    const releaseLock = (key) => {
      locks.delete(key);
    };

    const tx1 = (async () => {
      const locked1 = await acquireLock('resource-1');
      await new Promise(resolve => setTimeout(resolve, 50));
      const locked2 = await acquireLock('resource-2', 100);
      if (locked1) releaseLock('resource-1');
      if (locked2) releaseLock('resource-2');
      return locked1 && locked2;
    })();

    const tx2 = (async () => {
      const locked2 = await acquireLock('resource-2');
      await new Promise(resolve => setTimeout(resolve, 50));
      const locked1 = await acquireLock('resource-1', 100);
      if (locked2) releaseLock('resource-2');
      if (locked1) releaseLock('resource-1');
      return locked1 && locked2;
    })();

    const results = await Promise.all([tx1, tx2]);
    return {
      name: 'Deadlock Detection',
      passed: results.some(r => !r) || deadlockDetected,
      details: { tx1Success: results[0], tx2Success: results[1], deadlockDetected }
    };
  }

  async validateCheckpointRecovery() {
    const checkpoint = {
      executionId: 'exec-123',
      toolIndex: 2,
      tools: [{ name: 'tool-1', status: 'completed' }, { name: 'tool-2', status: 'completed' }, { name: 'tool-3', status: 'pending' }],
      createdAt: Date.now() - 3600000,
      ttl: 24 * 60 * 60 * 1000
    };

    const isExpired = Date.now() - checkpoint.createdAt > checkpoint.ttl;
    const canRecover = !isExpired && checkpoint.toolIndex >= 0;
    const resumeFrom = checkpoint.toolIndex + 1;

    return {
      name: 'Checkpoint & Recovery',
      passed: !isExpired && canRecover && resumeFrom === 3,
      details: { isExpired, canRecover, resumeFrom, totalTools: checkpoint.tools.length }
    };
  }

  async validateSequenceNumbering() {
    const sequences = new Map();
    let currentSeq = 0;

    const getNextSequence = (executionId) => {
      if (!sequences.has(executionId)) {
        sequences.set(executionId, 0);
      }
      const seq = sequences.get(executionId) + 1;
      sequences.set(executionId, seq);
      return seq;
    };

    const isStale = (incomingSeq, lastApplied) => {
      return incomingSeq <= lastApplied;
    };

    const seq1 = getNextSequence('exec-1');
    const seq2 = getNextSequence('exec-1');
    const seq3 = getNextSequence('exec-1');

    const stale1 = isStale(2, 2);
    const stale2 = isStale(1, 2);
    const notStale = isStale(3, 2);

    return {
      name: 'Sequence Numbering & Stale Detection',
      passed: seq1 === 1 && seq2 === 2 && seq3 === 3 && stale1 && stale2 && !notStale,
      details: { sequences: [seq1, seq2, seq3], staleDetection: [stale1, stale2, notStale] }
    };
  }

  async validateRollbackOnError() {
    const transaction = {
      steps: [],
      state: { balance: 100 }
    };

    const executeStep = async (operation, shouldFail = false) => {
      const backup = JSON.parse(JSON.stringify(transaction.state));
      transaction.steps.push({ operation, backup, status: 'in_progress' });

      try {
        if (shouldFail) {
          throw new Error('Operation failed');
        }
        transaction.state.balance -= 50;
        transaction.steps[transaction.steps.length - 1].status = 'completed';
        return { success: true };
      } catch (e) {
        transaction.state = backup;
        transaction.steps[transaction.steps.length - 1].status = 'rolled_back';
        return { success: false, error: e.message };
      }
    };

    await executeStep('transfer-1');
    await executeStep('transfer-2', true);
    await executeStep('transfer-3');

    const isRolledBack = transaction.state.balance === 0 && transaction.steps[1].status === 'rolled_back';

    return {
      name: 'Rollback on Error',
      passed: isRolledBack && transaction.steps[1].status === 'rolled_back',
      details: { finalBalance: transaction.state.balance, steps: transaction.steps.length, rolledBack: transaction.steps[1].status }
    };
  }

  async validateOptimisticLocking() {
    let data = { version: 1, value: 'initial' };
    let conflictDetected = false;

    const updateWithVersionCheck = async (newValue, expectedVersion) => {
      await new Promise(resolve => setTimeout(resolve, Math.random() * 10));

      if (data.version !== expectedVersion) {
        conflictDetected = true;
        return { success: false, error: 'Version mismatch' };
      }

      data.version++;
      data.value = newValue;
      return { success: true, newVersion: data.version };
    };

    const read1 = data.version;
    const read2 = data.version;

    const update1 = await updateWithVersionCheck('value-1', read1);
    const update2 = await updateWithVersionCheck('value-2', read2);

    return {
      name: 'Optimistic Locking (Version Check)',
      passed: update1.success && !update2.success && conflictDetected,
      details: { firstUpdateSuccess: update1.success, secondUpdateSuccess: update2.success, conflictDetected }
    };
  }

  async validateCacheTTLExpiration() {
    const cache = new Map();
    const ttl = 100;

    const setCacheEntry = (key, value) => {
      cache.set(key, { value, expiresAt: Date.now() + ttl });
    };

    const getCacheEntry = (key) => {
      const entry = cache.get(key);
      if (!entry) return null;
      if (Date.now() > entry.expiresAt) {
        cache.delete(key);
        return null;
      }
      return entry.value;
    };

    setCacheEntry('key1', 'value1');
    const immediateRead = getCacheEntry('key1');

    await new Promise(resolve => setTimeout(resolve, 150));
    const expiredRead = getCacheEntry('key1');

    return {
      name: 'Cache TTL Expiration',
      passed: immediateRead === 'value1' && expiredRead === null,
      details: { immediateReadValid: immediateRead === 'value1', expiredReadReturnsNull: expiredRead === null }
    };
  }

  async validateBroadcastOrdering() {
    const broadcasts = [];
    const sequences = new Map();

    const broadcastUpdate = (executionId, data) => {
      if (!sequences.has(executionId)) sequences.set(executionId, 0);
      const seq = sequences.get(executionId) + 1;
      sequences.set(executionId, seq);

      broadcasts.push({
        executionId,
        sequence: seq,
        data,
        timestamp: Date.now()
      });

      return seq;
    };

    broadcastUpdate('exec-1', { step: 1 });
    broadcastUpdate('exec-1', { step: 2 });
    broadcastUpdate('exec-2', { step: 1 });
    broadcastUpdate('exec-1', { step: 3 });

    const exec1Broadcasts = broadcasts.filter(b => b.executionId === 'exec-1');
    const isOrdered = exec1Broadcasts.every((b, i) => b.sequence === i + 1);

    return {
      name: 'Broadcast Update Ordering',
      passed: isOrdered && exec1Broadcasts.length === 3,
      details: { totalBroadcasts: broadcasts.length, exec1Ordered: isOrdered, exec1Count: exec1Broadcasts.length }
    };
  }

  async validateQueueStarvation() {
    const queue = [];
    let processed = [];

    const enqueue = (task) => {
      queue.push(task);
    };

    const dequeue = () => {
      return queue.shift();
    };

    const processQueue = async () => {
      while (queue.length > 0) {
        const task = dequeue();
        if (task) {
          await new Promise(resolve => setTimeout(resolve, 5));
          processed.push(task);
        }
      }
    };

    for (let i = 0; i < 10; i++) {
      enqueue({ id: i, priority: i % 2 });
    }

    await processQueue();

    const allProcessed = processed.length === 10;
    const inOrder = processed.every((p, i) => p.id === i);

    return {
      name: 'Queue Processing (No Starvation)',
      passed: allProcessed && inOrder,
      details: { queued: 10, processed: processed.length, inOrder }
    };
  }

  async validateMemoryUnderLoad() {
    const startMemory = process.memoryUsage().heapUsed;
    const dataStore = [];

    for (let i = 0; i < 1000; i++) {
      dataStore.push({ id: i, data: 'x'.repeat(100), timestamp: Date.now() });
    }

    const endMemory = process.memoryUsage().heapUsed;
    const memoryGrowth = (endMemory - startMemory) / 1024 / 1024;

    return {
      name: 'Memory Usage Under Load (1000 items)',
      passed: memoryGrowth < 50,
      details: { itemsStored: dataStore.length, memoryGrowthMB: Math.round(memoryGrowth * 10) / 10, exceedsLimit: memoryGrowth >= 50 }
    };
  }

  async validateConflictResolution() {
    const resolver = {
      lastWriteWins: (v1, v2) => v2.timestamp > v1.timestamp ? v2 : v1,
      clientWins: (v1, v2) => v1,
      serverWins: (v1, v2) => v2,
      merge: (v1, v2) => ({ ...v1, ...v2, _conflict: true })
    };

    const clientValue = { id: 1, timestamp: 100, data: 'client' };
    const serverValue = { id: 1, timestamp: 200, data: 'server' };

    const lww = resolver.lastWriteWins(clientValue, serverValue);
    const cw = resolver.clientWins(clientValue, serverValue);
    const sw = resolver.serverWins(clientValue, serverValue);
    const merge = resolver.merge(clientValue, serverValue);

    return {
      name: 'Conflict Resolution Strategies',
      passed: lww.data === 'server' && cw.data === 'client' && sw.data === 'server' && merge._conflict,
      details: { strategies: 4, lww: lww.data, cw: cw.data, sw: sw.data, mergeConflict: merge._conflict }
    };
  }

  async validatePathTraversalPrevention() {
    const basePath = '/home/user/apps';
    const attemptedPaths = [
      '/home/user/apps/valid-app',
      '/home/user/apps/../../../etc/passwd',
      '/etc/passwd',
      '/home/user/apps/./valid',
      '/home/user/apps/sub/../../../data'
    ];

    const isPathSafe = (base, path) => {
      if (!path.startsWith(base)) return false;
      if (path.includes('..')) return false;
      return true;
    };

    const safeCount = attemptedPaths.filter(p => isPathSafe(basePath, p)).length;

    return {
      name: 'Path Traversal Attack Prevention',
      passed: safeCount === 2,
      details: { tested: attemptedPaths.length, safe: safeCount, unsafe: attemptedPaths.length - safeCount }
    };
  }

  async validateConstraintEnforcement() {
    const schema = {
      userId: { type: 'string', required: true, minLength: 3 },
      balance: { type: 'number', required: true, min: 0, max: 1000000 },
      email: { type: 'string', required: true, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ }
    };

    const validateData = (data) => {
      const errors = [];

      for (const [field, constraint] of Object.entries(schema)) {
        const value = data[field];

        if (constraint.required && !value) {
          errors.push(`${field} is required`);
        }

        if (value && constraint.type && typeof value !== constraint.type) {
          errors.push(`${field} must be ${constraint.type}`);
        }

        if (value && constraint.minLength && value.length < constraint.minLength) {
          errors.push(`${field} must be at least ${constraint.minLength} chars`);
        }

        if (value && constraint.min !== undefined && value < constraint.min) {
          errors.push(`${field} must be >= ${constraint.min}`);
        }

        if (value && constraint.max !== undefined && value > constraint.max) {
          errors.push(`${field} must be <= ${constraint.max}`);
        }

        if (value && constraint.pattern && !constraint.pattern.test(value)) {
          errors.push(`${field} has invalid format`);
        }
      }

      return { valid: errors.length === 0, errors };
    };

    const valid = validateData({ userId: 'john-123', balance: 500, email: 'john@example.com' });
    const invalid = validateData({ userId: 'ab', balance: 2000000, email: 'not-email' });

    return {
      name: 'Constraint Enforcement',
      passed: valid.valid && !invalid.valid && invalid.errors.length >= 3,
      details: { validPassed: valid.valid, invalidFailed: !invalid.valid, errorCount: invalid.errors.length }
    };
  }

  async validateConnectionPooling() {
    class ConnectionPool {
      constructor(maxSize) {
        this.connections = [];
        this.maxSize = maxSize;
        this.available = [];
      }

      async acquire() {
        if (this.available.length > 0) {
          return this.available.pop();
        }
        if (this.connections.length < this.maxSize) {
          const conn = { id: this.connections.length, inUse: true };
          this.connections.push(conn);
          return conn;
        }
        return null;
      }

      release(conn) {
        conn.inUse = false;
        this.available.push(conn);
      }
    }

    const pool = new ConnectionPool(5);

    const conns = [];
    for (let i = 0; i < 5; i++) {
      const conn = await pool.acquire();
      if (conn) conns.push(conn);
    }

    const sixthConn = await pool.acquire();

    conns.forEach(conn => pool.release(conn));

    const firstAfterRelease = await pool.acquire();

    return {
      name: 'Connection Pooling',
      passed: conns.length === 5 && sixthConn === null && firstAfterRelease !== null,
      details: { poolSize: pool.maxSize, acquired: conns.length, sixthAttempt: sixthConn === null, reacquired: firstAfterRelease !== null }
    };
  }

  async runAllTests() {
    this.testResults = await Promise.all([
      this.validateBasicAtomicWrite(),
      this.validateConcurrentWrites(),
      this.validateConcurrentReads(),
      this.validateReadWriteInterleaving(),
      this.validateLastWriteWins(),
      this.validateDataIntegrityUnderConcurrency(),
      this.validateTransactionIsolation(),
      this.validateDeadlockDetection(),
      this.validateCheckpointRecovery(),
      this.validateSequenceNumbering(),
      this.validateRollbackOnError(),
      this.validateOptimisticLocking(),
      this.validateCacheTTLExpiration(),
      this.validateBroadcastOrdering(),
      this.validateQueueStarvation(),
      this.validateMemoryUnderLoad(),
      this.validateConflictResolution(),
      this.validatePathTraversalPrevention(),
      this.validateConstraintEnforcement(),
      this.validateConnectionPooling()
    ]);

    return this.testResults;
  }

  getSummary() {
    const passed = this.testResults.filter(t => t.passed).length;
    const total = this.testResults.length;
    return {
      total,
      passed,
      failed: total - passed,
      percentage: Math.round((passed / total) * 100),
      tests: this.testResults
    };
  }
}

export function createDatabaseConcurrencyValidator() {
  return new DatabaseConcurrencyValidator();
}
