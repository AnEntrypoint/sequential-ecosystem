import { nowISO } from '@sequential/sequential-utils/timestamps';
import { SUPABASE_URL, SERVICE_ROLE_KEY, log, createSupabaseClient, triggerStackProcessorAsync } from './utils.ts';
import { updateStackRunStatus } from './db-operations.ts';

export async function resumeParentTask(stackRun: any, result: any) {
  if (!stackRun.parent_stack_run_id) {
    log("info", `Stack run ${stackRun.id} has no parent to resume`);
    return;
  }

  const supabase = await createSupabaseClient();
  const { data: parentData, error: parentError } = await supabase
    .from('stack_runs')
    .select('*')
    .eq('id', stackRun.parent_stack_run_id)
    .single();

  if (parentError || !parentData) {
    log("error", `Failed to get parent stack run ${stackRun.parent_stack_run_id}: ${parentError?.message}`);
    return;
  }

  const parentStackRun = parentData;

  if (parentStackRun.status !== 'suspended_waiting_child') {
    log("info", `Parent stack run ${stackRun.parent_stack_run_id} is not suspended_waiting_child (status: ${parentStackRun.status}), not resuming`);
    return;
  }

  if (parentStackRun.waiting_on_stack_run_id !== stackRun.id) {
    log("info", `Parent stack run ${stackRun.parent_stack_run_id} is waiting for stack run ${parentStackRun.waiting_on_stack_run_id}, not ${stackRun.id}, not resuming`);
    return;
  }

  log("info", `Resuming parent task ${stackRun.parent_stack_run_id} with result from expected child ${stackRun.id}`);

  try {
    let formattedResult = result;

    if (stackRun.service_name === 'wrappedgapi') {
      if (stackRun.method_name === 'admin.domains.list' && result && !result.domains && Array.isArray(result)) {
        formattedResult = { domains: result };
        log("info", `Wrapped domains array in expected structure for task code`);
      } else if (stackRun.method_name === 'admin.users.list' && result && !result.users && Array.isArray(result)) {
        formattedResult = { users: result };
        log("info", `Wrapped users array in expected structure for task code`);
      }
    }

    await updateStackRunStatus(stackRun.parent_stack_run_id, 'pending_resume');

    const { error: payloadError } = await supabase
      .from('stack_runs')
      .update({
        resume_payload: formattedResult,
        updated_at: nowISO()
      })
      .eq('id', stackRun.parent_stack_run_id);

    if (payloadError) throw new Error(`Failed to set resume payload: ${payloadError.message}`);

    const resumeResponse = await fetch(`${SUPABASE_URL}/functions/v1/deno-executor/resume`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        stackRunId: stackRun.parent_stack_run_id,
        result: formattedResult
      })
    });

    if (!resumeResponse.ok) {
      throw new Error(`Failed to resume parent: ${resumeResponse.status}`);
    }

    const resumeResult = await resumeResponse.json();
    if (resumeResult.error) {
      throw new Error(`Failed to resume parent: ${resumeResult.error}`);
    }

    log("info", `Parent task ${stackRun.parent_stack_run_id} resumed successfully`);
    log("debug", `Resume result structure: ${JSON.stringify(resumeResult).substring(0, 500)}`);

    if (resumeResult.data && resumeResult.data.status === 'completed') {
      await updateStackRunStatus(stackRun.parent_stack_run_id, 'completed', resumeResult.data.result);
    } else if (resumeResult.data && resumeResult.data.status === 'error') {
      await updateStackRunStatus(stackRun.parent_stack_run_id, 'failed', null, resumeResult.data.error);
    } else if (resumeResult.data && resumeResult.data.status === 'paused') {
      log("info", `Parent task ${stackRun.parent_stack_run_id} paused again (multi-step execution)`);
    } else if (resumeResult.status === 'suspended' || (resumeResult.data && resumeResult.data.childStackRunId)) {
      log("info", `Parent task ${stackRun.parent_stack_run_id} suspended again on resume`);
    } else {
      log("warn", `Unknown resume result for parent task ${stackRun.parent_stack_run_id}`);
      log("info", `Leaving parent task ${stackRun.parent_stack_run_id} status unchanged`);
    }

    if ((resumeResult.status === 'paused' || resumeResult.suspensionData) ||
        (resumeResult.data && (resumeResult.data.status === 'paused' || resumeResult.data.suspensionData))) {
      log("info", `Parent suspended again after resume - triggering next processing cycle`);
      triggerStackProcessorAsync();
    }

  } catch (error) {
    log("error", `Failed to resume parent task: ${error instanceof Error ? error.message : String(error)}`);
    await updateStackRunStatus(stackRun.parent_stack_run_id, 'failed', null, `Resume failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}
