import { hostLog, SerializedVMState, SUPABASE_URL, SERVICE_ROLE_KEY } from './utilities.ts';
import { serviceRegistry } from './service-registry.ts';
import { nowISO } from '@sequential/sequential-utils/timestamps';

export async function makeExternalCall(
  serviceName: string,
  methodPath: string[],
  args: any[],
  taskRunId: string,
  stackRunId: string
): Promise<any> {
  const logPrefix = `DenoExecutor-${taskRunId}`;

  hostLog(logPrefix, 'info', `External call requested: ${serviceName}.${methodPath.join('.')} - creating child stack run`);

  const serviceMap: Record<string, string> = {
    'database': 'wrappedsupabase',
    'keystore': 'wrappedkeystore',
    'openai': 'wrappedopenai',
    'websearch': 'wrappedwebsearch',
    'gapi': 'wrappedgapi'
  };

  const actualServiceName = serviceMap[serviceName] || serviceName;

  const insertResult = await fetch(`${SUPABASE_URL}/functions/v1/wrappedsupabase`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      chain: [
        { property: 'from', args: ['stack_runs'] },
        { property: 'insert', args: [[{
          parent_task_run_id: parseInt(taskRunId),
          parent_stack_run_id: parseInt(stackRunId),
          service_name: actualServiceName,
          method_name: methodPath.join('.'),
          args: args,
          status: 'pending',
          vm_state: null,
          waiting_on_stack_run_id: null,
          resume_payload: null
        }]] },
        { property: 'select', args: [] }
      ]
    })
  }).then(r => r.json());

  if (!insertResult.success || !insertResult.data) {
    throw new Error(`Failed to save stack run via service registry: ${insertResult.error || 'Unknown error'}`);
  }

  hostLog(logPrefix, 'info', `Insert result: ${JSON.stringify(insertResult)}`);

  let insertedRecords = insertResult.data?.data?.data || insertResult.data?.data || insertResult.data;

  hostLog(logPrefix, 'info', `Inserted records: ${JSON.stringify(insertedRecords)}`);

  if (!insertedRecords || !Array.isArray(insertedRecords) || insertedRecords.length === 0) {
    throw new Error(`Failed to get inserted stack run from service registry response. insertResult structure: ${JSON.stringify(insertResult)}`);
  }

  const actualChildStackRunId = insertedRecords[0]?.id;

  if (!actualChildStackRunId) {
    throw new Error('Failed to get child stack run ID from inserted record');
  }

  hostLog(logPrefix, 'info', `Created child stack run ${actualChildStackRunId} for ${serviceName}.${methodPath.join('.')}`);

  const updateResult = await fetch(`${SUPABASE_URL}/functions/v1/wrappedsupabase`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      chain: [
        { property: 'from', args: ['stack_runs'] },
        { property: 'update', args: [{
          status: 'suspended_waiting_child',
          waiting_on_stack_run_id: actualChildStackRunId,
          updated_at: nowISO()
        }] },
        { property: 'eq', args: ['id', parseInt(stackRunId)] }
      ]
    })
  }).then(r => r.json());

  if (!updateResult.success || !updateResult.data) {
    throw new Error(`Failed to update stack run status: ${updateResult.error || 'Unknown error'}`);
  }

  hostLog(logPrefix, 'info', `Updated stack run ${stackRunId} to suspended_waiting_child, waiting on ${actualChildStackRunId}`);

  const suspensionData = {
    __hostCallSuspended: true,
    serviceName,
    methodPath,
    args,
    taskRunId,
    stackRunId: actualChildStackRunId
  };

  const suspensionError = new Error(`TASK_SUSPENDED`);
  (suspensionError as any).suspensionData = suspensionData;
  throw suspensionError;
}

export class SecureSandbox {
  private taskRunId: string;
  private stackRunId: string;
  private taskName: string;
  private logPrefix: string;

  constructor(taskRunId: string, stackRunId: string, taskName: string) {
    this.taskRunId = taskRunId;
    this.stackRunId = stackRunId;
    this.taskName = taskName;
    this.logPrefix = `Sandbox-${taskName}`;
  }

