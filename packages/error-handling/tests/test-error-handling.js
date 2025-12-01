import { test } from 'node:test';
import assert from 'node:assert';
import {
  AppError,
  ERROR_CODES,
  createError,
  createValidationError,
  createNotFoundError,
  createForbiddenError,
  createConflictError,
  createUnprocessableError,
  createBadRequestError,
  createServerError,
  categorizeError,
  createErrorHandler,
  ERROR_CATEGORIES,
  logFileOperation,
  logFileSuccess,
  logBatchFileOperation,
  createDetailedErrorResponse
} from '../src/index.js';

test('@sequential/error-handling - AppError class', async (t) => {
  await t.test('constructor creates AppError with all properties', () => {
    const error = new AppError(400, 'TEST_CODE', 'Test message', 'test', { foo: 'bar' });
    assert.ok(error instanceof Error);
    assert.ok(error instanceof AppError);
    assert.strictEqual(error.httpCode, 400);
    assert.strictEqual(error.code, 'TEST_CODE');
    assert.strictEqual(error.message, 'Test message');
    assert.strictEqual(error.category, 'test');
    assert.deepStrictEqual(error.details, { foo: 'bar' });
    assert.ok(error.timestamp);
    assert.ok(error.stack);
  });

  await t.test('constructor with default category and details', () => {
    const error = new AppError(500, 'SERVER_ERROR', 'Server error');
    assert.strictEqual(error.category, null);
    assert.deepStrictEqual(error.details, {});
  });

  await t.test('toJSON serializes error correctly', () => {
    const error = new AppError(404, 'NOT_FOUND', 'Resource not found', 'resource', { id: 123 });
    const json = error.toJSON();
    assert.deepStrictEqual(json, {
      code: 'NOT_FOUND',
      message: 'Resource not found',
      category: 'resource',
      details: { id: 123 },
      timestamp: error.timestamp
    });
  });

  await t.test('toJSON excludes httpCode and stack', () => {
    const error = new AppError(500, 'ERROR', 'Error');
    const json = error.toJSON();
    assert.strictEqual(json.httpCode, undefined);
    assert.strictEqual(json.stack, undefined);
  });
});

test('@sequential/error-handling - ERROR_CODES constants', async (t) => {
  await t.test('all error codes have required properties', () => {
    const codes = Object.values(ERROR_CODES);
    codes.forEach(errorCode => {
      assert.ok(errorCode.code, 'Error code has code property');
      assert.ok(typeof errorCode.httpCode === 'number', 'Error code has numeric httpCode');
      assert.ok(errorCode.category, 'Error code has category');
    });
  });

  await t.test('VALIDATION_ERROR has correct structure', () => {
    assert.deepStrictEqual(ERROR_CODES.VALIDATION_ERROR, {
      code: 'VALIDATION_ERROR',
      httpCode: 400,
      category: 'validation'
    });
  });

  await t.test('NOT_FOUND has correct structure', () => {
    assert.deepStrictEqual(ERROR_CODES.NOT_FOUND, {
      code: 'NOT_FOUND',
      httpCode: 404,
      category: 'resource'
    });
  });

  await t.test('INTERNAL_SERVER_ERROR has correct structure', () => {
    assert.deepStrictEqual(ERROR_CODES.INTERNAL_SERVER_ERROR, {
      code: 'INTERNAL_SERVER_ERROR',
      httpCode: 500,
      category: 'server'
    });
  });
});

test('@sequential/error-handling - createError factory', async (t) => {
  await t.test('creates AppError from error definition', () => {
    const error = createError(ERROR_CODES.NOT_FOUND, 'User not found', { userId: 123 });
    assert.ok(error instanceof AppError);
    assert.strictEqual(error.httpCode, 404);
    assert.strictEqual(error.code, 'NOT_FOUND');
    assert.strictEqual(error.message, 'User not found');
    assert.strictEqual(error.category, 'resource');
    assert.deepStrictEqual(error.details, { userId: 123 });
  });

  await t.test('creates error with empty details by default', () => {
    const error = createError(ERROR_CODES.BAD_REQUEST, 'Bad input');
    assert.deepStrictEqual(error.details, {});
  });
});

