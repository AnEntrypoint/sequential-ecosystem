import { createErrorHandler as createAppErrorHandler } from '@sequential/error-handling';
import { nowISO, createTimestamps, updateTimestamp } from '@sequential/timestamp-utilities';

const MAX_LOG_SIZE = 1000;
const operationLog = [];

export function createErrorHandler() {
  return createAppErrorHandler();
}

export function asyncHandler(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}

export function logOperation(type, data) {
  operationLog.push({
    type,
    data,
    timestamp: nowISO()
  });
  if (operationLog.length > MAX_LOG_SIZE) {
    operationLog.shift();
  }
}

export function getOperationLog() {
  return operationLog;
}
