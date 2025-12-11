export function createSchemaCache() {
  const schemaCache = new Map();
  const cacheTimeout = 5 * 60 * 1000;

  return {
    cacheSchema(toolName, schema) {
      schemaCache.set(toolName, {
        schema: schema,
        timestamp: Date.now()
      });
    },

    getCachedSchema(toolName) {
      const cached = schemaCache.get(toolName);
      if (!cached) return null;

      const isExpired = Date.now() - cached.timestamp > cacheTimeout;
      if (isExpired) {
        schemaCache.delete(toolName);
        return null;
      }

      return cached.schema;
    },

    getParameterSchema(toolName, allSchemas) {
      let schema = this.getCachedSchema(toolName);
      if (schema) {
        return schema;
      }

      if (allSchemas && allSchemas[toolName]) {
        schema = allSchemas[toolName];
        this.cacheSchema(toolName, schema);
        return schema;
      }

      return null;
    },

    clearCache() {
      schemaCache.clear();
    }
  };
}
