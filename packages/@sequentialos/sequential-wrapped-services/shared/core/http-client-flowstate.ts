import { logger } from './logging-service.ts';
import { RequestOptions, HttpResponse, FlowStateContext } from './http-client-types.ts';

const flowStateContexts = new Map<string, FlowStateContext>();

export function isFlowStateCall(url: string): boolean {
  return url.includes('tasker-external-call') || url.startsWith('https://tasker-external-call/');
}

export async function handleFlowStateCall(
  url: string,
  options: RequestOptions,
  operationId: string
): Promise<HttpResponse> {
  const { serviceContext } = options;

  if (!serviceContext) {
    throw new Error('FlowState call requires service context');
  }

  const { serviceName, methodPath, taskRunId, stackRunId } = serviceContext;
  const fetchUrl = `https://tasker-external-call/${serviceName}/${methodPath.join('.')}`;

  logger.info(`FlowState external call intercepted: ${serviceName}.${methodPath.join('.')}`, {
    operationId,
    serviceName,
    methodPath: methodPath.join('.'),
    taskRunId,
    stackRunId
  });

  const context: FlowStateContext = {
    serviceName,
    methodPath,
    args: options.body ? [options.body] : [],
    taskRunId: taskRunId || 'unknown',
    stackRunId: stackRunId || 'unknown',
    fetchUrl
  };

  flowStateContexts.set(operationId, context);

  const flowStateResponse = {
    id: `flowstate-pause-${operationId}`,
    success: true,
    status: 200,
    statusText: 'FlowState Pause',
    data: {
      __flowStatePaused: true,
      serviceName,
      methodPath,
      args: context.args,
      taskRunId,
      stackRunId,
      fetchUrl,
      operationId
    },
    timestamp: Date.now()
  };

  return {
    success: true,
    status: 200,
    statusText: 'FlowState Pause',
    data: flowStateResponse,
    metadata: {
      duration: 0,
      retries: 0,
      serviceCall: {
        serviceName,
        methodPath: methodPath.join('.')
      }
    }
  };
}

export function getFlowStateContext(operationId: string): FlowStateContext | undefined {
  return flowStateContexts.get(operationId);
}

export function clearFlowStateContext(operationId: string): void {
  flowStateContexts.delete(operationId);
}
