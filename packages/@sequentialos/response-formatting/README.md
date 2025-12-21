# @sequentialos/response-formatting

Standardized response formatting utilities for Sequential OS API endpoints.

## Overview

This package provides utilities for creating consistent API responses that follow the `{success: boolean, data: {...}}` wrapper pattern used throughout Sequential OS.

## Installation

```bash
npm install @sequentialos/response-formatting
```

## Usage

```javascript
import {
  createSuccessResponse,
  createErrorResponse,
  createPaginatedResponse,
  formatError,
  responseFormatterMiddleware
} from '@sequentialos/response-formatting';

// Success response
const response = createSuccessResponse({ userId: 1, name: 'John' });
// { success: true, data: { userId: 1, name: 'John' } }

// Error response
const error = createErrorResponse('NOT_FOUND', 'User not found', { userId: 1 });
// { success: false, error: { code: 'NOT_FOUND', message: 'User not found', userId: 1 } }

// Paginated response
const paginated = createPaginatedResponse([...items], 100, 1, 10);
// { success: true, data: [...], metadata: { pagination: {...} } }
```

## Express Middleware

```javascript
import express from 'express';
import { responseFormatterMiddleware } from '@sequentialos/response-formatting';

const app = express();
app.use(responseFormatterMiddleware);

// Use helpers in routes
app.get('/users', (req, res) => {
  res.success({ users: [...] });
});

app.get('/users/:id', (req, res) => {
  const error = new Error('User not found');
  error.code = 'NOT_FOUND';
  error.statusCode = 404;
  res.error(error);
});
```

## API Reference

### Core Functions

- **createSuccessResponse(data, metadata?)** - Create success response with optional metadata
- **createErrorResponse(code, message, details?)** - Create error response with code and details
- **createPaginatedResponse(data, total, page, pageSize)** - Create paginated response with metadata
- **createListResponse(items, metadata?)** - Create list response with count
- **createBatchResponse(results)** - Create batch operation response with summary
- **createMetricsResponse(metrics)** - Create metrics response with timestamp

### Utility Functions

- **formatResponse(data)** - Wrap any data in success response
- **formatError(error)** - Convert Error object to error response
- **formatErrorForResponse(error)** - Format Error object (without stack trace)

### Middleware

- **responseFormatterMiddleware** - Express middleware adding res.success(), res.error(), res.paginated()

## Response Format

All responses follow this pattern:

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "metadata": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message",
    "details": { ... }
  }
}
```

## Security

- Stack traces are never included in error responses
- Only error messages and codes are exposed to clients
- Compatible with path validation and security requirements

## License

MIT
