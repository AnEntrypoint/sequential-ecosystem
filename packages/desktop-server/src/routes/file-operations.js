import { asyncHandler } from '../middleware/error-handler.js';
import { createOperationLogger } from '@sequentialos/operation-logger';
import { createReadHandlers, createWriteHandlers, createTransformHandlers } from './file-operations-handlers.js';

export function registerFileRoutes(app, container) {
  if (!container) throw new Error('Container required for FileRoutes');
  const logger = createOperationLogger({ logOperation: () => {}, logFileOperation: () => {}, logFileSuccess: () => {} });

  const readHandlers = createReadHandlers(logger);
  const writeHandlers = createWriteHandlers(logger);
  const transformHandlers = createTransformHandlers(logger);

  // READ OPERATIONS
  app.get('/api/files/current-path', (req, res) => readHandlers.getCurrentPath(req, res));
  app.get('/api/files/list', asyncHandler((req, res) => readHandlers.listFiles(req, res)));
  app.get('/api/files/read', asyncHandler((req, res) => readHandlers.readFile(req, res)));

  // WRITE OPERATIONS
  app.post('/api/files/save', asyncHandler((req, res) => writeHandlers.saveFile(req, res)));
  app.post('/api/files/write', asyncHandler((req, res) => writeHandlers.writeFile(req, res)));
  app.post('/api/files/mkdir', asyncHandler((req, res) => writeHandlers.mkdir(req, res)));
  app.delete('/api/files', asyncHandler((req, res) => writeHandlers.delete(req, res)));

  // TRANSFORM OPERATIONS
  app.post('/api/files/rename', asyncHandler((req, res) => transformHandlers.rename(req, res)));
  app.post('/api/files/copy', asyncHandler((req, res) => transformHandlers.copy(req, res)));
}
