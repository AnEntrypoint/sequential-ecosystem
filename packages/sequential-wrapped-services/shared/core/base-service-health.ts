import { logger, perf } from './logging-service.ts';
import { DatabaseService } from './database-service.ts';
import { ConfigService } from './config-service.ts';
import { IHealthCheckResult, IServiceConfig, ServiceHealthStatus } from './base-service-types.ts';
import { nowISO } from '@sequential/sequential-utils/timestamps';

export async function performHealthCheck(
  serviceName: string,
  serviceVersion: string,
  config: ConfigService,
  database: DatabaseService
): Promise<IHealthCheckResult> {
  const timerId = perf.start(`${serviceName}.healthCheck`);

  try {
    const checks: Promise<{ name: string; healthy: boolean; error?: string }>[] = [
      checkConfigurationHealth(config),
      checkDatabaseHealth(database)
    ];

    const results = await Promise.allSettled(checks);

    let overallStatus: ServiceHealthStatus = 'healthy';
    const details: Record<string, any> = {};
    let errors: string[] = [];

    results.forEach((result, index) => {
      const checkName = ['configuration', 'database'][index];

      if (result.status === 'fulfilled') {
        details[checkName] = result.value;
        if (!result.value.healthy) {
          overallStatus = 'degraded';
          if (result.value.error) errors.push(result.value.error);
        }
      } else {
        details[checkName] = { healthy: false, error: 'Check failed' };
        overallStatus = 'unhealthy';
        errors.push(`${checkName} check failed: ${result.reason}`);
      }
    });

    const duration = perf.end(timerId);

    if (overallStatus === 'healthy') {
      logger.info(`Health check passed for ${serviceName}`, { duration });
    } else {
      logger.warn(`Health check issues for ${serviceName}`, { status: overallStatus, errors, duration });
    }

    return {
      status: overallStatus,
      timestamp: nowISO(),
      version: serviceVersion,
      details,
      performance: duration,
      error: errors.length > 0 ? errors.join('; ') : undefined
    };

  } catch (error) {
    const duration = perf.end(timerId);
    logger.error(`Health check failed for ${serviceName}`, error as Error, { duration });
    return {
      status: 'unhealthy',
      timestamp: nowISO(),
      version: serviceVersion,
      error: (error as Error).message,
      performance: duration
    };
  }
}

async function checkConfigurationHealth(config: ConfigService): Promise<{ name: string; healthy: boolean; error?: string }> {
  try {
    const validation = config.validate();
    return {
      name: 'configuration',
      healthy: validation.isValid,
      error: validation.isValid ? undefined : validation.errors.join(', ')
    };
  } catch (error) {
    return {
      name: 'configuration',
      healthy: false,
      error: (error as Error).message
    };
  }
}

async function checkDatabaseHealth(database: DatabaseService): Promise<{ name: string; healthy: boolean; error?: string }> {
  try {
    const dbHealth = await database.healthCheck();
    return {
      name: 'database',
      healthy: dbHealth.healthy,
      error: dbHealth.error
    };
  } catch (error) {
    return {
      name: 'database',
      healthy: false,
      error: (error as Error).message
    };
  }
}
