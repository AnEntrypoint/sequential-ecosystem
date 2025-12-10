export function generateTaskSchemaTemplate() {
  return `/**
 * Task Schema Registry
 *
 * Discover tasks by input/output types and validate composition.
 */

import { createTaskSchemaRegistry } from '@sequentialos/task-schema';

const registry = createTaskSchemaRegistry();

// Register task schemas
registry.registerTaskSchema('fetchUser', {
  description: 'Fetch user from API',
  input: {
    userId: { type: 'number', required: true, description: 'User ID' }
  },
  output: {
    type: 'object',
    description: 'User object',
    properties: {
      id: { type: 'number' },
      name: { type: 'string' },
      email: { type: 'string' }
    }
  },
  tags: ['api', 'user']
});

registry.registerTaskSchema('validateUser', {
  description: 'Validate user data',
  input: {
    user: { type: 'object', required: true, description: 'User object' }
  },
  output: {
    type: 'boolean',
    description: 'Validation result'
  },
  tags: ['validation', 'user']
});

registry.registerTaskSchema('sendEmail', {
  description: 'Send email notification',
  input: {
    email: { type: 'string', required: true, description: 'Email address' },
    subject: { type: 'string', required: true },
    body: { type: 'string', required: true }
  },
  output: {
    type: 'object',
    description: 'Email result'
  },
  tags: ['email', 'notification']
});

// Get task schema
export function getTaskSchema(taskName) {
  return registry.getTaskSchema(taskName);
}

// Find tasks by input type
export function findTasksWithInputType(type) {
  return registry.findTasksByInputType(type);
}

// Find tasks by output type
export function findTasksWithOutputType(type) {
  return registry.findTasksByOutputType(type);
}

// Validate task composition
export function canCompose(fromTask, toTask) {
  const validation = registry.validateTaskComposition(fromTask, toTask);
  console.log('Composition validation:', validation);
  return validation.compatible;
}

// Find composition path
export function findCompositionPath(startTask, endTask) {
  const paths = registry.generateCompositionPath(startTask, endTask);
  console.log('Composition paths:', paths);
  return paths;
}

// Search tasks
export function searchTasks(query) {
  return registry.searchTasks(query);
}

// Example: Find all user-related tasks
export function findUserTasks() {
  return registry.searchTasks('user');
}

// Example: Find tasks that output objects
export function findObjectOutputTasks() {
  return registry.findTasksByOutputType('object');
}

// Get API documentation
export function getAPIDocumentation(taskName) {
  return registry.generateAPIDocumentation(taskName);
}

// Example: Get all schemas
export function getAllTaskSchemas() {
  return registry.getAllSchemas();
}
`;
}
