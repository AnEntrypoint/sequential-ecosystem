/**
 * task-pipeline.js
 *
 * Sequential task pipeline execution with timing
 */

export function createTaskPipeline(...tasks) {
  return {
    async execute(input) {
      let current = input;
      const execution = [];

      for (const task of tasks) {
        const taskName = typeof task === 'string' ? task : task.name;
        const fn = typeof task === 'function' ? task : null;

        try {
          const start = Date.now();
          current = fn ? await fn(current) : await this.callHostTool('task', taskName, current);
          const duration = Date.now() - start;

          execution.push({
            task: taskName,
            duration,
            success: true,
            output: current
          });
        } catch (error) {
          execution.push({
            task: taskName,
            success: false,
            error: error.message
          });
          throw error;
        }
      }

      return {
        pipeline: tasks.length,
        output: current,
        execution,
        totalDuration: execution.reduce((sum, e) => sum + (e.duration || 0), 0)
      };
    }
  };
}
