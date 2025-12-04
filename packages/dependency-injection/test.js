import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';
import { Container, createContainer } from './src/index.js';

describe('Container', () => {
  let container;

  beforeEach(() => {
    container = createContainer();
  });

  it('should register and resolve a singleton service', () => {
    const factory = () => ({ value: 42 });
    container.register('service', factory, { singleton: true });

    const result1 = container.resolve('service');
    const result2 = container.resolve('service');

    assert.strictEqual(result1.value, 42);
    assert.strictEqual(result1, result2);
  });

  it('should register and resolve a factory service', () => {
    const factory = () => ({ id: Math.random() });
    container.register('service', factory, { singleton: false });

    const result1 = container.resolve('service');
    const result2 = container.resolve('service');

    assert.strictEqual(typeof result1.id, 'number');
    assert.notStrictEqual(result1.id, result2.id);
  });

  it('should resolve dependencies in order', () => {
    const callOrder = [];
    container.register('dep1', () => {
      callOrder.push('dep1');
      return { name: 'dep1' };
    }, { singleton: true });

    container.register('dep2', () => {
      callOrder.push('dep2');
      return { name: 'dep2' };
    }, { singleton: true });

    container.register('service',
      (d1, d2) => {
        callOrder.push('service');
        return { dep1: d1, dep2: d2 };
      },
      { singleton: true, dependencies: ['dep1', 'dep2'] }
    );

    const service = container.resolve('service');

    assert.deepStrictEqual(callOrder, ['dep1', 'dep2', 'service']);
    assert.strictEqual(service.dep1.name, 'dep1');
    assert.strictEqual(service.dep2.name, 'dep2');
  });

  it('should detect circular dependencies', () => {
    container.register('serviceA',
      () => container.resolve('serviceB'),
      { dependencies: [] }
    );

    container.register('serviceB',
      () => container.resolve('serviceA'),
      { dependencies: [] }
    );

    assert.throws(
      () => container.resolve('serviceA'),
      /Circular dependency detected/
    );
  });

  it('should throw error for unregistered service', () => {
    assert.throws(
      () => container.resolve('nonexistent'),
      /Service "nonexistent" not found/
    );
  });

  it('should throw error when registering duplicate service', () => {
    container.register('service', () => ({}));

    assert.throws(
      () => container.register('service', () => ({})),
      /already registered/
    );
  });

  it('should check if service exists', () => {
    container.register('service', () => ({}));

    assert.strictEqual(container.has('service'), true);
    assert.strictEqual(container.has('nonexistent'), false);
  });

  it('should clear all services', () => {
    container.register('service1', () => ({}));
    container.register('service2', () => ({}));
    container.resolve('service1');

    container.clear();

    assert.strictEqual(container.has('service1'), false);
    assert.strictEqual(container.has('service2'), false);
  });
});
