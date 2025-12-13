import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { hostLog, corsHeaders } from './utilities.ts';
import { serviceRegistry } from './service-registry.ts';
import { executeTask, extractSuspensionDataFromError } from './sandbox.ts';

async function handleExecuteRequest(req: Request): Promise<Response> {
  const logPrefix = 'DenoExecutor-HandleExecute';

  try {
    if (req.method === 'GET') {
      return new Response(JSON.stringify({
        status: 'healthy',
        service: 'Deno Task Executor',
        version: '1.0.0',
        serviceRegistry: 'minimal'
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const requestData = await req.json();
    const { taskCode, taskName, taskInput, taskRunId, stackRunId, toolNames, initialVmState } = requestData;

    hostLog(logPrefix, 'info', `Received request data: ${JSON.stringify({ taskName, taskRunId, stackRunId })}`);

    if (!taskCode || !taskName) {
      return new Response(JSON.stringify({
        error: 'Missing taskCode or taskName'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const result = await executeTask(taskCode, taskName, taskInput, taskRunId, stackRunId, toolNames, initialVmState);

    return new Response(JSON.stringify({
      status: 'completed',
      result: result
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    hostLog(logPrefix, 'error', `Error in handleExecuteRequest: ${errorMsg}`);

    return new Response(JSON.stringify({
      error: errorMsg
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

async function handleResumeRequest(req: Request): Promise<Response> {
  const logPrefix = 'DenoExecutor-Resume';

  try {
    const requestData = await req.json();
    const stackRunId = requestData.stackRunId || requestData.stackRunIdToResume;
    const result = requestData.result || requestData.resultToInject;

    const resultPreview = result ? JSON.stringify(result).substring(0, 100) : 'undefined';
    hostLog(logPrefix, 'info', `Resuming stack run ${stackRunId} with result: ${resultPreview}`);

    const stackRunResult = await serviceRegistry.call('database', 'processChain', [{
      chain: [
        { property: 'from', args: ['stack_runs'] },
        { property: 'select', args: [] },
        { property: 'eq', args: ['id', parseInt(stackRunId)] },
        { property: 'single', args: [] }
      ]
    }]);

    const innerServiceResponse = stackRunResult.data;
    const hasInnerError = innerServiceResponse && typeof innerServiceResponse === 'object' &&
                         'success' in innerServiceResponse && innerServiceResponse.success === false;

    const stackRun = stackRunResult.data?.data?.data || stackRunResult.data?.data || stackRunResult.data;

    if (!stackRunResult.success || hasInnerError || !stackRun) {
      const errorMessage = hasInnerError && innerServiceResponse.error ?
        (typeof innerServiceResponse.error === 'string' ? innerServiceResponse.error : innerServiceResponse.error.message) :
        'Unknown error';

      hostLog(logPrefix, 'error', `Stack run query failed:`, {
        httpSuccess: stackRunResult.success,
        innerSuccess: innerServiceResponse?.success,
        innerError: innerServiceResponse?.error,
        errorMessage,
        stackRun,
        fullResult: JSON.stringify(stackRunResult).substring(0, 500)
      });
      throw new Error(`Stack run ${stackRunId} not found: ${errorMessage}`);
    }

    const taskRunResult = await serviceRegistry.call('database', 'processChain', [{
      chain: [
        { property: 'from', args: ['task_runs'] },
        { property: 'select', args: [] },
        { property: 'eq', args: ['id', stackRun.parent_task_run_id] },
        { property: 'single', args: [] }
      ]
    }]);

    const innerTaskRunResponse = taskRunResult.data;
    const hasTaskRunError = innerTaskRunResponse && typeof innerTaskRunResponse === 'object' &&
                           'success' in innerTaskRunResponse && innerTaskRunResponse.success === false;

    const taskRun = taskRunResult.data?.data?.data || taskRunResult.data?.data || taskRunResult.data;

    if (!taskRunResult.success || hasTaskRunError || !taskRun) {
      const errorMessage = hasTaskRunError && innerTaskRunResponse.error ?
        (typeof innerTaskRunResponse.error === 'string' ? innerTaskRunResponse.error : innerTaskRunResponse.error.message) :
        'Unknown error';

      hostLog(logPrefix, 'error', `Task run query failed:`, {
        httpSuccess: taskRunResult.success,
        innerSuccess: innerTaskRunResponse?.success,
        innerError: innerTaskRunResponse?.error,
        errorMessage
      });
      throw new Error(`Task run ${stackRun.parent_task_run_id} not found: ${errorMessage}`);
    }

    const taskFunctionResult = await serviceRegistry.call('database', 'processChain', [{
      chain: [
        { property: 'from', args: ['task_functions'] },
        { property: 'select', args: [] },
        { property: 'eq', args: ['name', taskRun.task_name] },
        { property: 'single', args: [] }
      ]
    }]);

    const innerTaskFunctionResponse = taskFunctionResult.data;
    const hasTaskFunctionError = innerTaskFunctionResponse && typeof innerTaskFunctionResponse === 'object' &&
                                 'success' in innerTaskFunctionResponse && innerTaskFunctionResponse.success === false;

    const taskFunction = taskFunctionResult.data?.data?.data || taskFunctionResult.data?.data || taskFunctionResult.data;

    if (!taskFunctionResult.success || hasTaskFunctionError || !taskFunction) {
      const errorMessage = hasTaskFunctionError && innerTaskFunctionResponse.error ?
        (typeof innerTaskFunctionResponse.error === 'string' ? innerTaskFunctionResponse.error : innerTaskFunctionResponse.error.message) :
        'Unknown error';

      hostLog(logPrefix, 'error', `Task function query failed:`, {
        httpSuccess: taskFunctionResult.success,
        innerSuccess: innerTaskFunctionResponse?.success,
        innerError: innerTaskFunctionResponse?.error,
        errorMessage
      });
      throw new Error(`Task function ${taskRun.task_name} not found: ${errorMessage}`);
    }

    const taskResult = await executeTask(
      taskFunction.code,
      taskRun.task_name,
      taskRun.input,
      stackRun.parent_task_run_id.toString(),
      stackRunId.toString(),
      ['gapi', 'keystore', 'database'],
      {
        taskCode: taskFunction.code,
        taskName: taskRun.task_name,
        taskInput: taskRun.input,
        toolNames: ['gapi', 'keystore', 'database'],
        resume_payload: result
      }
    );

    if (taskResult && taskResult.__hostCallSuspended === true) {
      hostLog(logPrefix, 'info', `Task suspended again during resume, child stack run: ${taskResult.stackRunId}`);

      return new Response(JSON.stringify({
        status: 'paused',
        suspensionData: taskResult
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    hostLog(logPrefix, 'info', `Task resumed and completed successfully`);

    return new Response(JSON.stringify({
      status: 'completed',
      result: taskResult
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    hostLog(logPrefix, 'error', `Task resume failed: ${error instanceof Error ? error.message : String(error)}`);

    if (error instanceof Error && error.message.includes('TASK_SUSPENDED')) {
      // Note: stackRun would be undefined here in error path, so we skip suspension data extraction
      return new Response(JSON.stringify({
        status: 'error',
        error: error.message
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({
      status: 'error',
      error: error instanceof Error ? error.message : String(error)
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

serve(async (req: Request) => {
  try {
    if (req.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    const url = new URL(req.url);
    const path = url.pathname.split('/').pop();

    if (path === 'resume') {
      return handleResumeRequest(req);
    } else {
      return handleExecuteRequest(req);
    }
  } catch (error) {
    hostLog('DenoExecutorHandler', 'error', `Error in serve function: ${error instanceof Error ? error.message : String(error)}`);

    return new Response(JSON.stringify({
      error: error instanceof Error ? error.message : String(error)
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
});

console.log('🚀 Deno Task Executor with Unified Service Registry started successfully');
