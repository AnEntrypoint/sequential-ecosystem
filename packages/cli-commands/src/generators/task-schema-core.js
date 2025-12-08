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
