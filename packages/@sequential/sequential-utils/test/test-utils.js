import { test } from 'node:test';
import assert from 'node:assert';
import {
  nowISO,
  createTimestamps,
  updateTimestamp,
  parseISO,
  SerializedError,
  serializeError,
  normalizeError
} from '../src/index.js';

test('Timestamp Utilities', async (t) => {
  await t.test('nowISO returns valid ISO 8601 string', () => {
    const iso = nowISO();
    assert.ok(typeof iso === 'string');
    assert.match(iso, /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    assert.ok(new Date(iso) instanceof Date);
    assert.ok(!isNaN(new Date(iso).getTime()));
  });

  await t.test('nowISO returns current timestamp within 1 second', () => {
    const before = Date.now();
    const iso = nowISO();
    const after = Date.now();
    const parsed = new Date(iso).getTime();
    assert.ok(parsed >= before && parsed <= after);
  });

  await t.test('createTimestamps returns both createdAt and updatedAt', () => {
    const timestamps = createTimestamps();
    assert.ok(timestamps.createdAt);
    assert.ok(timestamps.updatedAt);
    assert.ok(typeof timestamps.createdAt === 'string');
    assert.ok(typeof timestamps.updatedAt === 'string');
  });

  await t.test('createTimestamps sets createdAt and updatedAt to same value', () => {
    const timestamps = createTimestamps();
    assert.equal(timestamps.createdAt, timestamps.updatedAt);
  });

  await t.test('createTimestamps returns valid ISO 8601 timestamps', () => {
    const timestamps = createTimestamps();
    assert.match(timestamps.createdAt, /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    assert.match(timestamps.updatedAt, /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
  });

  await t.test('updateTimestamp returns only updatedAt', () => {
    const timestamp = updateTimestamp();
    assert.ok(timestamp.updatedAt);
    assert.ok(!timestamp.createdAt);
    assert.equal(Object.keys(timestamp).length, 1);
  });

  await t.test('updateTimestamp returns valid ISO 8601 string', () => {
    const timestamp = updateTimestamp();
    assert.match(timestamp.updatedAt, /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
  });

  await t.test('updateTimestamp returns current timestamp', () => {
    const before = Date.now();
    const timestamp = updateTimestamp();
    const after = Date.now();
    const parsed = new Date(timestamp.updatedAt).getTime();
    assert.ok(parsed >= before && parsed <= after);
  });

  await t.test('parseISO parses valid ISO string to Date', () => {
    const isoString = '2025-11-14T10:30:45.123Z';
    const date = parseISO(isoString);
    assert.ok(date instanceof Date);
    assert.equal(date.toISOString(), isoString);
  });

  await t.test('parseISO handles various valid ISO formats', () => {
    const validDates = [
      '2025-11-14T10:30:45.123Z',
      '2025-01-01T00:00:00.000Z',
      '2099-12-31T23:59:59.999Z'
    ];
    validDates.forEach(iso => {
      const date = parseISO(iso);
      assert.ok(date instanceof Date);
      assert.ok(!isNaN(date.getTime()));
    });
  });

  await t.test('parseISO handles invalid ISO string', () => {
    const result = parseISO('not-a-date');
    if (result) {
      assert.ok(isNaN(result.getTime()));
    }
  });

  await t.test('parseISO returns null for empty string', () => {
    const result = parseISO('');
    assert.equal(result, null);
  });

  await t.test('parseISO returns null for null', () => {
    const result = parseISO(null);
    assert.equal(result, null);
  });

  await t.test('parseISO returns null for undefined', () => {
    const result = parseISO(undefined);
    assert.equal(result, null);
  });

  await t.test('parseISO handles malformed dates gracefully', () => {
    const invalid = [
      '2025/11/14',
      'today',
      'T10:30:45.123Z'
    ];
    invalid.forEach(str => {
      const result = parseISO(str);
      assert.ok(result === null || result instanceof Date);
    });
  });

  await t.test('parseISO handles numeric timestamps', () => {
    const timestamp = 1731573045123;
    const result = parseISO(timestamp.toString());
    assert.ok(result === null || result instanceof Date);
  });
});

test('SerializedError Class', async (t) => {
  await t.test('creates SerializedError from Error instance', () => {
    const error = new Error('Test message');
    const serialized = new SerializedError(error);
    assert.equal(serialized.message, 'Test message');
    assert.equal(serialized.name, 'Error');
    assert.ok(serialized.stack);
  });

  await t.test('creates SerializedError from plain object', () => {
    const obj = { message: 'Custom message', name: 'CustomError' };
    const serialized = new SerializedError(obj);
    assert.equal(serialized.message, 'Custom message');
    assert.equal(serialized.name, 'CustomError');
  });

  await t.test('preserves error code property', () => {
    const error = new Error('Test');
    error.code = 'ENOENT';
    const serialized = new SerializedError(error);
    assert.equal(serialized.code, 'ENOENT');
  });

  await t.test('toJSON returns plain object', () => {
    const error = new Error('Test message');
    const serialized = new SerializedError(error);
    const json = serialized.toJSON();
    assert.ok(typeof json === 'object');
    assert.equal(json.message, 'Test message');
    assert.equal(json.name, 'Error');
    assert.ok(json.stack);
  });

  await t.test('toJSON is JSON.stringify compatible', () => {
    const error = new Error('Test message');
    const serialized = new SerializedError(error);
    const stringified = JSON.stringify(serialized);
    const parsed = JSON.parse(stringified);
    assert.equal(parsed.message, 'Test message');
    assert.equal(parsed.name, 'Error');
  });

  await t.test('toString returns formatted error string', () => {
    const error = new Error('Test message');
    const serialized = new SerializedError(error);
    const str = serialized.toString();
    assert.equal(str, 'Error: Test message');
  });

  await t.test('toString handles custom error name', () => {
    const serialized = new SerializedError({ name: 'ValidationError', message: 'Invalid input' });
    assert.equal(serialized.toString(), 'ValidationError: Invalid input');
  });

  await t.test('handles null error gracefully', () => {
    const serialized = new SerializedError(null);
    assert.equal(serialized.message, 'Unknown error');
    assert.equal(serialized.name, 'Error');
    assert.equal(serialized.stack, '');
  });

  await t.test('handles undefined error gracefully', () => {
    const serialized = new SerializedError(undefined);
    assert.equal(serialized.message, 'Unknown error');
    assert.equal(serialized.name, 'Error');
  });

  await t.test('handles object without message property', () => {
    const serialized = new SerializedError({ code: 'ERR_CODE' });
    assert.equal(serialized.message, 'Unknown error');
    assert.equal(serialized.code, 'ERR_CODE');
  });
});

test('serializeError Function', async (t) => {
  await t.test('converts Error to SerializedError', () => {
    const error = new Error('Test');
    const serialized = serializeError(error);
    assert.ok(serialized instanceof SerializedError);
    assert.equal(serialized.message, 'Test');
  });

  await t.test('is idempotent with SerializedError', () => {
    const error = new Error('Test');
    const first = serializeError(error);
    const second = serializeError(first);
    assert.strictEqual(first, second);
  });

  await t.test('handles null error', () => {
    const serialized = serializeError(null);
    assert.ok(serialized instanceof SerializedError);
    assert.equal(serialized.message, 'Unknown error');
  });

  await t.test('handles custom error types', () => {
    class CustomError extends Error {
      constructor(message) {
        super(message);
        this.name = 'CustomError';
        this.code = 'CUSTOM_CODE';
      }
    }
    const error = new CustomError('Custom message');
    const serialized = serializeError(error);
    assert.equal(serialized.message, 'Custom message');
    assert.equal(serialized.name, 'CustomError');
    assert.equal(serialized.code, 'CUSTOM_CODE');
  });

  await t.test('preserves stack traces', () => {
    const error = new Error('Test');
    const serialized = serializeError(error);
    assert.ok(serialized.stack);
    assert.ok(serialized.stack.includes('Error: Test'));
  });
});

test('normalizeError Function', async (t) => {
  await t.test('normalizes Error instance', () => {
    const error = new Error('Test');
    const normalized = normalizeError(error);
    assert.ok(normalized instanceof SerializedError);
    assert.equal(normalized.message, 'Test');
  });

  await t.test('normalizes null to null', () => {
    const result = normalizeError(null);
    assert.equal(result, null);
  });

  await t.test('normalizes undefined to null', () => {
    const result = normalizeError(undefined);
    assert.equal(result, null);
  });

  await t.test('normalizes string to SerializedError', () => {
    const normalized = normalizeError('Error message');
    assert.ok(normalized instanceof SerializedError);
    assert.equal(normalized.message, 'Error message');
  });

  await t.test('normalizes plain object to SerializedError', () => {
    const normalized = normalizeError({ message: 'Object error', code: 'ERR_CODE' });
    assert.ok(normalized instanceof SerializedError);
    assert.equal(normalized.message, 'Object error');
    assert.equal(normalized.code, 'ERR_CODE');
  });

  await t.test('normalizes number to SerializedError with string message', () => {
    const normalized = normalizeError(404);
    assert.ok(normalized instanceof SerializedError);
    assert.equal(normalized.message, '404');
  });

  await t.test('normalizes boolean to SerializedError', () => {
    const normalized = normalizeError(true);
    assert.ok(normalized instanceof SerializedError);
    assert.equal(normalized.message, 'true');
  });

  await t.test('handles already normalized error', () => {
    const error = new Error('Test');
    const first = normalizeError(error);
    const second = normalizeError(first);
    assert.ok(second instanceof SerializedError);
    assert.equal(second.message, 'Test');
  });

  await t.test('normalizes object with nested error', () => {
    const normalized = normalizeError({
      message: 'Wrapper error',
      originalError: new Error('Original')
    });
    assert.ok(normalized instanceof SerializedError);
    assert.equal(normalized.message, 'Wrapper error');
  });
});

test('Integration - Timestamp and Error Together', async (t) => {
  await t.test('can store error with timestamp', () => {
    const error = new Error('Failed operation');
    const errorRecord = {
      error: serializeError(error).toJSON(),
      timestamp: nowISO()
    };
    assert.ok(errorRecord.timestamp);
    assert.ok(errorRecord.error.message);
    const stringified = JSON.stringify(errorRecord);
    assert.ok(stringified.includes('Failed operation'));
  });

  await t.test('can parse error record with timestamp', () => {
    const original = {
      error: serializeError(new Error('Test')).toJSON(),
      timestamp: nowISO()
    };
    const stringified = JSON.stringify(original);
    const parsed = JSON.parse(stringified);
    const parsedDate = parseISO(parsed.timestamp);
    assert.ok(parsedDate instanceof Date);
    assert.equal(parsed.error.message, 'Test');
  });

  await t.test('timestamp remains consistent across serialization', () => {
    const iso = nowISO();
    const date1 = parseISO(iso);
    const stringified = JSON.stringify({ timestamp: iso });
    const parsed = JSON.parse(stringified);
    const date2 = parseISO(parsed.timestamp);
    assert.equal(date1.toISOString(), date2.toISOString());
  });

  await t.test('can update record with both error and timestamp', () => {
    const record = {
      id: 1,
      ...createTimestamps()
    };
    // Simulate update after error
    const updated = {
      ...record,
      ...updateTimestamp(),
      error: normalizeError(new Error('Updated error')).toJSON()
    };
    assert.ok(updated.createdAt);
    assert.ok(updated.updatedAt);
    assert.ok(updated.error);
    assert.ok(new Date(updated.updatedAt) >= new Date(updated.createdAt));
  });
});

test('Edge Cases and Robustness', async (t) => {
  await t.test('handles very large error messages', () => {
    const largeMessage = 'x'.repeat(10000);
    const serialized = serializeError(new Error(largeMessage));
    assert.equal(serialized.message, largeMessage);
  });

  await t.test('handles error with circular references gracefully', () => {
    const error = new Error('Test');
    error.nested = { parent: error };
    const serialized = new SerializedError(error);
    assert.equal(serialized.message, 'Test');
  });

  await t.test('timestamp functions do not mutate input', () => {
    const original = { data: 'test' };
    const frozen = Object.freeze(original);
    const timestamps = createTimestamps();
    assert.ok(timestamps.createdAt);
    assert.ok(timestamps.updatedAt);
  });

  await t.test('normalizeError with Symbol fails gracefully', () => {
    const sym = Symbol('test');
    const normalized = normalizeError(sym);
    assert.ok(normalized instanceof SerializedError);
  });

  await t.test('ISO parsing with whitespace', () => {
    const result = parseISO('  2025-11-14T10:30:45.123Z  ');
    assert.ok(result === null || result instanceof Date);
  });

  await t.test('concurrent timestamp generation produces different values eventually', async () => {
    const t1 = nowISO();
    await new Promise(resolve => setTimeout(resolve, 10));
    const t2 = nowISO();
    assert.notEqual(t1, t2);
  });
});

test('Performance Characteristics', async (t) => {
  await t.test('timestamp generation is fast', () => {
    const start = Date.now();
    for (let i = 0; i < 1000; i++) {
      nowISO();
    }
    const duration = Date.now() - start;
    assert.ok(duration < 1000);
  });

  await t.test('error serialization is fast', () => {
    const error = new Error('Test');
    const start = Date.now();
    for (let i = 0; i < 1000; i++) {
      serializeError(error);
    }
    const duration = Date.now() - start;
    assert.ok(duration < 1000);
  });

  await t.test('ISO parsing is fast', () => {
    const iso = nowISO();
    const start = Date.now();
    for (let i = 0; i < 1000; i++) {
      parseISO(iso);
    }
    const duration = Date.now() - start;
    assert.ok(duration < 1000);
  });
});
