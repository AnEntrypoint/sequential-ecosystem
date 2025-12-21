/**
 * Shared Webhook Executor Framework
 *
 * Provides a unified execution pattern for GXE webhook-style dispatchers.
 * Handles argument parsing, JSON input parsing, dynamic module import, and error handling.
 */

import fs from 'fs';
import path from 'path';
import { getDirname } from '@sequentialos/es-module-utils';
import logger from '@sequentialos/sequential-logging';

/**
 * Parse command-line arguments in --key=value format
 * @param {Object} argMapping - Maps argument names to config keys
 * @returns {Object} Parsed arguments
 */
function parseArguments(argMapping) {
  const parsed = {};

  // First, check environment variables
  for (const [argName, envKey] of Object.entries(argMapping)) {
    if (process.env[envKey]) {
      parsed[argName] = process.env[envKey];
    }
  }

  // Then, parse CLI args (override env vars)
  for (let i = 0; i < process.argv.length; i++) {
    const arg = process.argv[i];
    for (const [argName, envKey] of Object.entries(argMapping)) {
      const prefix = `--${argName}=`;
      if (arg.startsWith(prefix)) {
        parsed[argName] = arg.split('=')[1];
      }
    }
  }

  return parsed;
}

/**
 * Parse JSON input (supports inline JSON or file path)
 * @param {string} input - JSON string or file path
 * @returns {Object} Parsed JSON object
 */
function parseJsonInput(input) {
  if (!input) {
    return {};
  }

  try {
    // Try to parse as JSON
    return JSON.parse(input);
  } catch (e) {
    // Try to read from file
    try {
      const fileContent = fs.readFileSync(input, 'utf-8');
      return JSON.parse(fileContent);
    } catch (fileErr) {
      throw new Error(`Invalid JSON input or file: ${input}`);
    }
  }
}

/**
 * Dynamically import a service module
 * @param {string} servicePath - Relative path from gxe-dispatch directory
 * @returns {Promise<any>} Imported service class
 */
async function importService(servicePath) {
  const __dirname = getDirname(import.meta.url);
  const absolutePath = path.join(__dirname, '../../../', servicePath);

  const serviceModule = await import(`file://${absolutePath}`);
  const Service = serviceModule[Object.keys(serviceModule)[0]] || serviceModule.default;

  if (!Service) {
    throw new Error(`Could not import service from ${servicePath}`);
  }

  return Service;
}

/**
 * Execute a webhook-style command
 * @param {Object} config - Execution configuration
 * @param {Object} config.argMapping - Maps CLI args to env var names
 * @param {Array<string>} config.requiredArgs - List of required argument names
 * @param {string} config.usageExample - Usage example for error messages
 * @param {string} config.servicePath - Path to service module
 * @param {string} config.methodName - Method to call on service
 * @param {string} config.errorCode - Error code for failures
 * @param {Function} config.buildMethodArgs - Build arguments for service method
 * @returns {Promise<any>} Execution result
 */
export async function executeWebhook(config) {
  const {
    argMapping,
    requiredArgs,
    usageExample,
    servicePath,
    methodName,
    errorCode,
    buildMethodArgs
  } = config;

  try {
    // Parse arguments
    const args = parseArguments(argMapping);

    // Validate required arguments
    const missing = requiredArgs.filter(arg => !args[arg]);
    if (missing.length > 0) {
      logger.error(`Error: ${missing.join(', ')} required`);
      logger.error(`Usage: ${usageExample}`);
      process.exit(1);
    }

    // Parse JSON inputs
    for (const [key, value] of Object.entries(args)) {
      if (key.includes('input') || key.includes('Input') || key.includes('params') || key.includes('Params')) {
        args[key] = parseJsonInput(value);
      }
    }

    // Import service
    const Service = await importService(servicePath);

    // Instantiate service (or get singleton)
    const service = typeof Service.getInstance === 'function'
      ? Service.getInstance()
      : new Service();

    // Build method arguments
    const methodArgs = buildMethodArgs(args);

    // Execute method
    const result = await service[methodName](...methodArgs);

    // Output result
    logger.info(JSON.stringify(result, null, 2));
    process.exit(0);

  } catch (error) {
    logger.error(JSON.stringify({
      success: false,
      error: {
        message: error.message,
        code: errorCode
      }
    }, null, 2));
    process.exit(1);
  }
}
