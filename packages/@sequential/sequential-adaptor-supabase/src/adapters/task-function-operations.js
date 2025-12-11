/**
 * task-function-operations.js
 *
 * Task function storage and retrieval operations
 */

import { nowISO } from '@sequentialos/sequential-utils/timestamps';

export function createTaskFunctionOperations(admin, client) {
  return {
    async storeTaskFunction(taskFunction) {
      const { data, error } = await admin
        .from('task_functions')
        .upsert({
          identifier: taskFunction.identifier,
          code: taskFunction.code,
          metadata: taskFunction.metadata,
          updated_at: nowISO()
        }, { onConflict: 'identifier' })
        .select()
        .single();

      if (error) throw error;
      return data;
    },

    async getTaskFunction(identifier) {
      const { data, error } = await client
        .from('task_functions')
        .select('*')
        .eq('identifier', identifier)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data || null;
    }
  };
}
