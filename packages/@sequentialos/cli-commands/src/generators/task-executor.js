/**
 * task-executor.js
 *
 * Execute composed tasks with context chaining
 */

export function createTaskExecutor(subtasks) {
  return {
    async execute(input) {
      const results = [];
      let context = input;

      for (const subtask of subtasks) {
        const subtaskName = typeof subtask === 'string' ? subtask : subtask.name;
        const subtaskFn = typeof subtask === 'function' ? subtask : null;

        try {
          let result;
          if (subtaskFn) {
            result = await subtaskFn(context);
          } else {
            result = await this.callHostTool('task', subtaskName, context);
          }

          results.push({ task: subtaskName, success: true, result });
          context = result;
        } catch (error) {
          results.push({ task: subtaskName, success: false, error: error.message });
          throw error;
        }
      }

      return {
        success: true,
        results,
        finalResult: context
      };
    }
  };
}
