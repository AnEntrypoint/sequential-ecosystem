import { test } from 'node:test';
import assert from 'node:assert';
import {
  formatResponse,
  formatList,
  formatPaginated,
  formatItem,
  formatSuccess,
  formatDeleted,
  formatCreated,
  formatUpdated,
  formatEmpty,
  formatError,
  formatHttpResponse
} from '../src/index.js';

test('@sequential/response-formatting - formatResponse', async (t) => {
  await t.test('returns success response with data and meta', () => {
    const result = formatResponse({ id: 1 }, { userId: 123 });
    assert.strictEqual(result.success, true);
    assert.deepStrictEqual(result.data, { id: 1 });
    assert.ok(result.meta.timestamp);
    assert.strictEqual(result.meta.userId, 123);
  });

  await t.test('works with empty meta', () => {
    const result = formatResponse({ test: 'data' });
    assert.strictEqual(result.success, true);
    assert.deepStrictEqual(result.data, { test: 'data' });
    assert.ok(result.meta.timestamp);
    assert.strictEqual(Object.keys(result.meta).length, 1);
  });

  await t.test('handles null data', () => {
    const result = formatResponse(null);
    assert.strictEqual(result.data, null);
  });

  await t.test('handles array data', () => {
    const result = formatResponse([1, 2, 3]);
    assert.deepStrictEqual(result.data, [1, 2, 3]);
  });
});

test('@sequential/response-formatting - formatList', async (t) => {
  await t.test('returns list with pagination metadata', () => {
    const items = [{ id: 1 }, { id: 2 }, { id: 3 }];
    const result = formatList(items, 10, 0, 5);

    assert.strictEqual(result.success, true);
    assert.deepStrictEqual(result.data, items);
    assert.strictEqual(result.meta.count, 10);
    assert.strictEqual(result.meta.total, 10);
    assert.strictEqual(result.meta.offset, 0);
    assert.strictEqual(result.meta.limit, 5);
    assert.strictEqual(result.meta.hasMore, true);
  });

  await t.test('calculates hasMore correctly when no more pages', () => {
    const items = [{ id: 1 }];
    const result = formatList(items, 5, 4, 5);
    assert.strictEqual(result.meta.hasMore, false);
  });

  await t.test('uses items length when count is null', () => {
    const items = [{ id: 1 }, { id: 2 }];
    const result = formatList(items);
    assert.strictEqual(result.meta.count, 2);
    assert.strictEqual(result.meta.total, 2);
  });

  await t.test('works with empty array', () => {
    const result = formatList([], 0, 0, 10);
    assert.deepStrictEqual(result.data, []);
    assert.strictEqual(result.meta.hasMore, false);
  });
});

test('@sequential/response-formatting - formatPaginated', async (t) => {
  await t.test('returns paginated response with custom options', () => {
    const items = [{ id: 1 }];
    const result = formatPaginated(items, { count: 100, offset: 10, limit: 20 });

    assert.deepStrictEqual(result.data, items);
    assert.strictEqual(result.meta.count, 100);
    assert.strictEqual(result.meta.offset, 10);
    assert.strictEqual(result.meta.limit, 20);
  });

  await t.test('uses defaults when options not provided', () => {
    const items = [{ id: 1 }, { id: 2 }];
    const result = formatPaginated(items);

    assert.strictEqual(result.meta.count, 2);
    assert.strictEqual(result.meta.offset, 0);
    assert.strictEqual(result.meta.limit, 50);
  });
});

test('@sequential/response-formatting - formatItem', async (t) => {
  await t.test('returns single item with metadata', () => {
    const item = { id: 1, name: 'Test' };
    const result = formatItem(item, { resourceType: 'user' });

    assert.strictEqual(result.success, true);
    assert.deepStrictEqual(result.data, item);
    assert.strictEqual(result.meta.resourceType, 'user');
  });

  await t.test('works without meta', () => {
    const item = { id: 1 };
    const result = formatItem(item);
    assert.deepStrictEqual(result.data, item);
  });
});

