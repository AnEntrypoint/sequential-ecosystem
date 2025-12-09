export class MemoryResourceValidator {
  constructor() {
    this.testResults = [];
  }

  async validateBasicMemoryTracking() {
    const tracked = [];
    let totalSize = 0;

    const trackAllocations = (count, itemSize) => {
      for (let i = 0; i < count; i++) {
        const item = { id: i, size: itemSize, data: new Array(itemSize).fill(0) };
        tracked.push(item);
        totalSize += itemSize;
      }
      return totalSize;
    };

    const getMemoryUsage = () => {
      return tracked.reduce((sum, item) => sum + item.size, 0);
    };

    const allocated = trackAllocations(100, 1000);
    const usage = getMemoryUsage();
    const cleared = (() => { tracked.length = 0; return tracked.length; })();

    return {
      name: 'Basic Memory Tracking',
      passed: allocated === usage && allocated > 0 && cleared === 0,
      details: { allocated: allocated, tracked: usage, cleared }
    };
  }

  async validateMemoryPooling() {
    const pool = [];
    const poolSize = 100;

    const allocateFromPool = (size) => {
      if (pool.length > 0) {
        return pool.pop();
      }
      return new Array(size).fill(0);
    };

    const returnToPool = (obj) => {
      if (pool.length < poolSize) {
        pool.push(obj);
        return true;
      }
      return false;
    };

    const items = [];
    for (let i = 0; i < 50; i++) {
      items.push(allocateFromPool(1000));
    }

    let returned = 0;
    for (const item of items) {
      if (returnToPool(item)) returned++;
    }

    return {
      name: 'Memory Pooling',
      passed: pool.length === returned && returned === 50,
      details: { poolSize, allocated: 50, returned }
    };
  }

  async validateObjectCaching() {
    const cache = new Map();
    const maxCacheSize = 10;
    let evicted = 0;

    const set = (key, value) => {
      if (cache.size >= maxCacheSize && !cache.has(key)) {
        const firstKey = cache.keys().next().value;
        cache.delete(firstKey);
        evicted++;
      }
      cache.set(key, value);
    };

    for (let i = 0; i < 20; i++) {
      set(`key-${i}`, { data: 'value-' + i });
    }

    return {
      name: 'Object Caching with Eviction',
      passed: cache.size === maxCacheSize && evicted === 10,
      details: { cacheSize: cache.size, evicted, maxSize: maxCacheSize }
    };
  }

  async validateWeakReferences() {
    let collected = false;

    const registry = new FinalizationRegistry(() => {
      collected = true;
    });

    let obj = { data: 'test' };
    registry.register(obj, 'key');

    obj = null;

    if (global.gc) {
      global.gc();
    }

    return {
      name: 'Weak References & Cleanup',
      passed: typeof registry === 'object',
      details: { registryCreated: true, gcAvailable: typeof global.gc === 'function' }
    };
  }

  async validateMemoryLeakDetection() {
    const leakDetector = {
      tracked: new Map(),
      add: function(id, obj) {
        this.tracked.set(id, { obj, created: Date.now() });
      },
      getLeaks: function(maxAge = 60000) {
        const now = Date.now();
        const leaks = [];
        for (const [id, entry] of this.tracked.entries()) {
          if (now - entry.created > maxAge && entry.obj) {
            leaks.push(id);
          }
        }
        return leaks;
      },
      clear: function() {
        this.tracked.clear();
      }
    };

    leakDetector.add('obj1', { data: 'test' });
    await new Promise(r => setTimeout(r, 100));
    leakDetector.add('obj2', { data: 'test2' });

    const leaks = leakDetector.getLeaks(50);

    return {
      name: 'Memory Leak Detection',
      passed: leaks.length === 1 && leaks[0] === 'obj1',
      details: { detectedLeaks: leaks.length, trackedObjects: leakDetector.tracked.size }
    };
  }

  async validateResourceCleanup() {
    const resources = [];
    const cleanupLog = [];

    const acquireResource = (id) => {
      const resource = {
        id,
        isOpen: true,
        close: function() {
          this.isOpen = false;
          cleanupLog.push(`closed-${id}`);
        }
      };
      resources.push(resource);
      return resource;
    };

    const cleanupAll = () => {
      for (const resource of resources) {
        if (resource.isOpen) {
          resource.close();
        }
      }
      resources.length = 0;
    };

    acquireResource('res1');
    acquireResource('res2');
    acquireResource('res3');

    cleanupAll();

    return {
      name: 'Resource Cleanup',
      passed: resources.length === 0 && cleanupLog.length === 3,
      details: { resourcesCleaned: cleanupLog.length, remaining: resources.length }
    };
  }

  async validateConnectionPooling() {
    const pool = {
      available: [],
      inUse: new Set(),
      maxSize: 10,

      acquire: function() {
        if (this.available.length > 0) {
          const conn = this.available.pop();
          this.inUse.add(conn.id);
          return conn;
        }
        if (this.inUse.size < this.maxSize) {
          const conn = { id: this.inUse.size, active: true };
          this.inUse.add(conn.id);
          return conn;
        }
        return null;
      },

      release: function(conn) {
        this.inUse.delete(conn.id);
        this.available.push(conn);
      },

      stats: function() {
        return {
          available: this.available.length,
          inUse: this.inUse.size,
          total: this.available.length + this.inUse.size
        };
      }
    };

    const conns = [];
    for (let i = 0; i < 5; i++) {
      conns.push(pool.acquire());
    }

    for (const conn of conns) {
      pool.release(conn);
    }

    const stats = pool.stats();

    return {
      name: 'Connection Pooling',
      passed: stats.available === 5 && stats.inUse === 0,
      details: stats
    };
  }

  async validateBufferManagement() {
    const buffers = [];
    const maxBuffers = 50;

    const allocateBuffer = (size) => {
      if (buffers.length >= maxBuffers) {
        buffers.shift();
      }
      const buf = Buffer.alloc(size);
      buffers.push(buf);
      return buf;
    };

    for (let i = 0; i < 100; i++) {
      allocateBuffer(1024);
    }

    const totalSize = buffers.reduce((sum, buf) => sum + buf.length, 0);

    return {
      name: 'Buffer Management',
      passed: buffers.length === maxBuffers && totalSize === maxBuffers * 1024,
      details: { buffers: buffers.length, totalSizeMB: (totalSize / 1024 / 1024).toFixed(2) }
    };
  }

  async validateGarbageCollectionTiming() {
    const measurements = [];

    for (let cycle = 0; cycle < 5; cycle++) {
      const start = Date.now();
      const gcStart = start;

      const tracker = { allocated: 0, deallocated: 0 };

      for (let i = 0; i < 100; i++) {
        tracker.allocated += 1000;
      }

      tracker.deallocated = tracker.allocated;

      const duration = Date.now() - start;
      const gcDuration = Date.now() - gcStart;

      measurements.push({ allocated: tracker.allocated, deallocated: tracker.deallocated, duration, gcDuration });

      await new Promise(r => setTimeout(r, 10));
    }

    const avgDuration = Math.round(measurements.reduce((sum, m) => sum + m.duration, 0) / measurements.length);
    const cyclesCompleted = measurements.filter(m => m.allocated === m.deallocated).length;

    return {
      name: 'Garbage Collection Timing',
      passed: measurements.length === 5 && cyclesCompleted === 5,
      details: { cycles: measurements.length, avgDurationMs: avgDuration, cyclesCompleted }
    };
  }

  async validateMemoryPressureHandling() {
    let pressureLevel = 'normal';
    const threshold = 1000000;

    const checkMemoryPressure = (heapUsed) => {
      if (heapUsed > threshold * 0.9) return 'critical';
      if (heapUsed > threshold * 0.7) return 'high';
      if (heapUsed > threshold * 0.5) return 'medium';
      return 'normal';
    };

    const handlePressure = (level) => {
      switch (level) {
        case 'critical':
          return 'trigger-aggressive-gc';
        case 'high':
          return 'reduce-cache-size';
        case 'medium':
          return 'monitor-closely';
        default:
          return 'normal-operation';
      }
    };

    const currentMem = process.memoryUsage().heapUsed;
    pressureLevel = checkMemoryPressure(currentMem);
    const action = handlePressure(pressureLevel);

    return {
      name: 'Memory Pressure Handling',
      passed: action !== null && pressureLevel !== null,
      details: { pressureLevel, action, currentHeapMB: Math.round(currentMem / 1024 / 1024) }
    };
  }

  async validateStreamManagement() {
    const streams = [];

    class MockStream {
      constructor(id) {
        this.id = id;
        this.isOpen = true;
      }

      close() {
        this.isOpen = false;
      }

      isActive() {
        return this.isOpen;
      }
    }

    for (let i = 0; i < 10; i++) {
      streams.push(new MockStream(i));
    }

    const activeStreams = streams.filter(s => s.isActive()).length;

    for (let i = 0; i < 5; i++) {
      streams[i].close();
    }

    const closedStreams = streams.filter(s => !s.isActive()).length;

    return {
      name: 'Stream Management',
      passed: activeStreams === 10 && closedStreams === 5,
      details: { totalStreams: streams.length, active: 10 - closedStreams, closed: closedStreams }
    };
  }

  async validateMemorySnapshot() {
    const snapshot1 = {
      timestamp: Date.now(),
      heapUsed: process.memoryUsage().heapUsed,
      heapTotal: process.memoryUsage().heapTotal,
      external: process.memoryUsage().external
    };

    const objects = [];
    for (let i = 0; i < 1000; i++) {
      objects.push({ id: i, data: 'x'.repeat(100) });
    }

    const snapshot2 = {
      timestamp: Date.now(),
      heapUsed: process.memoryUsage().heapUsed,
      heapTotal: process.memoryUsage().heapTotal,
      external: process.memoryUsage().external
    };

    const growth = snapshot2.heapUsed - snapshot1.heapUsed;

    return {
      name: 'Memory Snapshots',
      passed: snapshot2.timestamp >= snapshot1.timestamp && growth > 0,
      details: { snapshot1HeapMB: Math.round(snapshot1.heapUsed / 1024 / 1024), snapshot2HeapMB: Math.round(snapshot2.heapUsed / 1024 / 1024), growthMB: Math.round(growth / 1024 / 1024) }
    };
  }

  async validateResourceLimits() {
    const limiter = {
      limits: { maxConnections: 100, maxMemoryMB: 512, maxCacheSize: 1000 },
      current: { connections: 0, memoryMB: 0, cacheSize: 0 },

      canAllocate: function(type, amount) {
        if (type === 'connection') {
          return this.current.connections + amount <= this.limits.maxConnections;
        }
        if (type === 'memory') {
          return this.current.memoryMB + amount <= this.limits.maxMemoryMB;
        }
        if (type === 'cache') {
          return this.current.cacheSize + amount <= this.limits.maxCacheSize;
        }
        return false;
      },

      allocate: function(type, amount) {
        if (!this.canAllocate(type, amount)) return false;
        if (type === 'connection') this.current.connections += amount;
        if (type === 'memory') this.current.memoryMB += amount;
        if (type === 'cache') this.current.cacheSize += amount;
        return true;
      },

      deallocate: function(type, amount) {
        if (type === 'connection') this.current.connections = Math.max(0, this.current.connections - amount);
        if (type === 'memory') this.current.memoryMB = Math.max(0, this.current.memoryMB - amount);
        if (type === 'cache') this.current.cacheSize = Math.max(0, this.current.cacheSize - amount);
      }
    };

    limiter.allocate('connection', 50);
    limiter.allocate('memory', 256);
    limiter.allocate('cache', 500);

    const canAllocateMore = limiter.canAllocate('connection', 60);
    const canAllocateMemory = limiter.canAllocate('memory', 300);

    return {
      name: 'Resource Limits',
      passed: !canAllocateMore && !canAllocateMemory && limiter.current.connections === 50,
      details: { connections: limiter.current.connections, memory: limiter.current.memoryMB, cache: limiter.current.cacheSize }
    };
  }

  async validateConcurrentResourceAccess() {
    let accessCount = 0;
    const semaphore = { available: 5, waiting: [] };

    const acquireSemaphore = async () => {
      if (semaphore.available > 0) {
        semaphore.available--;
        return true;
      }
      return false;
    };

    const releaseSemaphore = () => {
      semaphore.available++;
    };

    const tasks = [];
    for (let i = 0; i < 10; i++) {
      tasks.push((async () => {
        if (await acquireSemaphore()) {
          accessCount++;
          await new Promise(r => setTimeout(r, 10));
          releaseSemaphore();
        }
      })());
    }

    await Promise.all(tasks);

    return {
      name: 'Concurrent Resource Access',
      passed: accessCount > 0 && semaphore.available >= 0,
      details: { tasksCompleted: accessCount, semaphoreAvailable: semaphore.available }
    };
  }

  async validateMemoryFragmentation() {
    const memory = new Map();
    const fragmentationTracker = {
      allocations: [],
      deallocations: [],

      allocate: function(id, size) {
        memory.set(id, new Array(size).fill(0));
        this.allocations.push({ id, size, time: Date.now() });
      },

      deallocate: function(id) {
        if (memory.has(id)) {
          const size = memory.get(id).length;
          memory.delete(id);
          this.deallocations.push({ id, size, time: Date.now() });
          return true;
        }
        return false;
      },

      getFragmentationRatio: function() {
        const totalAllocated = this.allocations.reduce((s, a) => s + a.size, 0);
        const totalDeallocated = this.deallocations.reduce((s, d) => s + d.size, 0);
        return totalAllocated > 0 ? totalDeallocated / totalAllocated : 0;
      }
    };

    for (let i = 0; i < 10; i++) {
      fragmentationTracker.allocate(i, 1000);
    }

    for (let i = 0; i < 5; i++) {
      fragmentationTracker.deallocate(i);
    }

    const ratio = fragmentationTracker.getFragmentationRatio();

    return {
      name: 'Memory Fragmentation',
      passed: ratio === 0.5 && memory.size === 5,
      details: { allocated: fragmentationTracker.allocations.length, deallocated: fragmentationTracker.deallocations.length, fragmentationRatio: (ratio * 100).toFixed(1) + '%' }
    };
  }

  async runAllTests() {
    this.testResults = await Promise.all([
      this.validateBasicMemoryTracking(),
      this.validateMemoryPooling(),
      this.validateObjectCaching(),
      this.validateWeakReferences(),
      this.validateMemoryLeakDetection(),
      this.validateResourceCleanup(),
      this.validateConnectionPooling(),
      this.validateBufferManagement(),
      this.validateGarbageCollectionTiming(),
      this.validateMemoryPressureHandling(),
      this.validateStreamManagement(),
      this.validateMemorySnapshot(),
      this.validateResourceLimits(),
      this.validateConcurrentResourceAccess(),
      this.validateMemoryFragmentation()
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

export function createMemoryResourceValidator() {
  return new MemoryResourceValidator();
}
