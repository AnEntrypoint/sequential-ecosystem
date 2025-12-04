/**
 * Dependency Injection factory wrappers
 * Convenient helpers for container creation and configuration
 */

import { createContainer } from '@sequential/dependency-injection';

/**
 * Create DI container with standard sequential configuration
 * @returns {Object} Configured DI container
 */
export function createSequentialContainer() {
  const container = createContainer();
  return container;
}

/**
 * Create DI container with services pre-registered
 * @param {Object} services - Service implementations to register
 * @returns {Object} Configured DI container with services
 */
export function createContainerWithServices(services = {}) {
  const container = createContainer();

  Object.entries(services).forEach(([name, factory]) => {
    container.register(name, factory);
  });

  return container;
}

/**
 * Register service factory with container
 * @param {Object} container - DI container
 * @param {string} serviceName - Service identifier
 * @param {Function} factory - Factory function or constructor
 * @returns {Object} Container for chaining
 */
export function registerService(container, serviceName, factory) {
  container.register(serviceName, factory);
  return container;
}

export default {
  createSequentialContainer,
  createContainerWithServices,
  registerService,
};
