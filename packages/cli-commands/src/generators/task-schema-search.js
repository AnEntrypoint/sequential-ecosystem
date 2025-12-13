/**
 * Task Schema Search
 * Searches tasks by query and generates API documentation
 */

export function createTaskSchemaSearch(registry) {
  return {
    searchTasks(query) {
      const results = [];
      const schemas = registry._getSchemas();

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
      const schema = registry.getTaskSchema(taskName);
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
