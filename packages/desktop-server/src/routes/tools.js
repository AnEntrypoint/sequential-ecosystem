import { createError, createValidationError } from '@sequential/error-handling';
import { validateRequired, validateType } from '@sequential/validation';
import { asyncHandler } from '../middleware/error-handler.js';
import { executeTaskWithTimeout } from 'server-utilities';
import { formatResponse } from 'response-formatting';
import { nowISO } from '@sequential/timestamp-utilities';
import logger from '@sequential/sequential-logging';

const toolTestLimiter = new Map();

function createToolTestRateLimiter() {
  return (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    const window = 60000;
    const maxRequests = 5;

    if (!toolTestLimiter.has(ip)) {
      toolTestLimiter.set(ip, []);
    }

    const requests = toolTestLimiter.get(ip).filter(timestamp => now - timestamp < window);
    toolTestLimiter.set(ip, requests);

    if (requests.length >= maxRequests) {
      logger.warn(`Rate limit exceeded for tool test endpoint from ${ip}`);
      return res.status(429).json(formatResponse(null, { error: 'Too many tool test requests. Max 5 per minute.' }));
    }

    requests.push(now);
    toolTestLimiter.set(ip, requests);
    next();
  };
}

export function registerToolRoutes(app, container) {
  const registry = container.resolve('ToolRegistry');

  app.get('/api/tools', asyncHandler(async (req, res) => {
    const tools = registry.getAllTools();
    res.json(formatResponse({ tools }));
  }));

  app.get('/api/tools/by-app', asyncHandler(async (req, res) => {
    const tools = registry.getToolsByApp();
    res.json(formatResponse(tools));
  }));

  app.get('/api/tools/:toolId', asyncHandler(async (req, res) => {
    const { toolId } = req.params;
    const tool = registry.findToolByName(toolId);
    if (!tool) {
      return res.status(404).json(formatResponse({ error: 'Tool not found' }));
    }
    res.json(formatResponse({ tool }));
  }));

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

  app.post('/api/tools/test', createToolTestRateLimiter(), asyncHandler(async (req, res) => {
    const { toolName, implementation, input } = req.body;

    validateRequired('toolName', toolName);
    validateRequired('implementation', implementation);
    validateType('toolName', toolName, 'string');
    validateType('implementation', implementation, 'string');

    const startTime = Date.now();
    const result = await executeTaskWithTimeout(toolName, implementation, input || {}, 30000);
    const duration = Date.now() - startTime;
    res.json(formatResponse({ output: result, duration }));
  }));

  app.post('/api/tools/validate-imports', asyncHandler(async (req, res) => {
    const { packages } = req.body;

    if (!Array.isArray(packages)) {
      throw createValidationError('packages must be an array', 'packages');
    }

    const invalid = [];
    const commonPackages = [
      'axios', 'lodash', 'moment', 'date-fns', 'uuid', 'crypto-js',
      'qs', 'dotenv', 'express', 'cors', 'multer', 'body-parser',
      'jsonwebtoken', 'bcrypt', 'validator', 'joi', 'yup',
      'node-fetch', 'xml2js', 'csv-parse', 'pdf-parse', 'cheerio'
    ];

    for (const pkg of packages) {
      if (!commonPackages.includes(pkg.toLowerCase())) {
        invalid.push(pkg);
      }
    }

    res.json(formatResponse({
      valid: invalid.length === 0,
      validated: packages.length,
      invalid,
      warning: invalid.length > 0 ? `These packages may not be available in the execution environment: ${invalid.join(', ')}` : null
    }));
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
