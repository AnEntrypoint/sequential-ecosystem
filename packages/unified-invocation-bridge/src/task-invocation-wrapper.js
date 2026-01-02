import logger from 'sequential-logging';
import { unifiedInvocationBridge } from './index.js';

export class TaskInvocationWrapper {
  static createTaskContext(originalInput = {}) {
    return {
      ...originalInput,
      __callTask__: (name, input, opts) => unifiedInvocationBridge.callTask(name, input, opts),
      __callFlow__: (name, input, opts) => unifiedInvocationBridge.callFlow(name, input, opts),
      __callTool__: (category, toolName, input) => unifiedInvocationBridge.callTool(category, toolName, input),
      __callService__: (service, method, params) => unifiedInvocationBridge.callService(service, method, params)
    };
  }

  static wrapTaskCode(taskCode) {
    if (typeof taskCode === 'function') {
      return this._wrapFunction(taskCode);
    }

    if (typeof taskCode === 'string') {
      return this._wrapString(taskCode);
    }

    logger.error('[TaskInvocationWrapper] Invalid task code type', { type: typeof taskCode });
    throw new Error('Task code must be a function or string');
  }

  static _wrapFunction(fn) {
    return async function wrappedTask(input) {
      const context = TaskInvocationWrapper.createTaskContext(input);
      return fn.call(context, context);
    };
  }

  static _wrapString(code) {
    return async function wrappedTask(input) {
      const context = TaskInvocationWrapper.createTaskContext(input);
      const wrappedCode = `
        (async function(context) {
          with (context) {
            return await (${code})(context);
          }
        })(context)
      `;
      const fn = new Function('context', wrappedCode);
      return fn(context);
    };
  }

  static async executeWrappedTask(taskCode, input = {}) {
    try {
      const wrappedTask = this.wrapTaskCode(taskCode);
      return await wrappedTask(input);
    } catch (error) {
      logger.error('[TaskInvocationWrapper] Task execution failed', error);
      throw error;
    }
  }
}

export default TaskInvocationWrapper;