test('@sequential/response-formatting - formatSuccess', async (t) => {
  await t.test('returns success response with custom message', () => {
    const result = formatSuccess('Task completed successfully');

    assert.strictEqual(result.success, true);
    assert.strictEqual(result.data.message, 'Task completed successfully');
    assert.strictEqual(result.meta.operation, 'success');
  });

  await t.test('uses default message when not provided', () => {
    const result = formatSuccess();
    assert.strictEqual(result.data.message, 'Operation successful');
  });

  await t.test('includes data when provided', () => {
    const data = { id: 1, status: 'complete' };
    const result = formatSuccess('Done', data);
    assert.deepStrictEqual(result.data, data);
  });
});

test('@sequential/response-formatting - formatDeleted', async (t) => {
  await t.test('returns deleted response with resource info', () => {
    const result = formatDeleted('user-123', 'user');

    assert.strictEqual(result.success, true);
    assert.strictEqual(result.data.id, 'user-123');
    assert.strictEqual(result.data.type, 'user');
    assert.strictEqual(result.data.status, 'deleted');
    assert.strictEqual(result.meta.operation, 'delete');
  });

  await t.test('uses default resource type', () => {
    const result = formatDeleted('123');
    assert.strictEqual(result.data.type, 'resource');
  });
});

test('@sequential/response-formatting - formatCreated', async (t) => {
  await t.test('returns created response with operation meta', () => {
    const item = { id: 1, name: 'New Item' };
    const result = formatCreated(item, { location: '/api/items/1' });

    assert.strictEqual(result.success, true);
    assert.deepStrictEqual(result.data, item);
    assert.strictEqual(result.meta.operation, 'create');
    assert.strictEqual(result.meta.location, '/api/items/1');
  });

  await t.test('works without additional meta', () => {
    const item = { id: 1 };
    const result = formatCreated(item);
    assert.strictEqual(result.meta.operation, 'create');
  });
});

test('@sequential/response-formatting - formatUpdated', async (t) => {
  await t.test('returns updated response with operation meta', () => {
    const item = { id: 1, name: 'Updated Item' };
    const result = formatUpdated(item, { changedFields: ['name'] });

    assert.strictEqual(result.success, true);
    assert.deepStrictEqual(result.data, item);
    assert.strictEqual(result.meta.operation, 'update');
    assert.deepStrictEqual(result.meta.changedFields, ['name']);
  });

  await t.test('works without additional meta', () => {
    const item = { id: 1 };
    const result = formatUpdated(item);
    assert.strictEqual(result.meta.operation, 'update');
  });
});

test('@sequential/response-formatting - formatEmpty', async (t) => {
  await t.test('returns empty array response', () => {
    const result = formatEmpty();

    assert.strictEqual(result.success, true);
    assert.deepStrictEqual(result.data, []);
    assert.ok(result.meta.timestamp);
  });

  await t.test('includes additional meta', () => {
    const result = formatEmpty({ reason: 'no matches' });
    assert.strictEqual(result.meta.reason, 'no matches');
  });
});

test('@sequential/response-formatting - formatError', async (t) => {
  await t.test('returns error response with all fields', () => {
    const error = {
      code: 'NOT_FOUND',
      message: 'Resource not found',
      details: { resourceId: 123 },
      category: 'resource'
    };
    const result = formatError(404, error);

    assert.strictEqual(result.success, false);
    assert.strictEqual(result.error.code, 'NOT_FOUND');
    assert.strictEqual(result.error.message, 'Resource not found');
    assert.deepStrictEqual(result.error.details, { resourceId: 123 });
    assert.strictEqual(result.error.category, 'resource');
    assert.ok(result.meta.timestamp);
  });

  await t.test('uses defaults for missing fields', () => {
    const error = {};
    const result = formatError(500, error);

    assert.strictEqual(result.error.code, 'INTERNAL_SERVER_ERROR');
    assert.strictEqual(result.error.message, 'Unknown error');
    assert.strictEqual(result.error.details, undefined);
    assert.strictEqual(result.error.category, undefined);
  });

  await t.test('handles error with only message', () => {
    const error = { message: 'Simple error' };
    const result = formatError(400, error);
    assert.strictEqual(result.error.message, 'Simple error');
  });
});

