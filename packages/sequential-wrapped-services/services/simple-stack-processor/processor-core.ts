import { nowISO } from '@sequentialos/sequential-utils/timestamps';
import { log, createSupabaseClient, triggerStackProcessorAsync } from './utils.ts';
import { tryLockTaskChain, unlockTaskChain, getStackRun, updateStackRunStatus, isTaskChainBusy, getNextPendingStackRun } from './db-operations.ts';
import { processServiceCall } from './service-calls.ts';
import { resumeParentTask } from './task-resumption.ts';

export async function processStackRunInternal(stackRunId: number): Promise<boolean> {
  log("info", `Processing stack run: ${stackRunId}`);

  try {
    const stackRun = await getStackRun(stackRunId);

    if (stackRun.status !== 'pending') {
      log("info", `Stack run ${stackRunId} is not pending (status: ${stackRun.status}), skipping`);
      return false;
    }

    const taskRunId = stackRun.parent_task_run_id;

    const isBusy = await isTaskChainBusy(taskRunId);
    if (isBusy) {
      log("info", `Task chain ${taskRunId} is already busy, skipping stack run ${stackRunId}`);
      return false;
    }

    let lockAcquired = false;
    let bypassedLock = false;

    if (stackRun.parent_stack_run_id) {
      const supabase = await createSupabaseClient();
      const { data: parentData, error: parentError } = await supabase
        .from('stack_runs')
        .select('status, waiting_on_stack_run_id')
        .eq('id', stackRun.parent_stack_run_id)
        .single();

      const parentStackRun = !parentError && parentData ? parentData : null;

      if (parentStackRun) {
        const canProcess =
          (parentStackRun.status === 'suspended_waiting_child' && parentStackRun.waiting_on_stack_run_id === stackRunId) ||
          (parentStackRun.status === 'completed') ||
          (parentStackRun.waiting_on_stack_run_id && parentStackRun.waiting_on_stack_run_id !== stackRunId);

        if (canProcess) {
          log("info", `Allowing child stack run ${stackRunId} to process (parent status: ${parentStackRun.status}, waiting for: ${parentStackRun.waiting_on_stack_run_id})`);
          lockAcquired = true;
          bypassedLock = true;
        } else {
          lockAcquired = await tryLockTaskChain(taskRunId);
        }
      } else {
        lockAcquired = await tryLockTaskChain(taskRunId);
      }
    } else {
      lockAcquired = await tryLockTaskChain(taskRunId);
    }

    if (!lockAcquired) {
      log("info", `Could not acquire lock for task chain ${taskRunId}, skipping stack run ${stackRunId}`);
      return false;
    }

    try {
      await updateStackRunStatus(stackRunId, 'processing');

      const result = await processServiceCall(stackRun);

      await updateStackRunStatus(stackRunId, 'completed', result);

      await resumeParentTask(stackRun, result);

      if (!stackRun.parent_stack_run_id && stackRun.parent_task_run_id) {
        const supabase = await createSupabaseClient();
        await supabase
          .from('task_runs')
          .update({
            status: 'completed',
            result: result,
            ended_at: nowISO()
          })
          .eq('id', stackRun.parent_task_run_id);
        log("info", `Updated parent task run ${stackRun.parent_task_run_id} to completed`);
      }

      log("info", `Stack run ${stackRunId} completed successfully`);

      return true;

    } catch (error) {
      if (error instanceof Error && error.message.startsWith('SUSPENDED_WAITING_FOR_CHILD:')) {
        const childStackRunId = error.message.substring('SUSPENDED_WAITING_FOR_CHILD:'.length);
        log("info", `Stack run ${stackRunId} suspended, waiting for child ${childStackRunId}`);
        return true;
      }

      if (!bypassedLock) {
        await unlockTaskChain(taskRunId);
      }
      log("error", `Stack run ${stackRunId} failed: ${error instanceof Error ? error.message : String(error)}`);
      await updateStackRunStatus(stackRunId, 'failed', null, error instanceof Error ? error.message : String(error));
      return false;
    } finally {
      if (!bypassedLock) {
        const supabase = await createSupabaseClient();
        const { data: currentData, error: currentError } = await supabase
          .from('stack_runs')
          .select('status')
          .eq('id', stackRunId)
          .single();

        const currentStackRun = !currentError && currentData ? currentData : null;

        if (currentStackRun && currentStackRun.status !== 'suspended_waiting_child') {
          await unlockTaskChain(taskRunId);
        }
      }
    }

  } catch (error) {
    log("error", `Stack run ${stackRunId} processing failed: ${error instanceof Error ? error.message : String(error)}`);
    await updateStackRunStatus(stackRunId, 'failed', null, error instanceof Error ? error.message : String(error));
    return false;
  }
}

export async function processSingleStackRun(): Promise<{ processed: boolean; reason?: string; stackRunId?: number }> {
  log("info", "Processing single stack run");

  const nextStackRun = await getNextPendingStackRun();

  if (!nextStackRun) {
    log("info", "No pending stack runs to process");
    return { processed: false, reason: "no_pending" };
  }

  log("info", `Processing next stack run ${nextStackRun.id} in serial order`);

  const success = await processStackRunInternal(nextStackRun.id);

  if (success) {
    log("info", `Stack run ${nextStackRun.id} processed successfully`);

    triggerStackProcessorAsync();

    return { processed: true, stackRunId: nextStackRun.id };
  } else {
    log("warn", `Failed to process stack run ${nextStackRun.id}`);
    return { processed: false, reason: "processing_failed", stackRunId: nextStackRun.id };
  }
}

export async function processStackRun(stackRunId: number): Promise<void> {
  log("info", `Processing stack run ${stackRunId} with database coordination`);
  await processStackRunInternal(stackRunId);
}
