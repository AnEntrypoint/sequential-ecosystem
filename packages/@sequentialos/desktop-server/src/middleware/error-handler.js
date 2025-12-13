import { createErrorHandler as createAppErrorHandler } from '@sequentialos/error-handling';
import { asyncHandler } from '@sequentialos/handler-wrappers';
import { nowISO, createTimestamps, updateTimestamp } from '@sequentialos/timestamp-utilities';

const MAX_LOG_SIZE = 1000;
const operationLog = [];

export function createErrorHandler() {
  return createAppErrorHandler();
}

export { asyncHandler };

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
