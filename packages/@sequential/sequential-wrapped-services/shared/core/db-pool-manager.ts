import { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { logger } from './logging-service.ts';
import { ConnectionPool } from './db-types.ts';

export class PoolManager {
  private connectionPool: ConnectionPool[] = [];
  private maxPoolSize = 10;
  private connectionTimeout = 30000;

  async getClient(createClient: () => SupabaseClient): Promise<SupabaseClient> {
    const availableConnection = this.connectionPool.find(conn => !conn.inUse);

    if (availableConnection) {
      availableConnection.inUse = true;
      availableConnection.lastUsed = Date.now();
      logger.debug('Reusing database connection from pool', {
        connectionId: availableConnection.client.toString()
      });
      return availableConnection.client;
    }

    if (this.connectionPool.length < this.maxPoolSize) {
      const client = createClient();
      const connection: ConnectionPool = {
        client,
        inUse: true,
        created: Date.now(),
        lastUsed: Date.now()
      };

      this.connectionPool.push(connection);
      logger.debug('Created new database connection', {
        poolSize: this.connectionPool.length
      });
      return client;
    }

    logger.warn('Connection pool exhausted, waiting for available connection');
    await this.waitForAvailableConnection();
    return this.getClient(createClient);
  }

  releaseClient(client: SupabaseClient): void {
    const connection = this.connectionPool.find(conn => conn.client === client);
    if (connection) {
      connection.inUse = false;
      connection.lastUsed = Date.now();
      logger.debug('Released database connection back to pool');
    }
  }

  private async waitForAvailableConnection(): Promise<void> {
    let attempts = 0;
    const maxAttempts = 30;

    while (attempts < maxAttempts) {
      const availableConnection = this.connectionPool.find(conn => !conn.inUse);
      if (availableConnection) {
        return;
      }

      await new Promise(resolve => setTimeout(resolve, 100));
      attempts++;
    }

    throw new Error('Timeout waiting for available database connection');
  }

  cleanupConnections(): void {
    const now = Date.now();
    const staleThreshold = 5 * 60 * 1000;

    const beforeCount = this.connectionPool.length;
    this.connectionPool = this.connectionPool.filter(conn => {
      const isStale = !conn.inUse && (now - conn.lastUsed) > staleThreshold;
      if (isStale) {
        logger.debug('Cleaning up stale database connection', {
          connectionAge: now - conn.created,
          lastUsed: now - conn.lastUsed
        });
      }
      return !isStale;
    });

    const afterCount = this.connectionPool.length;
    if (afterCount !== beforeCount) {
      logger.info('Database connection pool cleanup completed', {
        beforeCount,
        afterCount,
        cleanedUp: beforeCount - afterCount
      });
    }
  }

  getPoolStats(): {
    total: number;
    inUse: number;
    available: number;
    oldestConnection: number;
    newestConnection: number;
  } {
    const now = Date.now();
    const inUse = this.connectionPool.filter(conn => conn.inUse).length;

    return {
      total: this.connectionPool.length,
      inUse,
      available: this.connectionPool.length - inUse,
      oldestConnection: this.connectionPool.length > 0
        ? now - Math.min(...this.connectionPool.map(conn => conn.created))
        : 0,
      newestConnection: this.connectionPool.length > 0
        ? now - Math.max(...this.connectionPool.map(conn => conn.created))
        : 0
    };
  }

  async close(): Promise<void> {
    logger.info('Closing database pool', {
      activeConnections: this.connectionPool.filter(conn => conn.inUse).length
    });

    const maxWait = 10000;
    const startTime = Date.now();

    while (this.connectionPool.some(conn => conn.inUse) && (Date.now() - startTime) < maxWait) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    this.connectionPool = [];
    logger.info('Database pool closed');
  }
}
