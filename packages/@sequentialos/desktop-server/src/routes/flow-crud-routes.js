/**
 * flow-crud-routes.js
 *
 * Flow CRUD API endpoints (list, get, create, run)
 */

import { asyncHandler } from '../middleware/error-handler.js';
import { formatResponse, formatError } from '@sequentialos/response-formatting';

export function registerFlowCrudRoutes(app, repository, flowHandlers) {
  // List all flows
  app.get('/api/flows', asyncHandler(async (req, res) => {
    const flows = await repository.getAll();
    res.json(formatResponse({ flows }));
  }));

  // Get single flow
  app.get('/api/flows/:flowId', asyncHandler(async (req, res) => {
    const { flowId } = req.params;
    const flow = await repository.get(flowId);
    res.json(formatResponse({ flow }));
  }));

  // Get flow history
  app.get('/api/flows/:flowId/history', asyncHandler(async (req, res) => {
    const { flowId } = req.params;
    const history = await repository.getHistory?.(flowId) || [];
    res.json(formatResponse({ flowId, runs: history, count: history.length }));
  }));

  // Create flow
  app.post('/api/flows', flowHandlers.create);

  // Run flow
  app.post('/api/flows/run', flowHandlers.run);
}
