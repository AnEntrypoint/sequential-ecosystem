export {
  buildErrorResponse,
  validationError,
  notFoundError,
  forbiddenError,
  conflictError,
  unprocessableError,
  internalError,
  sendError,
  ErrorCode,
  STATUS_CODES
} from './error-responses.js';

export function createErrorResponse(code, message, extra = {}) {
  return {
    error: {
      code,
      message,
      timestamp: nowISO(),
      ...extra
    }
  };
}

export function createSuccessResponse(data, meta = {}) {
  return {
    success: true,
    data,
    timestamp: nowISO(),
    ...meta
  };
}

export function createPaginatedResponse(items, page, pageSize, total) {
  return {
    success: true,
    data: items,
    pagination: {
      page,
      pageSize,
      total,
      pages: Math.ceil(total / pageSize)
    },
    timestamp: nowISO()
  };
}

export function createMetricsResponse(metrics) {
  return {
    success: true,
    metrics,
    timestamp: nowISO()
  };
}

export function createListResponse(items, count = null) {
  return {
    success: true,
    data: items,
    count: count !== null ? count : items.length,
    timestamp: nowISO()
  };
}

export function createBatchResponse(results, failed = []) {
  return {
    success: true,
    processed: results.length,
    failed: failed.length,
    results,
    ...(failed.length > 0 && { failedItems: failed }),
    timestamp: nowISO()
  };
}

export function formatErrorForResponse(error, statusCode = 500) {
  return {
    statusCode,
    body: createErrorResponse(
      error.code || 'INTERNAL_ERROR',
      error.message || 'An unexpected error occurred',
      { details: process.env.DEBUG ? { stack: error.stack } : undefined }
    )
  };
}
