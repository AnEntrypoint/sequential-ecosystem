/**
 * file-operations-handlers.js - File Operations Facade
 *
 * Delegates to focused handler modules:
 * - file-read-handlers: Read operations (list, read)
 * - file-write-handlers: Write operations (save, write, mkdir, delete)
 * - file-transform-handlers: Transform operations (rename, copy)
 */

import { formatError } from '@sequentialos/response-formatting';
import { createReadHandlers } from './file-read-handlers.js';
import { createWriteHandlers } from './file-write-handlers.js';
import { createTransformHandlers } from './file-transform-handlers.js';

export function handleFileError(operation, filePath, error, res) {
  const statusCode = error.httpCode || 500;
  res.status(statusCode).json(formatError(statusCode, {
    code: error.code || 'FILE_OPERATION_FAILED',
    message: error.message || `File ${operation} failed`
  }));
}

export function broadcastFileEvent(eventType, filePath, metadata = {}) {
  // Broadcast event to connected WebSocket clients
  // Implementation depends on WebSocket manager in container
  // This is a stub - actual implementation would emit via websocket
}

// Re-export handler factories
export { createReadHandlers, createWriteHandlers, createTransformHandlers };