test('@sequential/error-handling - createValidationError', async (t) => {
  await t.test('creates validation error with field', () => {
    const error = createValidationError('Email is required', 'email');
    assert.strictEqual(error.httpCode, 400);
    assert.strictEqual(error.code, 'VALIDATION_ERROR');
    assert.strictEqual(error.message, 'Email is required');
    assert.deepStrictEqual(error.details, { field: 'email' });
  });

  await t.test('creates validation error without field', () => {
    const error = createValidationError('Invalid data');
    assert.deepStrictEqual(error.details, { field: null });
  });
});

test('@sequential/error-handling - createNotFoundError', async (t) => {
  await t.test('creates not found error with resource name', () => {
    const error = createNotFoundError('User');
    assert.strictEqual(error.httpCode, 404);
    assert.strictEqual(error.code, 'NOT_FOUND');
    assert.strictEqual(error.message, 'User not found');
    assert.deepStrictEqual(error.details, { resource: 'User' });
  });
});

test('@sequential/error-handling - createForbiddenError', async (t) => {
  await t.test('creates forbidden error with custom message', () => {
    const error = createForbiddenError('You cannot access this resource');
    assert.strictEqual(error.httpCode, 403);
    assert.strictEqual(error.code, 'FORBIDDEN');
    assert.strictEqual(error.message, 'You cannot access this resource');
  });

  await t.test('creates forbidden error with default message', () => {
    const error = createForbiddenError();
    assert.strictEqual(error.message, 'Access denied');
  });
});

test('@sequential/error-handling - createConflictError', async (t) => {
  await t.test('creates conflict error with custom message', () => {
    const error = createConflictError('Email already exists');
    assert.strictEqual(error.httpCode, 409);
    assert.strictEqual(error.code, 'CONFLICT');
    assert.strictEqual(error.message, 'Email already exists');
  });

  await t.test('creates conflict error with default message', () => {
    const error = createConflictError();
    assert.strictEqual(error.message, 'Resource conflict');
  });
});

test('@sequential/error-handling - createUnprocessableError', async (t) => {
  await t.test('creates unprocessable error with details', () => {
    const error = createUnprocessableError('Invalid JSON', { line: 5 });
    assert.strictEqual(error.httpCode, 422);
    assert.strictEqual(error.code, 'UNPROCESSABLE_ENTITY');
    assert.strictEqual(error.message, 'Invalid JSON');
    assert.deepStrictEqual(error.details, { line: 5 });
  });
});

test('@sequential/error-handling - createBadRequestError', async (t) => {
  await t.test('creates bad request error', () => {
    const error = createBadRequestError('Missing required parameter');
    assert.strictEqual(error.httpCode, 400);
    assert.strictEqual(error.code, 'BAD_REQUEST');
    assert.strictEqual(error.message, 'Missing required parameter');
  });
});

test('@sequential/error-handling - createServerError', async (t) => {
  await t.test('creates server error with original error', () => {
    const original = new Error('Database connection failed');
    const error = createServerError('Internal error occurred', original);
    assert.strictEqual(error.httpCode, 500);
    assert.strictEqual(error.code, 'INTERNAL_SERVER_ERROR');
    assert.strictEqual(error.message, 'Internal error occurred');
    assert.deepStrictEqual(error.details, { originalError: 'Database connection failed' });
  });

  await t.test('creates server error without original error', () => {
    const error = createServerError('Something went wrong');
    assert.strictEqual(error.details.originalError, undefined);
  });
});

