/**
 * stack-run-operations.js
 *
 * Stack run CRUD and query operations
 */

export function createStackRunOperations(admin, client) {
  return {
    async createStackRun(stackRun) {
      const { data, error } = await admin
        .from('stack_runs')
        .insert(stackRun)
        .select()
        .single();

      if (error) throw error;
      return data;
    },

    async getStackRun(id) {
      const { data, error } = await client
        .from('stack_runs')
        .select('*')
        .eq('id', id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data || null;
    },

    async updateStackRun(id, updates) {
      const { data, error } = await admin
        .from('stack_runs')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },

    async queryStackRuns(filter) {
      let query = client.from('stack_runs').select('*');

      Object.entries(filter).forEach(([key, value]) => {
        query = query.eq(key, value);
      });

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },

    async getPendingStackRuns() {
      const { data, error } = await client
        .from('stack_runs')
        .select('*')
        .in('status', ['pending', 'suspended_waiting_child'])
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data;
    }
  };
}
