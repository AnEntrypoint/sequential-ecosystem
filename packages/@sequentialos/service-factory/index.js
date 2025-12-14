export class ServiceFactory {
  constructor() { this.services = new Map(); }
  register(name, ServiceClass) { this.services.set(name, ServiceClass); }
  create(name, ...args) {
    const ServiceClass = this.services.get(name);
    if (!ServiceClass) throw new Error(`Service not found: ${name}`);
    return new ServiceClass(...args);
  }
}
export function createServiceFactory() { return new ServiceFactory(); }
export default { ServiceFactory, createServiceFactory };
