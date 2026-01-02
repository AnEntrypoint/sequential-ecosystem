import { taskRegistry } from '@sequentialos/task-registry';
import { createTaskService } from '@sequentialos/execution-service-unified';
import logger from '@sequentialos/sequential-logging';

export class FlowExecutor {
  constructor() {
    this.taskService = createTaskService();
    this.conditionCache = new Map();
  }

  async execute(flowConfig, input = {}) {
    if (!flowConfig || !flowConfig.steps) {
      throw new Error('Invalid flow config: missing steps');
    }

    const results = {
      success: true,
      flowName: flowConfig.name,
      steps: [],
      outputs: {},
      errors: []
    };

    let currentData = input;

    for (const step of flowConfig.steps) {
      try {
        const result = await this._executeStep(step, currentData, results);

        if (!result.success) {
          results.success = false;
          results.errors.push({
            stepId: step.id,
            error: result.error
          });
          break;
        }

        results.steps.push({
          id: step.id,
          type: step.type,
          name: step.name,
          result: result.data
        });

        results.outputs[step.id] = result.data;
        currentData = result.data;

      } catch (err) {
        results.success = false;
        results.errors.push({
          stepId: step.id,
          error: err.message
        });
        logger.error(`[FlowExecutor] Step ${step.id} failed:`, err);
        break;
      }
    }

    return results;
  }

  async _executeStep(step, input, flowResults) {
    if (step.type === 'task') {
      const task = taskRegistry.get(step.name);

      if (!task) {
        return {
          success: false,
          error: `Task not found: ${step.name}`
        };
      }

      try {
        const result = await task.handler(input);
        return {
          success: true,
          data: result
        };
      } catch (err) {
        return {
          success: false,
          error: err.message
        };
      }
    }

    if (step.type === 'if') {
      const condition = step.condition;
      const shouldExecute = this._evaluateCondition(condition, input);

      if (shouldExecute && step.then) {
        return this.execute(step.then, input);
      }

      if (!shouldExecute && step.else) {
        return this.execute(step.else, input);
      }

      return { success: true, data: input };
    }

    if (step.type === 'parallel') {
      const parallelResults = await Promise.all(
        step.tasks.map(task => this._executeStep(task, input, flowResults))
      );

      const allSuccess = parallelResults.every(r => r.success);
      return {
        success: allSuccess,
        data: allSuccess ? parallelResults.map(r => r.data) : null,
        error: !allSuccess ? parallelResults.find(r => !r.success)?.error : null
      };
    }

    return {
      success: false,
      error: `Unknown step type: ${step.type}`
    };
  }

  _evaluateCondition(condition, data) {
    if (typeof condition === 'string') {
      try {
        let conditionFn = this.conditionCache.get(condition);
        if (!conditionFn) {
          conditionFn = new Function('data', `return ${condition}`);
          this.conditionCache.set(condition, conditionFn);
        }
        return conditionFn(data);
      } catch (err) {
        logger.error('[FlowExecutor] Condition evaluation failed:', err);
        return false;
      }
    }
    return Boolean(condition);
  }
}

export async function executeFlow(flowConfig, input = {}) {
  const executor = new FlowExecutor();
  return executor.execute(flowConfig, input);
}
