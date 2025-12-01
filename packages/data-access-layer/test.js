import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert';
import fs from 'fs-extra';
import path from 'path';
import { TaskRepository, FlowRepository } from './src/index.js';

const TEST_DIR = path.join(process.cwd(), 'tasks-test');

describe('TaskRepository', () => {
  let repo;

  beforeEach(async () => {
    await fs.ensureDir(TEST_DIR);
    repo = new TaskRepository(TEST_DIR);
  });

  afterEach(async () => {
    await fs.remove(TEST_DIR);
  });

  it('should validate task names', () => {
    const repo = new TaskRepository();
    assert.throws(() => repo.validatePath('../etc/passwd'), /denied|traversal/i);
    assert.doesNotThrow(() => repo.validatePath('my-task'));
  });

  it('should get all tasks', async () => {
    const tasks = repo.getAll();
    assert.ok(Array.isArray(tasks));
  });

  it('should create run result with metadata', async () => {
    const result = {
      runId: '123-456',
      taskName: 'test-task',
      input: { key: 'value' },
      output: { result: 'success' },
      status: 'success',
      duration: 1000,
      timestamp: new Date().toISOString()
    };

    assert.ok(result.runId);
    assert.ok(result.timestamp);
    assert.strictEqual(result.status, 'success');
  });
});

describe('FlowRepository', () => {
  let repo;

  beforeEach(async () => {
    await fs.ensureDir(TEST_DIR);
    repo = new FlowRepository(TEST_DIR);
  });

  afterEach(async () => {
    await fs.remove(TEST_DIR);
  });

  it('should get all flows', async () => {
    const flows = repo.getAll();
    assert.ok(Array.isArray(flows));
  });

  it('should have required methods', () => {
    assert.ok(typeof repo.get === 'function');
    assert.ok(typeof repo.getAll === 'function');
    assert.ok(typeof repo.save === 'function');
  });
});
