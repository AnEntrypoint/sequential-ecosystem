/**
 * API Documentation Core - Generation Functions Module
 * Task, tool, and flow documentation generators
 */

import { extractFunctionParams, inferReturnType, getStateTransitions, extractFlowHandlers } from './api-documentation-utils.js';

export function generateTaskDocumentation(taskName, taskFn, metadata = {}) {
  const params = extractFunctionParams(taskFn);
  const returnType = inferReturnType(taskFn);

  return {
    name: taskName,
    description: metadata.description || 'No description provided',
    version: metadata.version || '1.0.0',
    inputs: params.map(p => ({
      name: p,
      type: 'unknown',
      required: true,
      description: `Parameter ${p}`
    })),
    output: {
      type: returnType,
      description: metadata.returnDescription || 'Task result'
    },
    examples: metadata.examples || [],
    errors: metadata.errors || [],
    tags: metadata.tags || [],
    author: metadata.author,
    createdAt: new Date().toISOString()
  };
}

export function generateToolDocumentation(toolName, toolFn, metadata = {}) {
  const params = extractFunctionParams(toolFn);

  return {
    name: toolName,
    description: metadata.description || 'No description provided',
    version: metadata.version || '1.0.0',
    category: metadata.category || 'general',
    inputs: params.map(p => ({
      name: p,
      type: metadata.paramTypes?.[p] || 'unknown',
      required: metadata.required?.includes(p) || true,
      description: metadata.paramDescriptions?.[p] || `Parameter ${p}`
    })),
    output: {
      type: metadata.returnType || 'unknown',
      description: metadata.returnDescription || 'Tool result'
    },
    examples: metadata.examples || [],
    rateLimit: metadata.rateLimit,
    timeout: metadata.timeout,
    retryable: metadata.retryable !== false,
    tags: metadata.tags || [],
    createdAt: new Date().toISOString()
  };
}

export function generateFlowDocumentation(flowName, graph, metadata = {}) {
  const states = Object.keys(graph.states || {});
  const handlers = extractFlowHandlers(graph);

  return {
    name: flowName,
    description: metadata.description || 'No description provided',
    version: metadata.version || '1.0.0',
    initialState: graph.initial,
    states: states.map(state => ({
      name: state,
      type: graph.states[state].type || 'normal',
      transitions: getStateTransitions(graph, state),
      description: metadata.stateDescriptions?.[state] || `State: ${state}`
    })),
    handlers: handlers.map(h => ({
      name: h,
      description: metadata.handlerDescriptions?.[h] || `Handler for ${h}`
    })),
    examples: metadata.examples || [],
    tags: metadata.tags || [],
    createdAt: new Date().toISOString()
  };
}
