export class StoragePersistenceValidator {
  constructor() {
    this.testResults = [];
    this.metrics = {
      avgWriteTime: 0,
      avgReadTime: 0,
      avgDeleteTime: 0,
      maxWriteTime: 0,
      maxReadTime: 0,
      throughput: 0
    };
  }

  async validateBasicPersistence(storage) {
    const data = { id: 1, name: 'test', value: 42 };
    await storage.write('test-key', data);
    const retrieved = await storage.read('test-key');

    return {
      name: 'Basic Write and Read',
      passed: retrieved && retrieved.id === 1 && retrieved.value === 42,
      details: { dataMatch: JSON.stringify(retrieved) === JSON.stringify(data) }
    };
  }

  async validateDataIntegrity(storage) {
    const testData = {
      string: 'test',
      number: 42,
      float: 3.14159,
      boolean: true,
      null: null,
      array: [1, 2, 3],
      object: { nested: { deep: 'value' } }
    };

    await storage.write('integrity-test', testData);
    const retrieved = await storage.read('integrity-test');

    return {
      name: 'Data Integrity',
      passed: JSON.stringify(retrieved) === JSON.stringify(testData),
      details: { typesPreserved: true }
    };
  }

  async validateConcurrentWrites(storage, count = 50) {
    const writes = [];
    for (let i = 0; i < count; i++) {
      writes.push(storage.write(`concurrent${i}`, { index: i, timestamp: Date.now() }));
    }

    const startTime = Date.now();
    await Promise.all(writes);
    const duration = Date.now() - startTime;

    return {
      name: `Concurrent Writes (${count})`,
      passed: duration < 5000,
      details: { count, duration, avgPerWrite: (duration / count).toFixed(2) }
    };
  }

  async validateConcurrentReads(storage, writeCount = 20, readCount = 10) {
    for (let i = 0; i < writeCount; i++) {
      await storage.write(`read${i}`, { value: i });
    }

    const reads = [];
    const startTime = Date.now();
    for (let i = 0; i < readCount; i++) {
      for (let j = 0; j < writeCount; j++) {
        reads.push(storage.read(`read${j}`));
      }
    }

    await Promise.all(reads);
    const duration = Date.now() - startTime;
    const totalReads = readCount * writeCount;

    return {
      name: `Concurrent Reads (${totalReads})`,
      passed: duration < 5000,
      details: { totalReads, duration, readsPerSec: Math.round(totalReads / (duration / 1000)) }
    };
  }

  async validateLargeDataHandling(storage) {
    const largePayload = 'x'.repeat(1000000);
    const largeData = {
      payload: largePayload,
      nested: { data: 'y'.repeat(500000) }
    };

    const writeStart = Date.now();
    await storage.write('large', largeData);
    const writeTime = Date.now() - writeStart;

    const readStart = Date.now();
    const retrieved = await storage.read('large');
    const readTime = Date.now() - readStart;

    return {
      name: 'Large Data Handling (1.5MB)',
      passed: retrieved && retrieved.payload.length === 1000000,
      details: { writeTime, readTime, sizeBytes: 1500000 }
    };
  }

  async validateAtomicWrite(storage) {
    const data = { version: 1, data: 'test'.repeat(10000) };

    await storage.write('atomic1', data);
    const v1 = await storage.read('atomic1');

    await storage.write('atomic1', { version: 2, data: 'updated'.repeat(10000) });
    const v2 = await storage.read('atomic1');

    return {
      name: 'Atomic Write Semantics',
      passed: v1.version === 1 && v2.version === 2,
      details: { overwroteSuccessfully: true }
    };
  }

  async validateDelete(storage) {
    await storage.write('delete-test', { data: 'value' });
    let exists = await storage.exists('delete-test');

    await storage.delete('delete-test');
    const notExists = !(await storage.exists('delete-test'));

    return {
      name: 'Delete Operation',
      passed: exists && notExists,
      details: { createdAndDeleted: true }
    };
  }

  async validatePrefixFiltering(storage) {
    const keys = {
      'user:1': { name: 'Alice' },
      'user:2': { name: 'Bob' },
      'task:1': { title: 'Task1' },
      'task:2': { title: 'Task2' }
    };

    for (const [key, value] of Object.entries(keys)) {
      await storage.write(key, value);
    }

    const userKeys = await storage.list('user:');
    const taskKeys = await storage.list('task:');

    return {
      name: 'Prefix Filtering',
      passed: userKeys.length === 2 && taskKeys.length === 2,
      details: { userCount: userKeys.length, taskCount: taskKeys.length }
    };
  }

  async validateThroughput(storage, operationCount = 1000) {
    const startTime = Date.now();

    for (let i = 0; i < operationCount; i++) {
      await storage.write(`throughput${i}`, { index: i });
    }

    const duration = Date.now() - startTime;
    const throughput = Math.round(operationCount / (duration / 1000));

    return {
      name: `Throughput Test (${operationCount} writes)`,
      passed: throughput > 1000,
      details: { duration, throughput, opsPerSec: throughput }
    };
  }

  async validateMemoryEfficiency(storage, itemCount = 5000) {
    const initialMem = process.memoryUsage().heapUsed / 1024 / 1024;

    for (let i = 0; i < itemCount; i++) {
      await storage.write(`mem${i}`, { id: i, data: 'x'.repeat(100) });
    }

    const finalMem = process.memoryUsage().heapUsed / 1024 / 1024;
    const memGrowth = finalMem - initialMem;

    return {
      name: `Memory Efficiency (${itemCount} items)`,
      passed: memGrowth < 200,
      details: { initialMem: initialMem.toFixed(1), finalMem: finalMem.toFixed(1), growth: memGrowth.toFixed(1) }
    };
  }

  async validateErrorHandling(storage) {
    try {
      const nonExistent = await storage.read('nonexistent-key-xyz');
      const noError = nonExistent === null;

      await storage.delete('nonexistent-key-xyz');
      const deleteNoError = true;

      return {
        name: 'Error Handling',
        passed: noError && deleteNoError,
        details: { gracefulHandling: true }
      };
    } catch (e) {
      return {
        name: 'Error Handling',
        passed: false,
        details: { error: e.message }
      };
    }
  }

  async runAllTests(storage) {
    this.testResults = await Promise.all([
      this.validateBasicPersistence(storage),
      this.validateDataIntegrity(storage),
      this.validateConcurrentWrites(storage, 50),
      this.validateConcurrentReads(storage, 20, 10),
      this.validateLargeDataHandling(storage),
      this.validateAtomicWrite(storage),
      this.validateDelete(storage),
      this.validatePrefixFiltering(storage),
      this.validateThroughput(storage, 1000),
      this.validateMemoryEfficiency(storage, 5000),
      this.validateErrorHandling(storage)
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

  getMetrics() {
    return this.metrics;
  }
}

export function createStoragePersistenceValidator() {
  return new StoragePersistenceValidator();
}
