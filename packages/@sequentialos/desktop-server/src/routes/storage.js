import { asyncHandler } from '../middleware/error-handler.js';
import { formatResponse } from '@sequentialos/response-formatting';
import { createValidationError } from '@sequentialos/error-handling';

export function registerStorageRoutes(app, container) {
  const stateManager = container.resolve('StateManager');

  function createStorageId(appId, key) {
    return `${appId}__${key.replace(/\//g, '__')}`;
  }

  app.get('/api/storage/:scope/:appId/:key(*)', asyncHandler(async (req, res) => {
    const { scope, appId, key } = req.params;

    if (!appId || !key) {
      throw createValidationError('path', 'appId and key are required');
    }

    const storageId = createStorageId(appId, key);
    const data = await stateManager.get(scope, storageId);
    const value = data?.value || null;
    res.json(formatResponse({ success: true, value }));
  }));

  app.post('/api/storage/:scope/:appId/:key(*)', asyncHandler(async (req, res) => {
    const { scope, appId, key } = req.params;
    const { value } = req.body;

    if (!appId || !key) {
      throw createValidationError('path', 'appId and key are required');
    }
    if (value === undefined) {
      throw createValidationError('value', 'value is required');
    }

    const storageId = createStorageId(appId, key);
    const data = { value, timestamp: new Date().toISOString() };
    await stateManager.set(scope, storageId, data);
    res.json(formatResponse({ success: true, message: 'Storage updated' }));
  }));

  app.delete('/api/storage/:scope/:appId/:key(*)', asyncHandler(async (req, res) => {
    const { scope, appId, key } = req.params;

    if (!appId || !key) {
      throw createValidationError('path', 'appId and key are required');
    }

    const storageId = createStorageId(appId, key);
    await stateManager.delete(scope, storageId);
    res.json(formatResponse({ success: true, message: 'Storage deleted' }));
  }));

  app.get('/api/storage/:scope/:appId', asyncHandler(async (req, res) => {
    const { scope, appId } = req.params;

    if (!appId) {
      throw createValidationError('appId', 'appId is required');
    }

    const all = await stateManager.getAll(scope);
    const appItems = Object.entries(all || {}).filter(([id]) => id.startsWith(`${appId}__`));
    const items = appItems.map(([id, value]) => ({
      key: id.replace(`${appId}__`, '').replace(/__/g, '/'),
      value
    }));
    res.json(formatResponse({ success: true, items }));
  }));
}
