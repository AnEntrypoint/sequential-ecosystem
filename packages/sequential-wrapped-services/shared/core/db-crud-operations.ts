import { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { QueryExecutor } from './db-queries.ts';
import { DatabaseResult, QueryOptions, TaskRun, StackRun, TaskFunction, KeyStoreEntry } from './db-types.ts';

export class CRUDOperations {
  private executor: QueryExecutor;
  private createClient: () => SupabaseClient;

  constructor(executor: QueryExecutor, createClient: () => SupabaseClient) {
    this.executor = executor;
    this.createClient = createClient;
  }

  async fetchTaskFromDatabase(
    taskIdOrName: string,
    taskId: string | null = null,
    options: QueryOptions = {}
  ): Promise<TaskFunction | null> {
    const queryBuilder = (client: SupabaseClient) => {
      let query = client.from('task_functions').select('*');

      if (taskId && this.isUuid(taskId)) {
        query = query.eq('id', taskId);
      } else {
        query = query.eq('name', taskIdOrName);
      }

      return query.limit(1).single();
    };

    const result = await this.executor.executeQuery<TaskFunction>(
      'fetchTaskFromDatabase',
      queryBuilder,
      this.createClient,
      options
    );

    return result.success && result.data ? result.data : null;
  }

  createTaskRun(taskFunctionId: string): Promise<DatabaseResult<TaskRun>> {
    return this.executor.executeQuery(
      'createTaskRun',
      (client) => client.from('task_runs').insert({
        task_function_id: taskFunctionId,
        status: 'pending'
      }).select().single(),
      this.createClient
    );
  }

  getTaskRun(taskRunId: string): Promise<DatabaseResult<TaskRun>> {
    return this.executor.executeQuery(
      'getTaskRun',
      (client) => client.from('task_runs').select('*').eq('id', taskRunId).single(),
      this.createClient
    );
  }

  updateTaskRun(taskRunId: string, updates: Partial<TaskRun>): Promise<DatabaseResult<TaskRun>> {
    return this.executor.executeQuery(
      'updateTaskRun',
      (client) => client.from('task_runs').update(updates).eq('id', taskRunId).select().single(),
      this.createClient
    );
  }

  getPendingTaskRuns(): Promise<DatabaseResult<TaskRun[]>> {
    return this.executor.executeQuery(
      'getPendingTaskRuns',
      (client) => client.from('task_runs').select('*').eq('status', 'pending').order('created_at'),
      this.createClient
    );
  }

  createStackRun(stackRun: Omit<StackRun, 'id' | 'created_at' | 'updated_at'>): Promise<DatabaseResult<StackRun>> {
    return this.executor.executeQuery(
      'createStackRun',
      (client) => client.from('stack_runs').insert(stackRun).select().single(),
      this.createClient
    );
  }

  getStackRun(stackRunId: string): Promise<DatabaseResult<StackRun>> {
    return this.executor.executeQuery(
      'getStackRun',
      (client) => client.from('stack_runs').select('*').eq('id', stackRunId).single(),
      this.createClient
    );
  }

  updateStackRun(stackRunId: string, updates: Partial<StackRun>): Promise<DatabaseResult<StackRun>> {
    return this.executor.executeQuery(
      'updateStackRun',
      (client) => client.from('stack_runs').update(updates).eq('id', stackRunId).select().single(),
      this.createClient
    );
  }

  getPendingStackRuns(): Promise<DatabaseResult<StackRun[]>> {
    return this.executor.executeQuery(
      'getPendingStackRuns',
      (client) => client.from('stack_runs').select('*').eq('status', 'pending').order('created_at'),
      this.createClient
    );
  }

  getChildStackRuns(parentStackRunId: string): Promise<DatabaseResult<StackRun[]>> {
    return this.executor.executeQuery(
      'getChildStackRuns',
      (client) => client.from('stack_runs').select('*').eq('parent_stack_run_id', parentStackRunId).order('created_at'),
      this.createClient
    );
  }

  getKeyValue(key: string): Promise<DatabaseResult<KeyStoreEntry>> {
    return this.executor.executeQuery(
      'getKeyValue',
      (client) => client.from('keystore').select('*').eq('key', key).single(),
      this.createClient
    );
  }

  setKeyValue(key: string, value: any): Promise<DatabaseResult<KeyStoreEntry>> {
    return this.executor.executeQuery(
      'setKeyValue',
      (client) => client.from('keystore').upsert({ key, value }).select().single(),
      this.createClient
    );
  }

  deleteKey(key: string): Promise<DatabaseResult<void>> {
    return this.executor.executeQuery(
      'deleteKey',
      (client) => client.from('keystore').delete().eq('key', key),
      this.createClient
    );
  }

  getAllTaskFunctions(): Promise<DatabaseResult<TaskFunction[]>> {
    return this.executor.executeQuery(
      'getAllTaskFunctions',
      (client) => client.from('task_functions').select('*').order('name'),
      this.createClient
    );
  }

  saveTaskFunction(taskFunction: Omit<TaskFunction, 'id' | 'created_at' | 'updated_at'>): Promise<DatabaseResult<TaskFunction>> {
    return this.executor.executeQuery(
      'saveTaskFunction',
      (client) => client.from('task_functions').upsert(taskFunction).select().single(),
      this.createClient
    );
  }

  private isUuid(str: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(str);
  }
}