  async execute(taskCode: string, taskInput: any, initialVmState?: SerializedVMState, taskGlobal?: any): Promise<any> {
    hostLog(this.logPrefix, 'info', `Executing task in secure sandbox`);

    try {
      if (!taskGlobal) {
        taskGlobal = this.createTaskGlobal();
      }

      if (initialVmState?.resume_payload) {
        taskGlobal._resume_payload = initialVmState.resume_payload;
        hostLog(this.logPrefix, 'info', `Resume payload available for task execution`);
      }

      taskGlobal.__callHostTool__ = async function(serviceName: string, methodPath: string | string[], args: any[]) {
        const methodArray = Array.isArray(methodPath) ? methodPath : [methodPath];
        return await makeExternalCall(serviceName, methodArray, args, taskGlobal._taskRunId, taskGlobal._stackRunId);
      };

      const taskFunction = this.compileTaskCode(taskCode, taskGlobal);

      const result = await taskFunction(taskInput);

      hostLog(this.logPrefix, 'info', `Task execution completed successfully`);
      return result;

    } catch (error) {
      hostLog(this.logPrefix, 'error', `Task execution failed: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  private createTaskGlobal(): any {
    return {
      console: {
        log: (...args: any[]) => {
          const message = args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : String(arg)).join(' ');
          hostLog(this.logPrefix, 'info', message);
        },
        error: (...args: any[]) => {
          const message = args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : String(arg)).join(' ');
          hostLog(this.logPrefix, 'error', message);
        },
        warn: (...args: any[]) => {
          const message = args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : String(arg)).join(' ');
          hostLog(this.logPrefix, 'warn', message);
        }
      },
      _hostLog: (level: string, message: string) => {
        hostLog(this.logPrefix, level as any, message);
      },
      _taskRunId: this.taskRunId,
      _stackRunId: this.stackRunId,
      _resume_payload: undefined,
      Object,
      Array,
      String,
      Number,
      Boolean,
      Date,
      Math,
      JSON,
      RegExp,
      Promise,
      setTimeout,
      clearTimeout,
      setInterval,
      clearInterval,
      crypto: {
        randomUUID: () => crypto.randomUUID()
      },
      module: { exports: {} },
      exports: {}
    };
  }

  private compileTaskCode(taskCode: string, taskGlobal: any): (input: any) => Promise<any> {
    try {
      hostLog(this.logPrefix, 'info', `Compiling task code...`);

      taskGlobal.module = { exports: {} };
      taskGlobal.exports = taskGlobal.module.exports;

      hostLog(this.logPrefix, 'info', `Evaluating task code to set up module.exports...`);

      const executeTaskCode = new Function(
        'module',
        'exports',
        'console',
        '__callHostTool__',
        `
        try {
          ${taskCode}
          return module.exports;
        } catch (error) {
          console.error('Task code execution error:', error);
          throw error;
        }
      `);

      const moduleExports = executeTaskCode(
        taskGlobal.module,
        taskGlobal.exports,
        taskGlobal.console,
        taskGlobal.__callHostTool__
      );
      hostLog(this.logPrefix, 'info', `Task code executed, module.exports type: ${typeof moduleExports}`);

      let taskHandler = moduleExports;

      if (typeof taskHandler !== 'function') {
        if (typeof moduleExports === 'object' && moduleExports !== null) {
          const functionNames = Object.keys(moduleExports);
          for (const name of functionNames) {
            if (typeof moduleExports[name] === 'function') {
              taskHandler = moduleExports[name];
              hostLog(this.logPrefix, 'info', `Found function '${name}' in module.exports`);
              break;
            }
          }
        }
      }

      if (typeof taskHandler !== 'function') {
        const globalFunctionNames = Object.keys(taskGlobal);
        for (const name of globalFunctionNames) {
          if (name !== 'module' && name !== 'exports' && typeof taskGlobal[name] === 'function') {
            taskHandler = taskGlobal[name];
            hostLog(this.logPrefix, 'info', `Found function '${name}' in global scope`);
            break;
          }
        }
      }

      if (typeof taskHandler !== 'function') {
        throw new Error(`No valid function found in task code. Module exports type: ${typeof moduleExports}, Available functions: ${Object.keys(taskGlobal).filter(k => typeof taskGlobal[k] === 'function').join(', ')}`);
      }

      hostLog(this.logPrefix, 'info', `Task handler extracted successfully: ${typeof taskHandler}`);
      return taskHandler;
    } catch (error) {
      hostLog(this.logPrefix, 'error', `Failed to compile task code: ${error instanceof Error ? error.message : String(error)}`);
      hostLog(this.logPrefix, 'error', `Task code preview: ${taskCode.substring(0, 200)}...`);
      throw error;
    }
  }
}

export function createSecureSandbox(taskRunId: string, stackRunId: string, taskName: string): SecureSandbox {
  return new SecureSandbox(taskRunId, stackRunId, taskName);
}

export async function extractSuspensionDataFromError(error: Error, taskRunId: string, stackRunId: string): Promise<any> {
  const logPrefix = `SuspensionExtractor-${taskRunId}`;

  try {
    hostLog(logPrefix, 'info', `Extracting suspension data from error: ${error.message}`);

    if ((error as any).suspensionData) {
      hostLog(logPrefix, 'info', `Found suspension data attached to error`);
      return (error as any).suspensionData;
    }

    const errorMatch = error.message.match(/TASK_SUSPENDED: External call to (\w+)\.([^ ]+) needs suspension/);
    if (!errorMatch) {
      throw new Error('Invalid suspension error format');
    }

    const serviceName = errorMatch[1];
    const methodPath = errorMatch[2].split('.');

    hostLog(logPrefix, 'info', `Parsed external call: ${serviceName}.${methodPath.join('.')}`);

    const suspensionData = await makeExternalCall(serviceName, methodPath, [], taskRunId, stackRunId);

    return suspensionData;

  } catch (extractError) {
    hostLog(logPrefix, 'error', `Failed to extract suspension data: ${extractError instanceof Error ? extractError.message : String(extractError)}`);
    throw extractError;
  }
}

export async function executeTask(
  taskCode: string,
  taskName: string,
  taskInput: any,
  taskRunId: string,
  stackRunId: string,
  toolNames?: string[],
  initialVmState?: SerializedVMState
): Promise<any> {
  const logPrefix = `FlowStateExecutor-${taskName}`;

  try {
    const startTime = Date.now();
    hostLog(logPrefix, 'info', `Executing HTTP-based FlowState task: ${taskName}`);

    if (typeof Deno !== 'undefined' && Deno.memoryUsage) {
      const memUsage = Deno.memoryUsage();
      hostLog(logPrefix, 'info', `Memory usage: ${Math.round(memUsage.rss / 1024 / 1024)}MB RSS, ${Math.round(memUsage.heapUsed / 1024 / 1024)}MB heap`);
    }

    const sandbox = createSecureSandbox(taskRunId, stackRunId, taskName);

    const result = await sandbox.execute(taskCode, taskInput, initialVmState);

    hostLog(logPrefix, 'info', `HTTP-based FlowState execution completed`);

    if (typeof Deno !== 'undefined' && Deno.memoryUsage) {
      const memUsage = Deno.memoryUsage();
      hostLog(logPrefix, 'info', `Final memory usage: ${Math.round(memUsage.rss / 1024 / 1024)}MB RSS, ${Math.round(memUsage.heapUsed / 1024 / 1024)}MB heap`);
    }

    return result;

  } catch (error) {
    hostLog(logPrefix, 'error', `HTTP-based FlowState execution failed: ${error instanceof Error ? error.message : String(error)}`);

    if (error instanceof Error && error.message.includes('TASK_SUSPENDED')) {
      const suspensionData = await extractSuspensionDataFromError(error, taskRunId, stackRunId);
      return suspensionData;
    }

    throw error;
  }
}
