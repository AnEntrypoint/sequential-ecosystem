export function composeTask(name, description, ...subtasks) {
  if (subtasks.length === 0) {
    throw new Error('At least one subtask is required');
  }

  const metadata = {
    name,
    description,
    type: 'composed',
    subtasks: subtasks.map(st => typeof st === 'string' ? st : st.name),
    createdAt: new Date().toISOString()
  };

  return {
    name,
    metadata,
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
        composed: name,
        results,
        finalResult: context
      };
    }
  };
}

export function generateComposedTaskTemplate(taskName, subtasks = []) {
  const subtaskNames = subtasks.map(st => `'${st}'`).join(', ');

  return `/**
 * ${taskName} - Composed Task
 *
 * Combines multiple tasks into a single workflow.
 * Subtasks: ${subtaskNames || 'none defined'}
 *
 * Usage:
 *   const composed = composeTask('${taskName}', 'description', task1, task2, ...);
 *   const result = await composed.execute(input);
 *
 * Result format:
 *   {
 *     success: true,
 *     composed: '${taskName}',
 *     results: [
 *       { task: 'subtask1', success: true, result: {...} },
 *       { task: 'subtask2', success: true, result: {...} }
 *     ],
 *     finalResult: {...}
 *   }
 */

import { composeTask } from '@sequentialos/task-composer';

// Define subtasks - can be functions or task names
async function validate(input) {
  if (!input || typeof input !== 'object') {
    throw new Error('Input must be an object');
  }
  return input;
}

async function process(data) {
  // TODO: Add processing logic
  return { ...data, processed: true };
}

async function persist(result) {
  // TODO: Add persistence logic
  return { ...result, persisted: true };
}

// Compose the tasks
const composed = composeTask(
  '${taskName}',
  'Multi-step workflow combining validation, processing, and persistence',
  validate,
  process,
  persist
);

export async function ${taskName.replace(/-/g, '_')}(input) {
  return await composed.execute(input);
}

// Alternative: Compose with task names (executed via __callHostTool__)
// export async function ${taskName.replace(/-/g, '_')}(input) {
//   const composed = composeTask(
//     '${taskName}',
//     'Composed task using existing tasks',
//     'task-validate',
//     'task-process',
//     'task-persist'
//   );
//   return await composed.execute(input);
// }
`;
}

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

export function validateComposition(composition) {
  const issues = [];

  if (!composition.name || typeof composition.name !== 'string') {
    issues.push('Composition must have a name (string)');
  }

  if (!composition.subtasks || composition.subtasks.length === 0) {
    issues.push('Composition must have at least one subtask');
  }

  if (composition.subtasks) {
    const seen = new Set();
    composition.subtasks.forEach((task, idx) => {
      if (typeof task !== 'string' && typeof task !== 'function') {
        issues.push(`Subtask ${idx} must be a string name or function`);
      }

      const taskName = typeof task === 'string' ? task : task.name;
      if (seen.has(taskName)) {
        issues.push(`Duplicate subtask: ${taskName}`);
      }
      seen.add(taskName);
    });
  }

  return {
    valid: issues.length === 0,
    issues
  };
}
