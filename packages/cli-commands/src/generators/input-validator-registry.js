/**
 * Input Validator Registry
 * Schema registration and retrieval for input validation
 */

export function createValidatorRegistry() {
  const schemas = new Map();

  return {
    register(taskName, schema) {
      schemas.set(taskName, schema);
      return this;
    },

    get(taskName) {
      return schemas.get(taskName);
    },

    getFields(taskName) {
      const schema = schemas.get(taskName);
      return schema ? (schema.inputs || []) : [];
    },

    has(taskName) {
      return schemas.has(taskName);
    },

    getAllSchemas() {
      const all = [];
      for (const [taskName, schema] of schemas.entries()) {
        all.push({ taskName, schema });
      }
      return all;
    }
  };
}
