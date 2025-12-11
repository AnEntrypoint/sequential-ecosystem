/**
 * tool-execution-routes.js
 *
 * Tool invocation and execution routes
 */

import { asyncHandler } from '../middleware/error-handler.js';
import { formatResponse } from '@sequentialos/response-formatting';
import logger from '@sequentialos/sequential-logging';

export function registerToolExecutionRoutes(app, registry) {
  app.get('/api/tools/app/:appId/:toolName', asyncHandler(async (req, res) => {
    const { appId, toolName } = req.params;
    let tool = registry.findTool(appId, toolName);

    if (!tool && appId === '__persisted') {
      const normalizedName = toolName.toLowerCase().replace(/\s+/g, '-');
      tool = registry.findTool(appId, normalizedName);
    }

    if (!tool) {
      return res.status(404).json(formatResponse({ error: `Tool ${toolName} not found in app ${appId}` }));
    }
    res.json(formatResponse({ tool }));
  }));

  app.post('/api/tools/app/:appId/:toolName', asyncHandler(async (req, res) => {
    const { appId, toolName } = req.params;
    const { input } = req.body;

    let tool = registry.findTool(appId, toolName);

    if (!tool && appId === '__persisted') {
      const normalizedName = toolName.toLowerCase().replace(/\s+/g, '-');
      tool = registry.findTool(appId, normalizedName);
    }

    if (!tool) {
      return res.status(404).json(formatResponse({ error: `Tool ${toolName} not found in app ${appId}` }));
    }

    if (!tool.handler) {
      return res.status(500).json(formatResponse({ error: `Tool ${toolName} has no handler` }));
    }

    try {
      const startTime = Date.now();
      const result = await tool.handler(input);
      const duration = Date.now() - startTime;
      res.json(formatResponse({ success: true, output: result, duration }));
    } catch (err) {
      logger.error(`Tool execution failed: ${toolName}`, err);
      res.status(500).json(formatResponse({ error: err.message }));
    }
  }));
}