test('@sequential/response-formatting - formatHttpResponse', async (t) => {
  function createMockRes() {
    let statusCode = 200;
    let responseBody = null;

    return {
      status: (code) => {
        statusCode = code;
        return {
          json: (body) => {
            responseBody = body;
            return { statusCode, responseBody };
          },
          send: () => ({ statusCode, responseBody: null })
        };
      },
      getResponse: () => ({ statusCode, responseBody })
    };
  }

  await t.test('ok sends 200 response', () => {
    const res = createMockRes();
    const formatter = formatHttpResponse(res);
    const result = formatter.ok({ id: 1 }, { custom: 'meta' });

    assert.strictEqual(result.statusCode, 200);
    assert.strictEqual(result.responseBody.success, true);
    assert.deepStrictEqual(result.responseBody.data, { id: 1 });
    assert.strictEqual(result.responseBody.meta.custom, 'meta');
  });

  await t.test('created sends 201 response', () => {
    const res = createMockRes();
    const formatter = formatHttpResponse(res);
    const result = formatter.created({ id: 1 });

    assert.strictEqual(result.statusCode, 201);
    assert.strictEqual(result.responseBody.meta.operation, 'create');
  });

  await t.test('accepted sends 202 response', () => {
    const res = createMockRes();
    const formatter = formatHttpResponse(res);
    const result = formatter.accepted({ id: 1 });

    assert.strictEqual(result.statusCode, 202);
    assert.strictEqual(result.responseBody.success, true);
  });

  await t.test('noContent sends 204 with no body', () => {
    const res = createMockRes();
    const formatter = formatHttpResponse(res);
    const result = formatter.noContent();

    assert.strictEqual(result.statusCode, 204);
    assert.strictEqual(result.responseBody, null);
  });

  await t.test('badRequest sends 400 error', () => {
    const res = createMockRes();
    const formatter = formatHttpResponse(res);
    const error = { code: 'VALIDATION_ERROR', message: 'Invalid input' };
    const result = formatter.badRequest(error);

    assert.strictEqual(result.statusCode, 400);
    assert.strictEqual(result.responseBody.success, false);
    assert.strictEqual(result.responseBody.error.code, 'VALIDATION_ERROR');
  });

  await t.test('notFound sends 404 error', () => {
    const res = createMockRes();
    const formatter = formatHttpResponse(res);
    const error = { code: 'NOT_FOUND', message: 'Not found' };
    const result = formatter.notFound(error);

    assert.strictEqual(result.statusCode, 404);
    assert.strictEqual(result.responseBody.error.code, 'NOT_FOUND');
  });

  await t.test('conflict sends 409 error', () => {
    const res = createMockRes();
    const formatter = formatHttpResponse(res);
    const error = { code: 'CONFLICT', message: 'Conflict' };
    const result = formatter.conflict(error);

    assert.strictEqual(result.statusCode, 409);
    assert.strictEqual(result.responseBody.error.code, 'CONFLICT');
  });

  await t.test('error sends custom status code', () => {
    const res = createMockRes();
    const formatter = formatHttpResponse(res);
    const error = { httpCode: 403, code: 'FORBIDDEN', message: 'Forbidden' };
    const result = formatter.error(error);

    assert.strictEqual(result.statusCode, 403);
    assert.strictEqual(result.responseBody.error.code, 'FORBIDDEN');
  });

  await t.test('error defaults to 500', () => {
    const res = createMockRes();
    const formatter = formatHttpResponse(res);
    const error = { message: 'Server error' };
    const result = formatter.error(error);

    assert.strictEqual(result.statusCode, 500);
  });

  await t.test('respects custom error httpCode', () => {
    const res = createMockRes();
    const formatter = formatHttpResponse(res);
    const error = { httpCode: 422, message: 'Unprocessable' };
    const result = formatter.badRequest(error);

    assert.strictEqual(result.statusCode, 422);
  });

  await t.test('uses custom formatter when provided', () => {
    const res = createMockRes();
    const customFormatter = (data, meta) => ({ custom: true, data, meta });
    const formatter = formatHttpResponse(res, customFormatter);
    const result = formatter.ok({ id: 1 });

    assert.strictEqual(result.responseBody.custom, true);
  });
});
