import { SupabaseClient, PostgrestSingleResponse, PostgrestResponse } from 'https://esm.sh/@supabase/supabase-js@2';
import { logger, perf } from './logging-service.ts';
import { DatabaseResult, QueryOptions } from './db-types.ts';
import { PoolManager } from './db-pool-manager.ts';

export class QueryExecutor {
  private pool: PoolManager;
  private defaultRetries = 3;
  private defaultRetryDelay = 1000;
  private connectionTimeout = 30000;

  constructor(pool: PoolManager) {
    this.pool = pool;
  }

  async executeQuery<T>(
    operation: string,
    queryFn: (client: SupabaseClient) => Promise<PostgrestResponse<T> | PostgrestSingleResponse<T>>,
    createClient: () => SupabaseClient,
    options: QueryOptions = {}
  ): Promise<DatabaseResult<T>> {
    const {
      timeout = this.connectionTimeout,
      retries = this.defaultRetries,
      retryDelay = this.defaultRetryDelay,
      enablePerformanceLogging = true,
      context: queryContext = {}
    } = options;

    const timerId = perf.start(`db.${operation}`);
    let retryCount = 0;
    let lastError: Error | null = null;
    const queryId = crypto.randomUUID();

    logger.debug(`Executing database operation: ${operation}`, {
      queryId,
      timeout,
      retries,
      ...queryContext
    });

    while (retryCount <= retries) {
      try {
        const client = await this.pool.getClient(createClient);

        const queryPromise = queryFn(client);
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error('Query timeout')), timeout);
        });

        const result = await Promise.race([queryPromise, timeoutPromise]);

        this.pool.releaseClient(client);

        if (result.error) {
          throw new Error(`Database error: ${result.error.message} (code: ${result.error.code})`);
        }

        const duration = perf.end(timerId);

        if (enablePerformanceLogging) {
          logger.info(`Database operation completed: ${operation}`, {
            queryId,
            duration,
            retryCount,
            hasData: !!result.data,
            dataLength: Array.isArray(result.data) ? result.data.length : 1
          });
        }

        return {
          data: result.data,
          error: null,
          success: true,
          performance: {
            duration,
            operation,
            retryCount
          }
        };

      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        retryCount++;
        logger.warn(`Database operation failed (attempt ${retryCount}/${retries + 1}): ${operation}`, {
          queryId, error: lastError.message, retryCount, willRetry: retryCount <= retries
        });
        if (retryCount <= retries) {
          await new Promise(resolve => setTimeout(resolve, retryDelay * retryCount));
        }
      }
    }

    const duration = perf.end(timerId);
    logger.error(`Database operation failed after ${retries + 1} attempts: ${operation}`, {
      queryId, duration, finalError: lastError?.message
    });

    return {
      data: null,
      error: lastError,
      success: false,
      performance: { duration, operation, retryCount }
    };
  }

  async executeTransaction<T>(
    operations: Array<{ operation: string; queryFn: (client: SupabaseClient) => Promise<any> }>,
    createClient: () => SupabaseClient,
    options: QueryOptions = {}
  ): Promise<DatabaseResult<T[]>> {
    const transactionTimerId = perf.start('db.transaction');
    const transactionId = crypto.randomUUID();
    const results: any[] = [];
    let client: SupabaseClient | undefined;

    logger.info(`Starting database transaction with ${operations.length} operations`, {
      transactionId, operations: operations.map(op => op.operation)
    });

    try {
      client = await this.pool.getClient(createClient);
      for (const { operation, queryFn } of operations) {
        const result = await this.executeQuery(operation, () => queryFn(client!), createClient,
          { ...options, enablePerformanceLogging: false });
        if (!result.success) throw result.error;
        results.push(result.data);
      }

      this.pool.releaseClient(client);
      const duration = perf.end(transactionTimerId);
      logger.info(`Database transaction completed successfully`, { transactionId, duration, operationCount: operations.length });

      return { data: results, error: null, success: true, performance: { duration, operation: 'transaction', retryCount: 0 } };

    } catch (error) {
      if (client) this.pool.releaseClient(client);
      const duration = perf.end(transactionTimerId);
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(`Database transaction failed`, { transactionId, duration, error: err.message, operationsCompleted: results.length });
      return { data: null, error: err, success: false, performance: { duration, operation: 'transaction', retryCount: 0 } };
    }
  }
}