test('@sequential/error-handling - categorizeError', async (t) => {
  await t.test('returns category from AppError', () => {
    const error = new AppError(400, 'VAL', 'msg', 'validation');
    assert.strictEqual(categorizeError(error), 'validation');
  });

  await t.test('returns unknown for AppError without category', () => {
    const error = new AppError(500, 'ERR', 'msg');
    assert.strictEqual(categorizeError(error), 'unknown');
  });

  await t.test('categorizes ENOENT as file', () => {
    const error = new Error('File not found');
    error.code = 'ENOENT';
    assert.strictEqual(categorizeError(error), 'file');
  });

  await t.test('categorizes EACCES as authorization', () => {
    const error = new Error('Permission denied');
    error.code = 'EACCES';
    assert.strictEqual(categorizeError(error), 'authorization');
  });

  await t.test('categorizes EISDIR as resource', () => {
    const error = new Error('Is a directory');
    error.code = 'EISDIR';
    assert.strictEqual(categorizeError(error), 'resource');
  });

  await t.test('returns unknown for unrecognized error', () => {
    const error = new Error('Random error');
    assert.strictEqual(categorizeError(error), 'unknown');
  });
});

test('@sequential/error-handling - createErrorHandler middleware', async (t) => {
  await t.test('handles AppError correctly', () => {
    const handler = createErrorHandler();
    const error = new AppError(404, 'NOT_FOUND', 'Resource not found', 'resource', { id: 123 });

    let statusCode;
    let responseBody;

    const req = { requestId: 'req-123' };
    const res = {
      status: (code) => {
        statusCode = code;
        return res;
      },
      json: (body) => {
        responseBody = body;
      }
    };

    handler(error, req, res, null);

    assert.strictEqual(statusCode, 404);
    assert.strictEqual(responseBody.error.code, 'NOT_FOUND');
    assert.strictEqual(responseBody.error.message, 'Resource not found');
    assert.strictEqual(responseBody.error.category, 'resource');
    assert.strictEqual(responseBody.error.requestId, 'req-123');
    assert.deepStrictEqual(responseBody.error.details, { id: 123 });
  });

  await t.test('converts generic Error to AppError', () => {
    const handler = createErrorHandler();
    const error = new Error('Generic error');

    let statusCode;
    let responseBody;

    const req = { requestId: 'req-456' };
    const res = {
      status: (code) => {
        statusCode = code;
        return res;
      },
      json: (body) => {
        responseBody = body;
      }
    };

    handler(error, req, res, null);

    assert.strictEqual(statusCode, 500);
    assert.strictEqual(responseBody.error.code, 'INTERNAL_SERVER_ERROR');
    assert.strictEqual(responseBody.error.message, 'Generic error');
    assert.strictEqual(responseBody.error.category, 'server');
  });
});

test('@sequential/error-handling - ERROR_CATEGORIES constants', async (t) => {
  await t.test('has all expected categories', () => {
    const expectedCategories = [
      'FILE_NOT_FOUND',
      'PERMISSION_DENIED',
      'PATH_TRAVERSAL',
      'INVALID_INPUT',
      'FILE_TOO_LARGE',
      'ENCODING_ERROR',
      'DISK_SPACE',
      'OPERATION_FAILED',
      'UNKNOWN'
    ];

    expectedCategories.forEach(cat => {
      assert.ok(ERROR_CATEGORIES[cat], `${cat} exists`);
      assert.strictEqual(ERROR_CATEGORIES[cat], cat, `${cat} value is correct`);
    });
  });
});

