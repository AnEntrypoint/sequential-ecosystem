import logger from '@sequentialos/sequential-logging';
import { unifiedInvocationBridge } from './index.js';

export class ServiceInvocationBridge {
  constructor(baseUrl = 'http://localhost:3100') {
    this.baseUrl = baseUrl;
    this.services = new Map();
  }

  registerService(name, port, url = null) {
    const serviceUrl = url || `http://localhost:${port}`;
    this.services.set(name, { port, url: serviceUrl });
    logger.info(`[ServiceInvocationBridge] Registered service: ${name} at ${serviceUrl}`);
  }

  async callService(serviceName, method, params = {}) {
    const service = this.services.get(serviceName);

    if (!service) {
      logger.warn(`[ServiceInvocationBridge] Service not registered: ${serviceName}, attempting direct call`);
      return await unifiedInvocationBridge.callService(serviceName, method, params);
    }

    return await this._makeHttpCall(service.url, method, params);
  }

  async _makeHttpCall(serviceUrl, method, params) {
    try {
      const response = await fetch(`${serviceUrl}/${method}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Service-Call': 'true'
        },
        body: JSON.stringify(params),
        timeout: 30000
      });

      if (!response.ok) {
        throw new Error(`Service call failed: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      logger.error('[ServiceInvocationBridge] HTTP call failed', error);
      throw error;
    }
  }

  getServiceRegistry() {
    const registry = {};
    for (const [name, config] of this.services.entries()) {
      registry[name] = config;
    }
    return registry;
  }

  loadFromRegistry(registryFile) {
    try {
      const registry = JSON.parse(registryFile);
      if (registry.services && Array.isArray(registry.services)) {
        registry.services.forEach(service => {
          this.registerService(service.name, service.port, service.url);
        });
      }
      return true;
    } catch (error) {
      logger.error('[ServiceInvocationBridge] Failed to load registry', error);
      return false;
    }
  }
}

const globalServiceBridge = new ServiceInvocationBridge();

globalThis.__callWrappedService__ = (serviceName, method, params) =>
  globalServiceBridge.callService(serviceName, method, params);

export { globalServiceBridge };
export default ServiceInvocationBridge;
