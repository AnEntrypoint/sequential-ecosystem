/**
 * Unified Database Service - Main orchestrator
 *
 * Provides high-level database operations with connection pooling,
 * retry logic, transaction support, and performance monitoring.
 */

import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { ConfigService, DatabaseConfig } from './config-service.ts';
import { logger, perf } from './logging-service.ts';
import { PoolManager } from './db-pool-manager.ts';
import { QueryExecutor } from './db-queries.ts';
import { CRUDOperations } from './db-crud-operations.ts';
import { DatabaseResult, QueryOptions, TaskFunction } from './db-types.ts';

export class DatabaseService {
  private static instance: DatabaseService;
  private config: ConfigService;
  private poolManager: PoolManager;
  private queryExecutor: QueryExecutor;
  private crud: CRUDOperations;

  private constructor() {
    this.config = ConfigService.getInstance();
    this.poolManager = new PoolManager();
    this.queryExecutor = new QueryExecutor(this.poolManager);
    this.crud = new CRUDOperations(this.queryExecutor, this.createClient.bind(this));
  }

  public static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  public get databaseConfig(): DatabaseConfig {
    return this.config.database;
  }

  public createClient(serviceRole = true): SupabaseClient {
    const dbConfig = this.databaseConfig;
    const key = serviceRole ? dbConfig.serviceRoleKey : dbConfig.anonKey;

    if (!dbConfig.url || !key) {
      throw new Error('Missing database configuration (URL or authentication key)');
    }

    return createClient(dbConfig.url, key, {
      auth: { persistSession: false },
      db: { schema: 'public' }
    });
  }

  async fetchTaskFromDatabase(taskIdOrName: string, taskId: string | null = null, options?: QueryOptions) {
    return this.crud.fetchTaskFromDatabase(taskIdOrName, taskId, options);
  }

  createTaskRun(taskFunctionId: string) { return this.crud.createTaskRun(taskFunctionId); }
  getTaskRun(taskRunId: string) { return this.crud.getTaskRun(taskRunId); }
  updateTaskRun(taskRunId: string, updates: any) { return this.crud.updateTaskRun(taskRunId, updates); }
  getPendingTaskRuns() { return this.crud.getPendingTaskRuns(); }

  createStackRun(stackRun: any) { return this.crud.createStackRun(stackRun); }
  getStackRun(stackRunId: string) { return this.crud.getStackRun(stackRunId); }
  updateStackRun(stackRunId: string, updates: any) { return this.crud.updateStackRun(stackRunId, updates); }
  getPendingStackRuns() { return this.crud.getPendingStackRuns(); }
  getChildStackRuns(parentStackRunId: string) { return this.crud.getChildStackRuns(parentStackRunId); }

  getKeyValue(key: string) { return this.crud.getKeyValue(key); }
  setKeyValue(key: string, value: any) { return this.crud.setKeyValue(key, value); }
  deleteKey(key: string) { return this.crud.deleteKey(key); }

  getAllTaskFunctions() { return this.crud.getAllTaskFunctions(); }
  saveTaskFunction(taskFunction: any) { return this.crud.saveTaskFunction(taskFunction); }

  async healthCheck(): Promise<{ healthy: boolean; error?: string; performance?: number }> {
    const healthTimerId = perf.start('db.healthCheck');

    try {
      const result = await this.queryExecutor.executeQuery(
        'healthCheck',
        (client) => client.from('task_functions').select('id').limit(1),
        this.createClient.bind(this)
      );

      const duration = perf.end(healthTimerId);

      return {
        healthy: result.success,
        error: result.error?.message,
        performance: duration
      };
    } catch (error) {
      const duration = perf.end(healthTimerId);
      return {
        healthy: false,
        error: error instanceof Error ? error.message : String(error),
        performance: duration
      };
    }
  }

  cleanupConnections(): void { this.poolManager.cleanupConnections(); }
  getPoolStats() { return this.poolManager.getPoolStats(); }
  async close(): Promise<void> { await this.poolManager.close(); }
}

// Export singleton instance
export const database = DatabaseService.getInstance();

// Export convenience functions for backward compatibility
export const fetchTaskFromDatabase = (taskIdOrName: string, taskId?: string | null, options?: QueryOptions) =>
  database.fetchTaskFromDatabase(taskIdOrName, taskId, options);

export const createServiceRoleClient = (): SupabaseClient =>
  database.createClient(true);

export const createAnonClient = (): SupabaseClient =>
  database.createClient(false);

// Export types
export type { TaskRun, StackRun, TaskFunction, KeyStoreEntry, DatabaseResult, QueryOptions, TransactionCallback } from './db-types.ts';