/**
 * task-operations.js
 *
 * Task execution operations (run, list)
 */

export function createTaskOperations(baseUrl, appId) {
  return {
    async run(taskName, input) {
      const res = await fetch(`${baseUrl}/api/tasks/${taskName}/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input })
      });
      if (!res.ok) throw new Error(`Task execution failed: ${res.statusText}`);
      return await res.json();
    },

    async list() {
      const res = await fetch(`${baseUrl}/api/tasks`);
      if (!res.ok) return [];
      const data = await res.json();
      return data.tasks || [];
    }
  };
}
