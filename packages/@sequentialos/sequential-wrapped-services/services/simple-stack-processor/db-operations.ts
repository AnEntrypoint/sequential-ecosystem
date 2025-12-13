import { nowISO } from '@sequentialos/sequential-utils/timestamps';
import { createSupabaseClient, SUPABASE_URL, SERVICE_ROLE_KEY, log } from './utils.ts';

export async function tryLockTaskChain(taskRunId: number, retries: number = 3): Promise<boolean> {
  const supabase = await createSupabaseClient();

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const { data, error } = await supabase
        .from('task_locks')
        .insert({
          task_run_id: taskRunId,
          locked_at: nowISO(),
          locked_by: `simple-stack-processor-${Date.now()}-${Math.random()}`
        })
        .select()
        .single();

      if (error) {
        if (attempt < retries) {
          await new Promise(resolve => setTimeout(resolve, 100 * attempt));
          continue;
        }
        return false;
      }

      log("info", `Successfully locked task chain ${taskRunId} on attempt ${attempt}`);
      return true;
    } catch (error) {
      log("error", `Failed to lock task chain ${taskRunId} on attempt ${attempt}: ${error instanceof Error ? error.message : String(error)}`);
      if (attempt < retries) {
        await new Promise(resolve => setTimeout(resolve, 100 * attempt));
        continue;
      }
      return false;
    }
  }
  return false;
}

export async function unlockTaskChain(taskRunId: number): Promise<void> {
  try {
    const supabase = await createSupabaseClient();
    const { error } = await supabase
      .from('task_locks')
      .delete()
      .eq('task_run_id', taskRunId);

    if (error) {
      log("error", `Failed to unlock task chain ${taskRunId}: ${error.message}`);
    } else {
      log("info", `Successfully unlocked task chain ${taskRunId}`);
    }
  } catch (error) {
    log("error", `Failed to unlock task chain ${taskRunId}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export async function getStackRun(id: number) {
  const supabase = await createSupabaseClient();
  const { data, error } = await supabase
    .from('stack_runs')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw new Error(`Failed to get stack run ${id}: ${error.message}`);
  return data;
}

export async function updateStackRunStatus(id: number, status: string, result?: any, error?: string) {
  const supabase = await createSupabaseClient();
  const updates: any = { status, updated_at: nowISO() };

  if (result !== undefined) updates.result = result;
  if (error !== undefined) updates.error = error;
  if (status === 'completed' || status === 'failed') updates.ended_at = nowISO();

  const { data, error: updateError } = await supabase
    .from('stack_runs')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (updateError) throw new Error(`Failed to update stack run ${id}: ${updateError.message}`);
}

export async function isTaskChainBusy(taskRunId: number): Promise<boolean> {
  try {
    const supabase = await createSupabaseClient();
    const { data, error } = await supabase
      .from('stack_runs')
      .select('id')
      .eq('parent_task_run_id', taskRunId)
      .eq('status', 'processing')
      .limit(1);

    if (error) {
      log("error", `Failed to check task chain status: ${error.message}`);
      return false;
    }

    return data && data.length > 0;
  } catch (error) {
    log("error", `Failed to check task chain status: ${error instanceof Error ? error.message : String(error)}`);
    return false;
  }
}

export async function getNextPendingStackRun() {
  const supabase = await createSupabaseClient();
  const { data, error } = await supabase
    .from('stack_runs')
    .select('id, parent_task_run_id, parent_stack_run_id, created_at')
    .eq('status', 'pending')
    .order('created_at', { ascending: true });

  if (error) {
    throw new Error(`Failed to get pending stack runs: ${error.message}`);
  }

  if (!data || data.length === 0) {
    return null;
  }

  for (const stackRun of data) {
    const { data: siblingsData, error: siblingsError } = await supabase
      .from('stack_runs')
      .select('id')
      .eq('parent_task_run_id', stackRun.parent_task_run_id)
      .eq('status', 'pending')
      .lt('created_at', stackRun.created_at);

    if (siblingsError) {
      log("error", `Failed to check pending siblings: ${siblingsError.message}`);
      continue;
    }

    const pendingSiblings = siblingsData;

    if (!pendingSiblings || pendingSiblings.length === 0) {
      return { id: stackRun.id };
    }
  }

  return null;
}

export async function cleanupStaleLocks(): Promise<void> {
  try {
    const supabase = await createSupabaseClient();
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();

    const { data: locks, error: locksError } = await supabase
      .from('task_locks')
      .delete()
      .lt('locked_at', fiveMinutesAgo)
      .select();

    if (locksError) {
      log("warn", `Error cleaning up stale locks: ${locksError.message}`);
    } else if (locks && locks.length > 0) {
      log("info", `Cleaned up ${locks.length} stale task locks older than 5 minutes`);
    }

    const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000).toISOString();
    const { data: staleRuns, error: runsError } = await supabase
      .from('stack_runs')
      .update({ status: 'failed', error: 'Processing timeout - marked as failed by auto-recovery' })
      .eq('status', 'processing')
      .lt('updated_at', twoMinutesAgo)
      .select();

    if (runsError) {
      log("warn", `Error cleaning up stale processing runs: ${runsError.message}`);
    } else if (staleRuns && staleRuns.length > 0) {
      log("info", `Cleaned up ${staleRuns.length} stale processing stack runs older than 2 minutes`);
    }
  } catch (error) {
    log("warn", `Exception during stale resource cleanup: ${error instanceof Error ? error.message : String(error)}`);
  }
}
