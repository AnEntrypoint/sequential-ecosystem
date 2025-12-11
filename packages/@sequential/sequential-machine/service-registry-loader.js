import logger from '@sequentialos/sequential-logging';
import fs from 'fs';
import path from 'path';

/**
 * Load service registry from configuration file
 */
export function loadServices(registryPath) {
  if (!fs.existsSync(registryPath)) {
    logger.warn(`⚠️  Service registry not found at ${registryPath}`);
    logger.info('💡 Start wrapped services first: npx sequential-wrapped-services');
    return {};
  }

  try {
    const registry = JSON.parse(fs.readFileSync(registryPath, 'utf8'));
    return registry.services || {};
  } catch (error) {
    logger.error(`❌ Failed to load service registry: ${error.message}`);
    return {};
  }
}

/**
 * Get service by name from loaded services
 */
export function getService(services, serviceName) {
  const service = services[serviceName];
  if (!service) {
    throw new Error(`Service not found: ${serviceName}. Available: ${Object.keys(services).join(', ')}`);
  }
  return service;
}

/**
 * Get all service names
 */
export function getServiceNames(services) {
  return Object.keys(services);
}
