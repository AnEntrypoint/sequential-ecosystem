import { nowISO } from '@sequential/sequential-utils/timestamps';
import { SUPABASE_URL, SERVICE_ROLE_KEY, log, createSupabaseClient } from './utils.ts';
import { updateStackRunStatus } from './db-operations.ts';

export async function processServiceCall(stackRun: any) {
  const { service_name, method_name, args, vm_state } = stackRun;

  log("info", `Processing service call: ${service_name}.${method_name}`);

  try {
    let response;

    if (service_name === 'deno-executor' && method_name === 'execute') {
      const requestBody = {
        taskName: args?.taskName || vm_state?.taskName || 'unknown-task',
        taskCode: args?.taskCode || vm_state?.taskCode,
        taskRunId: stackRun.parent_task_run_id,
        stackRunId: stackRun.id,
        taskInput: args?.taskInput || vm_state?.taskInput || {}
      };

      const denoResponse = await fetch(`${SUPABASE_URL}/functions/v1/deno-executor`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      if (!denoResponse.ok) {
        throw new Error(`Deno-executor call failed: ${denoResponse.status}`);
      }

      response = await denoResponse.json();
    } else if (service_name === 'tasks' && method_name === 'execute') {
      const requestBody = {
        taskName: args[0],
        input: args[1]
      };

      const tasksResponse = await fetch(`${SUPABASE_URL}/functions/v1/tasks/execute`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      if (!tasksResponse.ok) {
        throw new Error(`Tasks call failed: ${tasksResponse.status}`);
      }

      response = await tasksResponse.json();
    } else {
      let requestBody: any;

      if (service_name === 'wrappedgapi') {
        const methodParts = method_name.split('.');
        const chain = methodParts.map((part, index) => {
          if (index === methodParts.length - 1) {
            return { property: part, args: args || [] };
          } else {
            return { property: part };
          }
        });
        requestBody = { chain };
      } else {
        requestBody = {
          method: method_name,
          args: args
        };
      }

      const wrappedResponse = await fetch(`${SUPABASE_URL}/functions/v1/${service_name}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      if (!wrappedResponse.ok) {
        throw new Error(`${service_name} call failed: ${wrappedResponse.status}`);
      }

      response = await wrappedResponse.json();
    }

    if (response.error) {
      throw new Error(`Service call failed: ${response.error}`);
    }

    const result = response.data || response;
    log("info", `Service call ${service_name}.${method_name} completed successfully`);

    const suspensionData = result?.result || result;
    if (suspensionData && suspensionData.__hostCallSuspended === true) {
      log("info", `Task suspended for external call, child stack run: ${suspensionData.stackRunId}`);

      await updateStackRunStatus(stackRun.id, 'suspended_waiting_child');

      const supabase = await createSupabaseClient();
      const { error: updateError } = await supabase
        .from('stack_runs')
        .update({
          waiting_on_stack_run_id: suspensionData.stackRunId,
          updated_at: nowISO()
        })
        .eq('id', stackRun.id);

      if (updateError) {
        log("error", `Failed to update waiting_on_stack_run_id: ${updateError.message}`);
      } else {
        log("info", `Updated stack run ${stackRun.id} to wait for child ${suspensionData.stackRunId}`);
      }

      throw new Error(`SUSPENDED_WAITING_FOR_CHILD:${suspensionData.stackRunId}`);
    }

    if (result && result.status === 'paused' && result.suspensionData) {
      log("info", `FlowState task suspended for external call, child stack run: ${result.suspensionData.stackRunId}`);

      await updateStackRunStatus(stackRun.id, 'suspended_waiting_child');

      const supabase = await createSupabaseClient();
      const { error: updateError } = await supabase
        .from('stack_runs')
        .update({
          waiting_on_stack_run_id: result.suspensionData.stackRunId,
          updated_at: nowISO()
        })
        .eq('id', stackRun.id);

      if (updateError) {
        log("error", `Failed to update waiting_on_stack_run_id for FlowState: ${updateError.message}`);
      } else {
        log("info", `Updated FlowState stack run ${stackRun.id} to wait for child ${result.suspensionData.stackRunId}`);
      }

      throw new Error(`SUSPENDED_WAITING_FOR_CHILD:${result.suspensionData.stackRunId}`);
    }

    return result;

  } catch (error) {
    log("error", `Service call ${service_name}.${method_name} failed: ${error instanceof Error ? error.message : String(error)}`);
    throw error;
  }
}
