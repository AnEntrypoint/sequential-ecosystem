/**
 * task-run-operations.js
 *
 * Task run CRUD and query operations
 */

export function createTaskRunOperations(admin, client) {
  return {
    async createTaskRun(taskRun) {
      const { data, error } = await admin
        .from('task_runs')
        .insert(taskRun)
        .select()
        .single();

      if (error) throw error;
      return data;
    },

    async getTaskRun(id) {
      const { data, error } = await client
        .from('task_runs')
        .select('*')
        .eq('id', id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data || null;
    },

    async updateTaskRun(id, updates) {
      const { data, error } = await admin
        .from('task_runs')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },

    async queryTaskRuns(filter) {
      let query = client.from('task_runs').select('*');

      Object.entries(filter).forEach(([key, value]) => {
        query = query.eq(key, value);
      });

      const { data, error } = await query;
      if (error) throw error;
      return data;
    }
  };
}
