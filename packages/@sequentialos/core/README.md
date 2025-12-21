# @sequential/core

Core utilities package consolidating error-handling and response-formatting for the Sequential Ecosystem.

**Status**: Production-ready
**Version**: 1.0.0
**Type**: ES Module

## Overview

`@sequential/core` provides two main modules:

1. **Error Handling** - Error serialization, categorization, logging, and detailed error responses
2. **Response Formatting** - Standardized response formatting for success, errors, pagination, metrics, and batches

All modules follow consistent patterns and integrate seamlessly with Express.js applications.

**Note**: Validation functionality has been moved to `@sequentialos/validation` package for better separation of concerns.

## Installation

This package is part of the sequential-ecosystem monorepo and is available locally:

```javascript
// Available in monorepo packages
import { response } from '@sequentialos/core';
```

For standalone usage (if published to npm):
```bash
npm install @sequential/core
```

## Modules

### Error Handling (`./error`)

Error categorization, serialization, logging, and formatting.

#### Classes

**`SerializedError`**
Serializable error container that preserves error information across process boundaries.

```javascript
import { SerializedError, serializeError } from '@sequential/core';

const err = new Error('Something went wrong');
const serialized = serializeError(err);
console.log(serialized.toJSON()); // { message, name, stack, code }
```

#### Functions

**`serializeError(error)`**
Convert an Error to a SerializedError (idempotent).

```javascript
const serialized = serializeError(error);
// Returns same instance if already SerializedError
```

**`normalizeError(error)`**
Normalize any error-like value to SerializedError.

```javascript
normalizeError(null)              // returns null
normalizeError('string')          // returns SerializedError
normalizeError({message: 'x'})    // returns SerializedError
normalizeError(new Error('x'))    // returns SerializedError
```

**`createDetailedErrorResponse(operation, filePath, error, statusCode = 500)`**
Create detailed error response for API clients.

```javascript
import { createDetailedErrorResponse } from '@sequential/core';

try {
  await fileOperation(path);
} catch (err) {
  const response = createDetailedErrorResponse('operation', path, err, 500);
  // Returns: { error: { code, message, operation, filePath, timestamp, details } }
}
```

**`ErrorCategories`**
Error categorization constants.

```javascript
import { ErrorCategories } from '@sequential/core';

// FILE_NOT_FOUND, PERMISSION_DENIED, PATH_TRAVERSAL, INVALID_INPUT,
// FILE_TOO_LARGE, ENCODING_ERROR, DISK_SPACE, OPERATION_FAILED, UNKNOWN
```

### Response Formatting (`./response`)

Standardized response formatting for APIs.

#### Functions

**`createErrorResponse(code, message, extra = {})`**
Format error response.

```javascript
import { response } from '@sequential/core';

res.status(400).json(
  response.createErrorResponse('INVALID_INPUT', 'Email is required', { field: 'email' })
);
// Returns: { error: { code, message, timestamp, ...extra } }
```

**`createSuccessResponse(data, meta = {})`**
Format success response.

```javascript
import { response } from '@sequential/core';

res.json(
  response.createSuccessResponse({ id: 123, name: 'Alice' })
);
// Returns: { success: true, data, timestamp, ...meta }
```

**`createPaginatedResponse(items, page, pageSize, total)`**
Format paginated response.

```javascript
import { response } from '@sequential/core';

res.json(
  response.createPaginatedResponse(items, 1, 10, 100)
);
// Returns: { success: true, data: items, pagination: { page, pageSize, total, pages }, timestamp }
```

**`createMetricsResponse(metrics)`**
Format metrics response.

```javascript
import { response } from '@sequential/core';

res.json(
  response.createMetricsResponse({
    requestCount: 1234,
    avgResponseTime: 45.2,
    errorRate: 0.02
  })
);
// Returns: { success: true, metrics, timestamp }
```

**`createListResponse(items, count = null)`**
Format list response.

```javascript
import { response } from '@sequential/core';

res.json(
  response.createListResponse(tasks)
);
// Returns: { success: true, data: items, count, timestamp }
```

**`createBatchResponse(results, failed = [])`**
Format batch operation response.

```javascript
import { response } from '@sequential/core';

res.json(
  response.createBatchResponse(
    [{ id: 1, ok: true }, { id: 2, ok: true }],
    [{ id: 3, error: 'Not found' }]
  )
);
// Returns: { success: true, processed, failed, results, failedItems, timestamp }
```

**`formatErrorForResponse(error, statusCode = 500)`**
Format error with status code for Express responses.

```javascript
import { response } from '@sequential/core';

try {
  await operation();
} catch (err) {
  const { statusCode, body } = response.formatErrorForResponse(err, 400);
  res.status(statusCode).json(body);
}
```

## Common Patterns

### Express Error Middleware

```javascript
import { response } from '@sequential/core';

app.use((err, req, res, next) => {
  const { statusCode, body } = response.formatErrorForResponse(err);
  res.status(statusCode).json(body);
});
```

### File Operation with Error Handling

```javascript
import { createDetailedErrorResponse } from '@sequential/core';
import { validateFilePath } from '@sequentialos/validation';

app.post('/api/files/upload', (req, res) => {
  try {
    const filePath = validateFilePath(req.body.path);
    fs.writeFileSync(filePath, req.body.content);
    res.json({ success: true, path: filePath });
  } catch (err) {
    const response = createDetailedErrorResponse('upload', req.body.path, err);
    res.status(response.statusCode).json(response.error);
  }
});
```

### Input Validation

```javascript
import { response } from '@sequential/core';
import { validateRequired, validateInputSchema } from '@sequentialos/validation';

app.post('/api/users', (req, res) => {
  try {
    validateRequired(
      { name: 'email', value: req.body.email },
      { name: 'password', value: req.body.password }
    );

    const schema = [
      { name: 'email', type: 'string', required: true },
      { name: 'age', type: 'number', required: false }
    ];

    const errors = validateInputSchema(req.body, schema);
    if (errors) {
      return res.status(400).json(
        response.createErrorResponse('VALIDATION_ERROR', 'Validation failed', { errors })
      );
    }

    // Process valid input
    res.json(response.createSuccessResponse(user));
  } catch (err) {
    res.status(400).json(response.createErrorResponse('INVALID_INPUT', err.message));
  }
});
```

## Import Patterns

### Root imports (error handling only)

```javascript
import {
  SerializedError,
  serializeError,
  normalizeError,
  createDetailedErrorResponse,
  ErrorCategories
} from '@sequential/core';
```

### Namespace imports (recommended)

```javascript
import { response } from '@sequential/core';

response.createSuccessResponse(data);
```

### Submodule imports (for specific needs)

```javascript
import * as errorHandling from '@sequential/core/error';
import * as response from '@sequential/core/response';
```

## API Stability

All exports are stable and production-ready:

- **Error Handling**: Stable - actively used in error-logging.test.js
- **Response Formatting**: Stable - standardized HTTP response format

## Dependencies

- `fs-extra`: ^11.1.1 (for file system operations)

## License

MIT

## Contributing

When extending @sequential/core:

1. Add new functions to appropriate module (error, validation, response)
2. Export from module index.js
3. Re-export from root src/index.js if top-level (error handling only)
4. Add test cases and documentation
5. Follow existing code style (no comments, explicit names, type validation)

## Related Packages

- `@sequential/data-access-layer` - Repository pattern with validation integration
- `@sequential/task-execution-service` - Task service using error and response utilities
- `@sequential/dependency-injection` - DI container for managing core utilities
