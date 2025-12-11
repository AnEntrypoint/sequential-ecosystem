import { createServiceFactory } from '@sequentialos/service-factory';
import { FlowMetricsCollector } from './flow-analytics.js';
import { FlowStateTransitionValidator, createFlowStateValidator } from './flow-state-transitions.js';
import { FlowHandlers } from './flow-handlers.js';
import { registerFlowApiRoutes } from './flow-routes.js';

export function registerFlowRoutes(app, container) {
  const { getFlowRepository, getTaskRepository, getTaskService } = createServiceFactory(container);
  const repository = getFlowRepository();
  const taskRepository = getTaskRepository();
  const taskService = getTaskService();

  const metricsCollector = new FlowMetricsCollector();
  const stateValidator = createFlowStateValidator();
  const flowHandlers = new FlowHandlers(repository, taskRepository, taskService);

  registerFlowApiRoutes(app, repository, metricsCollector, stateValidator, flowHandlers);
}