test('@sequential/error-handling - getErrorCategory (via logFileOperation)', async (t) => {
  await t.test('categorizes ENOENT as FILE_NOT_FOUND', () => {
    const error = new Error('File not found');
    error.code = 'ENOENT';
    const log = logFileOperation('read', '/test/file.txt', error);
    assert.strictEqual(log.category, 'FILE_NOT_FOUND');
  });

  await t.test('categorizes EACCES as PERMISSION_DENIED', () => {
    const error = new Error('Permission denied');
    error.code = 'EACCES';
    const log = logFileOperation('write', '/test/file.txt', error);
    assert.strictEqual(log.category, 'PERMISSION_DENIED');
  });

  await t.test('categorizes path traversal message', () => {
    const error = new Error('Detected path traversal attempt');
    const log = logFileOperation('read', '../etc/passwd', error);
    assert.strictEqual(log.category, 'PATH_TRAVERSAL');
  });

  await t.test('categorizes invalid input message', () => {
    const error = new Error('Invalid file path');
    const log = logFileOperation('delete', 'bad-path', error);
    assert.strictEqual(log.category, 'INVALID_INPUT');
  });

  await t.test('categorizes EFBIG as FILE_TOO_LARGE', () => {
    const error = new Error('File is too large');
    error.code = 'EFBIG';
    const log = logFileOperation('read', '/large.txt', error);
    assert.strictEqual(log.category, 'FILE_TOO_LARGE');
  });

  await t.test('categorizes encoding errors', () => {
    const error = new Error('Unsupported file encoding detected');
    const log = logFileOperation('read', '/file.txt', error);
    assert.strictEqual(log.category, 'ENCODING_ERROR');
  });

  await t.test('categorizes ENOSPC as DISK_SPACE', () => {
    const error = new Error('No space left');
    error.code = 'ENOSPC';
    const log = logFileOperation('write', '/file.txt', error);
    assert.strictEqual(log.category, 'DISK_SPACE');
  });

  await t.test('defaults to UNKNOWN for unrecognized errors', () => {
    const error = new Error('Strange error');
    const log = logFileOperation('read', '/file.txt', error);
    assert.strictEqual(log.category, 'UNKNOWN');
  });
});

test('@sequential/error-handling - logFileOperation', async (t) => {
  await t.test('creates log entry with all expected fields', () => {
    const error = new Error('Test error');
    error.code = 'ENOENT';
    const log = logFileOperation('read', '/test/file.txt', error, { userId: 123 });

    assert.ok(log.timestamp);
    assert.strictEqual(log.operation, 'read');
    assert.strictEqual(log.category, 'FILE_NOT_FOUND');
    assert.strictEqual(log.filePath, '/test/file.txt');
    assert.strictEqual(log.error.message, 'Test error');
    assert.strictEqual(log.error.code, 'ENOENT');
    assert.ok(Array.isArray(log.error.stack));
    assert.deepStrictEqual(log.context, { userId: 123 });
    assert.strictEqual(log.severity, 'error');
  });

  await t.test('handles error without code', () => {
    const error = new Error('Error without code');
    const log = logFileOperation('write', '/file.txt', error);
    assert.strictEqual(log.error.code, null);
  });
});

test('@sequential/error-handling - logFileSuccess', async (t) => {
  await t.test('creates success log entry', () => {
    const log = logFileSuccess('write', '/test/file.txt', 150, { size: 1024 });

    assert.ok(log.timestamp);
    assert.strictEqual(log.operation, 'write');
    assert.strictEqual(log.status, 'success');
    assert.strictEqual(log.filePath, '/test/file.txt');
    assert.strictEqual(log.durationMs, 150);
    assert.deepStrictEqual(log.metadata, { size: 1024 });
    assert.strictEqual(log.severity, 'info');
  });

  await t.test('handles zero duration and empty metadata', () => {
    const log = logFileSuccess('read', '/file.txt');
    assert.strictEqual(log.durationMs, 0);
    assert.deepStrictEqual(log.metadata, {});
  });
});

test('@sequential/error-handling - logBatchFileOperation', async (t) => {
  await t.test('logs batch operation failure', () => {
    const error = new Error('Batch failed');
    error.code = 'EACCES';
    const log = logBatchFileOperation('delete', 10, error, 500);

    assert.ok(log.timestamp);
    assert.strictEqual(log.operation, 'delete');
    assert.strictEqual(log.category, 'PERMISSION_DENIED');
    assert.strictEqual(log.fileCount, 10);
    assert.strictEqual(log.durationMs, 500);
    assert.strictEqual(log.error.message, 'Batch failed');
    assert.strictEqual(log.error.code, 'EACCES');
    assert.strictEqual(log.severity, 'critical');
  });

  await t.test('logs batch operation success', () => {
    const log = logBatchFileOperation('copy', 25, null, 1200);

    assert.strictEqual(log.category, 'SUCCESS');
    assert.strictEqual(log.fileCount, 25);
    assert.strictEqual(log.durationMs, 1200);
    assert.strictEqual(log.error, null);
    assert.strictEqual(log.severity, 'info');
  });
});

