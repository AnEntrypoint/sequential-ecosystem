/**
 * task-composer.js - Task Composer Facade
 *
 * Delegates to focused modules:
 * - task-executor: Execute composed tasks with context chaining
 * - task-pipeline: Sequential pipeline execution with timing
 * - composition-validator: Validate task compositions
 * - template-generator: Generate composed task templates
 */

import { createTaskExecutor } from './task-executor.js';
import { createTaskPipeline } from './task-pipeline.js';
import { validateComposition } from './composition-validator.js';
import { generateComposedTaskTemplate } from './template-generator.js';

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

  const executor = createTaskExecutor(subtasks);

  return {
    name,
    metadata,
    async execute(input) {
      const result = await executor.execute.call(this, input);
      return {
        success: result.success,
        composed: name,
        results: result.results,
        finalResult: result.finalResult
      };
    }
  };
}

// Re-export focused functions
export { generateComposedTaskTemplate, createTaskPipeline, validateComposition };
