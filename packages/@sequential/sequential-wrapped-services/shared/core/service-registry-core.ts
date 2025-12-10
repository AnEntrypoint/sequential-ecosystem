import { logger } from './logging-service.ts';
import type { ServiceHealth, ServiceDefinition } from './service-registry-types.ts';
import { createServiceDefinitions } from './service-definitions.ts';

export class ServiceRegistry {
  private static instance: ServiceRegistry;
  private services: Map<string, ServiceDefinition> = new Map();
  private healthStatus: Map<string, ServiceHealth> = new Map();
  private lastHealthCheck: Map<string, number> = new Map();
  private serviceCache: Map<string, { data: any; timestamp: number }> = new Map();

  private constructor() {
    this.initializeServices();
  }

  public static getInstance(): ServiceRegistry {
    if (!ServiceRegistry.instance) {
      ServiceRegistry.instance = new ServiceRegistry();
    }
    return ServiceRegistry.instance;
  }

  private initializeServices(): void {
    const definitions = createServiceDefinitions();
    for (const def of definitions) {
      this.registerService(def);
    }
  }

  public registerService(service: ServiceDefinition): void {
    this.services.set(service.name, service);
    this.healthStatus.set(service.name, 'unknown');
    logger.info(`Service registered: ${service.name}`, {
      version: service.version,
      baseUrl: service.baseUrl,
      methods: service.methods.length
    });
  }

  public getService(serviceName: string): ServiceDefinition | undefined {
    return this.services.get(serviceName);
  }

  public getAllServices(): ServiceDefinition[] {
    return Array.from(this.services.values());
  }

  public hasService(serviceName: string): boolean {
    return this.services.has(serviceName);
  }

  getCacheMap() {
    return this.serviceCache;
  }

  getHealthStatusMap() {
    return this.healthStatus;
  }

  getLastHealthCheckMap() {
    return this.lastHealthCheck;
  }
}
