export function createServiceFactory(container) {
  const cache = {};

  return {
    getTaskRepository: () => cache.taskRepo ||= container.resolve('TaskRepository'),
    getFlowRepository: () => cache.flowRepo ||= container.resolve('FlowRepository'),
    getTaskService: () => cache.taskService ||= container.resolve('TaskService'),
    getStateManager: () => cache.stateManager ||= container.resolve('StateManager'),
    getToolRepository: () => cache.toolRepo ||= container.resolve('ToolRepository'),
    getTaskScheduler: () => cache.scheduler ||= container.resolve('TaskScheduler'),
    getQueueWorkerPool: () => cache.workerPool ||= container.resolve('QueueWorkerPool'),
    getAppRegistry: () => cache.appRegistry ||= container.resolve('AppRegistry'),
    getFlowService: () => cache.flowService ||= container.resolve('FlowService'),
  };
}
