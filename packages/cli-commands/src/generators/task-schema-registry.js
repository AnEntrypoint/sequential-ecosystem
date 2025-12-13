/**
 * Task Schema Registry
 * Manages task schema registration, lookup, and type indexing
 */

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

    getAllSchemas() {
      return Array.from(schemas.entries()).map(([name, schema]) => ({
        task: name,
        ...schema
      }));
    },

    _getSchemas() {
      return schemas;
    }
  };
}
