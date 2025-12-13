/**
 * tool-query-routes.js
 *
 * Tool retrieval and search routes
 */

import { asyncHandler } from '../middleware/error-handler.js';
import { formatResponse } from '@sequentialos/response-formatting';

export function registerToolQueryRoutes(app, registry) {
  app.get('/api/tools', asyncHandler(async (req, res) => {
    const tools = registry.getAllTools();
    res.json(formatResponse({ tools }));
  }));

  app.get('/api/tools/by-app', asyncHandler(async (req, res) => {
    const tools = registry.getToolsByApp();
    res.json(formatResponse(tools));
  }));

  app.get('/api/tools/search', asyncHandler(async (req, res) => {
    const { q } = req.query;
    if (!q) return res.json(formatResponse([]));
    const results = registry.searchTools(q);
    res.json(formatResponse(results));
  }));

  app.get('/api/tools/stats', asyncHandler(async (req, res) => {
    res.json(formatResponse(registry.getStats()));
  }));

  app.get('/api/tools/app/:appId', asyncHandler(async (req, res) => {
    const { appId } = req.params;
    const tools = registry.getAppTools(appId);
    res.json(formatResponse({ tools }));
  }));

  app.get('/api/tools/:toolId', asyncHandler(async (req, res) => {
    const { toolId } = req.params;
    const tool = registry.findToolByName(toolId);
    if (!tool) {
      return res.status(404).json(formatResponse({ error: 'Tool not found' }));
    }
    res.json(formatResponse({ tool }));
  }));
}