test('@sequential/error-handling - createDetailedErrorResponse', async (t) => {
  await t.test('creates detailed error response', () => {
    const error = new Error('File not found');
    error.code = 'ENOENT';
    const response = createDetailedErrorResponse('read', '/test/file.txt', error, 404);

    assert.strictEqual(response.statusCode, 404);
    assert.strictEqual(response.error.code, 'FILE_NOT_FOUND');
    assert.strictEqual(response.error.message, 'Could not find the specified file or directory');
    assert.strictEqual(response.error.operation, 'read');
    assert.strictEqual(response.error.filePath, '/test/file.txt');
    assert.ok(response.error.timestamp);
  });

  await t.test('uses default status code 500', () => {
    const error = new Error('Unknown error');
    const response = createDetailedErrorResponse('delete', '/file.txt', error);
    assert.strictEqual(response.statusCode, 500);
  });

  await t.test('includes debug details when DEBUG is set', () => {
    const originalDebug = process.env.DEBUG;
    process.env.DEBUG = '1';

    const error = new Error('Debug error');
    error.code = 'ENOENT';
    const response = createDetailedErrorResponse('read', '/file.txt', error);

    assert.ok(response.error.details);
    assert.strictEqual(response.error.details.originalError, 'Debug error');
    assert.strictEqual(response.error.details.errorCode, 'ENOENT');
    assert.ok(Array.isArray(response.error.details.stack));

    if (originalDebug === undefined) {
      delete process.env.DEBUG;
    } else {
      process.env.DEBUG = originalDebug;
    }
  });

  await t.test('provides user-friendly messages for all categories', () => {
    const testCases = [
      { code: 'ENOENT', expectedMsg: 'Could not find the specified file or directory' },
      { code: 'EACCES', expectedMsg: 'You do not have permission to test this file' },
      { code: 'EFBIG', expectedMsg: 'File is too large to test' },
      { code: 'ENOSPC', expectedMsg: 'Insufficient disk space for this operation' }
    ];

    testCases.forEach(({ code, expectedMsg }) => {
      const error = new Error('Error');
      error.code = code;
      const response = createDetailedErrorResponse('test', '/file.txt', error);
      assert.strictEqual(response.error.message, expectedMsg);
    });
  });
});

test('@sequential/error-handling - severity levels', async (t) => {
  await t.test('PATH_TRAVERSAL has critical severity', () => {
    const error = new Error('path traversal detected');
    const log = logFileOperation('read', '../etc/passwd', error);
    assert.strictEqual(log.severity, 'critical');
  });

  await t.test('PERMISSION_DENIED has critical severity', () => {
    const error = new Error('Permission denied');
    error.code = 'EACCES';
    const log = logFileOperation('write', '/root/file', error);
    assert.strictEqual(log.severity, 'critical');
  });

  await t.test('FILE_NOT_FOUND has error severity', () => {
    const error = new Error('Not found');
    error.code = 'ENOENT';
    const log = logFileOperation('read', '/missing.txt', error);
    assert.strictEqual(log.severity, 'error');
  });

  await t.test('ENCODING_ERROR has warning severity', () => {
    const error = new Error('Invalid encoding');
    const log = logFileOperation('read', '/file.txt', error);
    assert.strictEqual(log.severity, 'warning');
  });

  await t.test('UNKNOWN has info severity', () => {
    const error = new Error('Strange error');
    const log = logFileOperation('read', '/file.txt', error);
    assert.strictEqual(log.severity, 'info');
  });
});
