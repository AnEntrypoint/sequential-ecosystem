import { UnifiedExecutionService } from './unified-service.js';

export function createTaskService(options = {}) {
  return new UnifiedExecutionService('task', options);
}

export function createFlowService(options = {}) {
  return new UnifiedExecutionService('flow', options);
}

export function createToolService(options = {}) {
  return new UnifiedExecutionService('tool', options);
}

export function createExecutionService(type, options = {}) {
  return new UnifiedExecutionService(type, options);
}
