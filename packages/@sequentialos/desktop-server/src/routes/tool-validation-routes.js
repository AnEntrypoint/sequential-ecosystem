/**
 * tool-validation-routes.js
 *
 * Tool testing and import validation routes
 */

import { validateRequired, validateType } from '@sequentialos/validation';
import { executeTaskWithTimeout } from '@sequentialos/server-utilities';
import { asyncHandler } from '../middleware/error-handler.js';
import { formatResponse } from '@sequentialos/response-formatting';

const commonPackages = [
  'axios', 'lodash', 'moment', 'date-fns', 'uuid', 'crypto-js',
  'qs', 'dotenv', 'express', 'cors', 'multer', 'body-parser',
  'jsonwebtoken', 'bcrypt', 'validator', 'joi', 'yup',
  'node-fetch', 'xml2js', 'csv-parse', 'pdf-parse', 'cheerio'
];

export function registerToolValidationRoutes(app, rateLimiter) {
  app.post('/api/tools/test', rateLimiter, asyncHandler(async (req, res) => {
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
      throw new Error('packages must be an array');
    }

    const invalid = [];
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
}
