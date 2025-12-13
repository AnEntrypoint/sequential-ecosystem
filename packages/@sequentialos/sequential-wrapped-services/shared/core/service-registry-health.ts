import { httpClient } from './http-client.ts';
import { logger } from './logging-service.ts';
import { config } from './config-service.ts';
import type { ServiceHealth } from './service-registry-types.ts';
import type { ServiceRegistry } from './service-registry-core.ts';

export function createHealthHandlers(registry: ServiceRegistry) {
  async function performHealthCheck(serviceName: string): Promise<ServiceHealth> {
    const service = registry.getService(serviceName);
    if (!service || !service.healthCheck) {
      return 'unknown';
    }

    const supabaseUrl = config.supabase?.url || 'http://127.0.0.1:54321';
    if (service.baseUrl.startsWith(supabaseUrl) &&
        (serviceName.startsWith('wrapped') || ['gapi', 'keystore', 'database', 'openai', 'websearch'].includes(serviceName))) {
      const healthStatus = registry.getHealthStatusMap();
      const lastHealthCheck = registry.getLastHealthCheckMap();
      healthStatus.set(serviceName, 'healthy');
      lastHealthCheck.set(serviceName, Date.now());
      return 'healthy';
    }

    try {
      const { path, method = 'GET', timeout = 5000 } = service.healthCheck;
      const url = `${service.baseUrl}${path}`;

      const response = await httpClient.request(url, {
        method,
        timeout,
        enableFlowState: false
      });

      const status = response.success ? 'healthy' : 'unhealthy';
      const healthStatus = registry.getHealthStatusMap();
      const lastHealthCheck = registry.getLastHealthCheckMap();
      healthStatus.set(serviceName, status);
      lastHealthCheck.set(serviceName, Date.now());

      logger.debug(`Health check completed for ${serviceName}: ${status}`, {
        url,
        status: response.status
      });

      return status;

    } catch (error) {
      logger.warn(`Health check failed for ${serviceName}`, {
        error: error instanceof Error ? error.message : String(error)
      });

      const healthStatus = registry.getHealthStatusMap();
      const lastHealthCheck = registry.getLastHealthCheckMap();
      healthStatus.set(serviceName, 'unhealthy');
      lastHealthCheck.set(serviceName, Date.now());
      return 'unhealthy';
    }
  }

  function startHealthChecks(): void {
    setInterval(async () => {
      for (const service of registry.getAllServices()) {
        if (service.healthCheck) {
          const interval = service.healthCheck.interval || 30000;
          const lastHealthCheck = registry.getLastHealthCheckMap();
          const lastCheck = lastHealthCheck.get(service.name) || 0;

          if (Date.now() - lastCheck >= interval) {
            await performHealthCheck(service.name);
          }
        }
      }
    }, 10000);
  }

  function getServiceHealth(serviceName: string): ServiceHealth {
    const healthStatus = registry.getHealthStatusMap();
    return healthStatus.get(serviceName) || 'unknown';
  }

  function getAllServiceHealth(): Record<string, ServiceHealth> {
    const health: Record<string, ServiceHealth> = {};
    const healthStatus = registry.getHealthStatusMap();
    for (const [serviceName, status] of healthStatus) {
      health[serviceName] = status;
    }
    return health;
  }

  function clearCache(serviceName?: string): void {
    const cache = registry.getCacheMap();
    if (serviceName) {
      for (const [key] of cache) {
        if (key.startsWith(`${serviceName}.`)) {
          cache.delete(key);
        }
      }
    } else {
      cache.clear();
    }
  }

  function getStats(): {
    totalServices: number;
    totalMethods: number;
    healthSummary: Record<string, number>;
    cacheSize: number;
  } {
    const healthSummary: Record<string, number> = {
      healthy: 0,
      degraded: 0,
      unhealthy: 0,
      unknown: 0
    };

    const healthStatus = registry.getHealthStatusMap();
    for (const status of healthStatus.values()) {
      healthSummary[status]++;
    }

    let totalMethods = 0;
    for (const service of registry.getAllServices()) {
      totalMethods += service.methods.length;
    }

    const cache = registry.getCacheMap();
    return {
      totalServices: registry.getAllServices().length,
      totalMethods,
      healthSummary,
      cacheSize: cache.size
    };
  }

  return {
    performHealthCheck,
    startHealthChecks,
    getServiceHealth,
    getAllServiceHealth,
    clearCache,
    getStats
  };
}
