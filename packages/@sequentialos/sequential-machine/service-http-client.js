import logger from '@sequentialos/sequential-logging';
import { nowISO } from '@sequentialos/timestamp-utilities';

/**
 * Make HTTP call to wrapped service
 */
export async function callService(serviceUrl, method, params = {}, timeout = 30000) {
  const payload = {
    method,
    params,
    timestamp: nowISO()
  };

  logger.info(`🔧 Calling ${method}...`);

  try {
    const response = await fetch(`${serviceUrl}/call`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(timeout)
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(`Service error: ${result.error || 'Unknown error'}`);
    }

    logger.info('✅ Service call completed');
    return result;
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error(`Service call timeout after ${timeout}ms`);
    }
    throw error;
  }
}

/**
 * Check health endpoint of service
 */
export async function checkServiceHealth(serviceUrl, serviceName) {
  try {
    const response = await fetch(`${serviceUrl}/health`, {
      signal: AbortSignal.timeout(5000)
    });

    if (response.ok) {
      const health = await response.json();
      logger.info(`✅ ${serviceName}: ${health.status || 'OK'}`);
      return health;
    } else {
      logger.info(`❌ ${serviceName}: HTTP ${response.status}`);
      return null;
    }
  } catch (error) {
    logger.info(`❌ ${serviceName}: ${error.message}`);
    return null;
  }
}
