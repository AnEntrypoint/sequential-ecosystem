/**
 * error-factories.js
 *
 * Factory functions for specific error types
 */

import { buildErrorResponse } from './error-builder.js';

export function validationError(fields, message = 'Validation failed') {
  const fieldArray = Array.isArray(fields) ? fields : [fields];
  return buildErrorResponse(
    'VALIDATION_ERROR',
    message,
    { fields: fieldArray }
  );
}

export function notFoundError(resource, identifier = '') {
  const code = {
    file: 'FILE_NOT_FOUND',
    task: 'TASK_NOT_FOUND',
    flow: 'FLOW_NOT_FOUND',
    layer: 'LAYER_NOT_FOUND'
  }[resource] || 'NOT_FOUND';

  const message = identifier
    ? `${resource} not found: ${identifier}`
    : `${resource} not found`;

  return buildErrorResponse(code, message, { resource, identifier });
}

export function forbiddenError(reason = 'Access denied') {
  return buildErrorResponse('FORBIDDEN', reason);
}

export function conflictError(resource, reason = 'Resource already exists') {
  return buildErrorResponse('CONFLICT', reason, { resource });
}

export function unprocessableError(message, details = {}) {
  return buildErrorResponse('UNPROCESSABLE_ENTITY', message, details);
}

export function internalError(message = 'Internal server error', error = null) {
  const details = {};
  if (error && process.env.DEBUG) {
    details.originalError = error.message;
    details.stack = error.stack?.split('\n').slice(0, 3);
  }
  return buildErrorResponse('INTERNAL_ERROR', message, details);
}
