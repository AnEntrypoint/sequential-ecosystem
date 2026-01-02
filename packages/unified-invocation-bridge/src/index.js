import { UnifiedExecutionService } from 'execution-service-unified';
import { __callHostTool__ } from 'tool-dispatcher';
import { taskRegistry } from 'task-registry';
import { flowRegistry } from 'flow-registry';
import { toolRegistry } from 'tool-registry';
import logger from 'sequential-logging';

export class UnifiedInvocationBridge {
  constructor() {
    this.executionService = new UnifiedExecutionService();
    this.taskRegistry = taskRegistry;
    this.flowRegistry = flowRegistry;
    this.toolRegistry = toolRegistry;
  }

  async callTask(name, input = {}, opts = {}) {
    logger.debug(`[UnifiedInvocationBridge] Calling task: ${name}`, { input });
    try {
      const result = await this.executionService.execute(name, input, {
        ...opts,
        executionType: 'task'
      });
      return result;
    } catch (error) {
      logger.error(`[UnifiedInvocationBridge] Task execution failed: ${name}`, error);
      throw error;
    }
  }

  async callFlow(name, input = {}, opts = {}) {
    logger.debug(`[UnifiedInvocationBridge] Calling flow: ${name}`, { input });
    try {
      const result = await this.executionService.execute(name, input, {
        ...opts,
        executionType: 'flow'
      });
      return result;
    } catch (error) {
      logger.error(`[UnifiedInvocationBridge] Flow execution failed: ${name}`, error);
      throw error;
    }
  }

  async callTool(category, toolName, input = {}) {
    logger.debug(`[UnifiedInvocationBridge] Calling tool: ${category}:${toolName}`, { input });
    try {
      const result = await __callHostTool__(category, toolName, input);
      return result;
    } catch (error) {
      logger.error(`[UnifiedInvocationBridge] Tool execution failed: ${category}:${toolName}`, error);
      throw error;
    }
  }

  async callService(serviceName, method, params = {}) {
    logger.debug(`[UnifiedInvocationBridge] Calling service: ${serviceName}.${method}`, { params });
    try {
      return await this._invokeService(serviceName, method, params);
    } catch (error) {
      logger.error(`[UnifiedInvocationBridge] Service call failed: ${serviceName}.${method}`, error);
      throw error;
    }
  }

  async _invokeService(serviceName, method, params) {
    const fullName = `${serviceName}:${method}`;

    if (this.toolRegistry.has(fullName)) {
      return await this.callTool(serviceName, method, params);
    }

    if (serviceName === 'tasks') {
      return await this.callTask(method, params);
    }

    if (serviceName === 'flows') {
      return await this.callFlow(method, params);
    }

    throw new Error(`Service not found: ${serviceName}`);
  }

  getAvailableTasks() {
    return Array.from(this.taskRegistry.list());
  }

  getAvailableFlows() {
    return Array.from(this.flowRegistry.list());
  }

  getAvailableTools() {
    return Array.from(this.toolRegistry.list());
  }
}

const globalBridge = new UnifiedInvocationBridge();

globalThis.__callTask__ = (name, input, opts) => globalBridge.callTask(name, input, opts);
globalThis.__callFlow__ = (name, input, opts) => globalBridge.callFlow(name, input, opts);
globalThis.__callService__ = (service, method, params) => globalBridge.callService(service, method, params);

export { globalBridge as unifiedInvocationBridge };
export default globalBridge;
