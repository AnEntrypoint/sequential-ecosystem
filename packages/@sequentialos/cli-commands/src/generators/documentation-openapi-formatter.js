/**
 * Documentation OpenAPI Formatter
 * Generates OpenAPI specifications from documentation objects
 */

export function createOpenAPIFormatter() {
  return {
    format(doc) {
      if (!doc) return null;

      const properties = {};
      for (const input of doc.inputs || []) {
        properties[input.name] = {
          type: input.type,
          description: input.description
        };
      }

      return {
        name: doc.name,
        description: doc.description,
        requestBody: {
          type: 'object',
          properties
        },
        responses: {
          '200': {
            description: 'Success',
            schema: {
              type: doc.output?.type || 'object'
            }
          }
        }
      };
    }
  };
}
