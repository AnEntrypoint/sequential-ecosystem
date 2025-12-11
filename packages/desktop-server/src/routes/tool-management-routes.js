/**
 * tool-management-routes.js
 *
 * Tool creation, update, deletion routes
 */

import { createValidationError } from '@sequentialos/error-handling';
import { asyncHandler } from '../middleware/error-handler.js';
import { formatResponse } from '@sequentialos/response-formatting';
import { nowISO } from '@sequentialos/timestamp-utilities';

export function registerToolManagementRoutes(app, registry) {
  app.post('/api/tools', asyncHandler(async (req, res) => {
    const { name, definition } = req.body;

    if (!name || typeof name !== 'string') {
      throw createValidationError('name', 'Tool name is required and must be a string');
    }
    if (!definition || typeof definition !== 'object') {
      throw createValidationError('definition', 'Tool definition is required');
    }
    if (!definition.implementation || typeof definition.implementation !== 'string') {
      throw createValidationError('implementation', 'Tool implementation is required and must be a string');
    }

    const id = name.toLowerCase().replace(/\s+/g, '-');
    const toolData = {
      id,
      name,
      description: definition.description || '',
      category: definition.category || 'Custom',
      implementation: definition.implementation,
      imports: definition.imports || { npm: [], cdn: [], esModules: '', importMap: null },
      createdAt: nowISO(),
      updatedAt: nowISO()
    };

    await registry.saveTool(toolData);
    res.json(formatResponse({ success: true, id, message: 'Tool saved' }));
  }));

  app.delete('/api/tools/:toolId', asyncHandler(async (req, res) => {
    const { toolId } = req.params;
    await registry.deleteTool(toolId);
    res.json(formatResponse({ success: true, message: 'Tool deleted' }));
  }));
}
