export function createTaskSchemaRegistry() {
  const schemas = new Map();
  const typeIndex = new Map();

  return {
    registerTaskSchema(taskName, schema) {
      schemas.set(taskName, schema);

      if (schema.input) {
        for (const [paramName, paramSchema] of Object.entries(schema.input)) {
          const typeKey = paramSchema.type || 'unknown';
          if (!typeIndex.has(typeKey)) {
            typeIndex.set(typeKey, []);
          }
          typeIndex.get(typeKey).push({ task: taskName, param: paramName });
        }
      }

      return this;
    },

    getTaskSchema(taskName) {
      return schemas.get(taskName);
    },

    getTaskInputSchema(taskName) {
      const schema = schemas.get(taskName);
      return schema ? schema.input : null;
    },

    getTaskOutputSchema(taskName) {
      const schema = schemas.get(taskName);
      return schema ? schema.output : null;
    },

    findTasksByInputType(type) {
      return typeIndex.get(type) || [];
    },

    findTasksByOutputType(type) {
      const matching = [];

      for (const [taskName, schema] of schemas.entries()) {
        if (schema.output && schema.output.type === type) {
          matching.push(taskName);
        }
      }

      return matching;
    },

    validateTaskComposition(fromTask, toTask) {
      const fromSchema = this.getTaskOutputSchema(fromTask);
      const toSchema = this.getTaskInputSchema(toTask);

      if (!fromSchema || !toSchema) {
        return { compatible: null, errors: ['Missing schema information'] };
      }

      const errors = [];

      if (fromSchema.type !== 'object' || !toSchema) {
        if (fromSchema.type !== 'object') {
          errors.push(`Output of ${fromTask} is ${fromSchema.type}, not object`);
        }
      }

      const fromProps = fromSchema.properties || {};
      for (const [paramName, paramSchema] of Object.entries(toSchema)) {
        if (paramSchema.required && !fromProps[paramName]) {
          errors.push(`${toTask} requires '${paramName}' but ${fromTask} doesn't provide it`);
        }

        if (paramSchema.type && fromProps[paramName] && fromProps[paramName].type !== paramSchema.type) {
          errors.push(`Type mismatch: ${paramName} is ${fromProps[paramName].type} but ${toTask} expects ${paramSchema.type}`);
        }
      }

      return {
        compatible: errors.length === 0,
        errors,
        fromOutput: fromSchema,
        toInput: toSchema
      };
    },

    generateCompositionPath(startTask, endTask) {
      const paths = [];
      const findPaths = (current, target, path = [], visited = new Set()) => {
        if (visited.has(current)) return;
        visited.add(current);

        if (current === target) {
          paths.push([...path, current]);
          return;
        }

        const outputSchema = this.getTaskOutputSchema(current);
        if (!outputSchema) return;

        const outputType = outputSchema.type;
        const nextTasks = this.findTasksByInputType(outputType);

        for (const nextTask of nextTasks) {
          const validation = this.validateTaskComposition(current, nextTask);
          if (validation.compatible !== false) {
            findPaths(nextTask, target, [...path, current], new Set(visited));
          }
        }
      };

      findPaths(startTask, endTask);
      return paths;
    },

    getAllSchemas() {
      return Array.from(schemas.entries()).map(([name, schema]) => ({
        task: name,
        ...schema
      }));
    },

    searchTasks(query) {
      const results = [];

      for (const [taskName, schema] of schemas.entries()) {
        const nameMatch = taskName.toLowerCase().includes(query.toLowerCase());
        const descMatch = schema.description?.toLowerCase().includes(query.toLowerCase());
        const tagMatch = schema.tags?.some(tag => tag.toLowerCase().includes(query.toLowerCase()));

        if (nameMatch || descMatch || tagMatch) {
          results.push({
            name: taskName,
            description: schema.description,
            tags: schema.tags,
            inputTypes: Object.values(schema.input || {}).map(p => p.type),
            outputType: schema.output?.type
          });
        }
      }

      return results;
    },

    generateAPIDocumentation(taskName) {
      const schema = this.getTaskSchema(taskName);
      if (!schema) return null;

      return {
        task: taskName,
        description: schema.description,
        method: 'POST',
        url: `/api/tasks/${taskName}/run`,
        requestBody: {
          type: 'object',
          properties: schema.input || {},
          required: Object.entries(schema.input || {})
            .filter(([_, param]) => param.required)
            .map(([name]) => name)
        },
        response: {
          type: schema.output?.type || 'object',
          description: schema.output?.description || 'Task result',
          properties: schema.output?.properties || {}
        }
      };
    }
  };
}

export function generateTaskSchemaTemplate() {
  return `/**
 * Task Schema Registry
 *
 * Discover tasks by input/output types and validate composition.
 */

import { createTaskSchemaRegistry } from '@sequential/task-schema';

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
