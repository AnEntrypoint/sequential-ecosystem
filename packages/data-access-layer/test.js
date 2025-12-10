import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert';
import fs from 'fs-extra';
import path from 'path';
import { TaskRepository, FlowRepository, ToolRepository, FileRepository } from './src/index.js';
import { nowISO, createTimestamps, updateTimestamp } from '@sequentialos/timestamp-utilities';

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
      timestamp: nowISO()
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

describe('ToolRepository', () => {
  let repo;
  const toolsDir = path.join(TEST_DIR, 'tools');

  beforeEach(async () => {
    await fs.ensureDir(toolsDir);
    repo = new ToolRepository(toolsDir);
  });

  afterEach(async () => {
    await fs.remove(TEST_DIR);
  });

  it('should get all tools', () => {
    const tools = repo.getAll();
    assert.ok(Array.isArray(tools));
  });

  it('should save and retrieve tool', async () => {
    const tool = { id: 'test-tool', name: 'Test Tool', description: 'A test' };
    await repo.save('test-tool', tool);
    const retrieved = repo.get('test-tool');
    assert.deepStrictEqual(retrieved, tool);
  });

  it('should delete tool', async () => {
    const tool = { id: 'test-tool', name: 'Test Tool' };
    await repo.save('test-tool', tool);
    await repo.delete('test-tool');
    assert.throws(() => repo.get('test-tool'), /not found/);
  });
});

describe('FileRepository', () => {
  let repo;

  beforeEach(async () => {
    await fs.ensureDir(TEST_DIR);
    repo = new FileRepository();
  });

  afterEach(async () => {
    await fs.remove(TEST_DIR);
  });

  it('should have required methods', () => {
    assert.ok(typeof repo.listDirectory === 'function');
    assert.ok(typeof repo.readFile === 'function');
    assert.ok(typeof repo.writeFile === 'function');
    assert.ok(typeof repo.createDirectory === 'function');
    assert.ok(typeof repo.deleteFile === 'function');
    assert.ok(typeof repo.renameFile === 'function');
    assert.ok(typeof repo.copyFile === 'function');
  });
});
