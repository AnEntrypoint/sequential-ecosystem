/**
 * Task Schema Validator
 * Validates task composition and finds composition paths
 */

export function createTaskSchemaValidator(registry) {
  return {
    validateTaskComposition(fromTask, toTask) {
      const fromSchema = registry.getTaskOutputSchema(fromTask);
      const toSchema = registry.getTaskInputSchema(toTask);

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

        const outputSchema = registry.getTaskOutputSchema(current);
        if (!outputSchema) return;

        const outputType = outputSchema.type;
        const nextTasks = registry.findTasksByInputType(outputType);

        for (const nextTask of nextTasks) {
          const validation = this.validateTaskComposition(current, nextTask);
          if (validation.compatible !== false) {
            findPaths(nextTask, target, [...path, current], new Set(visited));
          }
        }
      };

      findPaths(startTask, endTask);
      return paths;
    }
  };
}
