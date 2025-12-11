/**
 * template-generator.js
 *
 * Generate composed task templates with documentation
 */

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
