import logger from '@sequential/sequential-logging';

export function generateValidationToolTemplate(name, toolId, timestamp, description, category) {
  const funcName = name.replace(/-/g, '_');

  return `/**
 * Tool: ${name}
 * @description ${description || `Validation tool: ${name}`}
 * @category ${category}
 * @id ${toolId}
 * @created ${timestamp}
 * @template validation
 */

export const config = {
  id: '${toolId}',
  name: '${name}',
  description: '${description || `Validation tool: ${name}`}',
  category: '${category}',
  created: '${timestamp}',
  parameters: {
    data: {
      type: 'any',
      description: 'Data to validate'
    },
    schema: {
      type: 'object',
      description: 'Validation schema or rules'
    }
  }
};

/**
 * Validate data against schema or rules
 * @param {Object} input
 * @param {*} input.data - Data to validate
 * @param {Object} input.schema - Validation schema
 * @returns {Promise<Object>} Validation result
 */
export async function ${funcName}(input) {
  const { data, schema = {} } = input;

  try {
    logger.info('Validating data against schema');
    logger.info('Data:', JSON.stringify(data, null, 2));
    logger.info('Schema:', JSON.stringify(schema, null, 2));

    const errors = [];

    // TODO: Implement validation logic
    // Example patterns:
    // - Required fields: Check presence of required keys
    // - Type validation: Verify types match schema
    // - Format validation: Check email, URL, dates, etc.
    // - Custom rules: Regex patterns, value ranges, cross-field validation
    // - Conditional validation: Different rules based on values

    // Placeholder validation
    if (!data) {
      errors.push('Data is required');
    }

    const result = {
      success: errors.length === 0,
      valid: errors.length === 0,
      errors,
      data,
      schema
    };

    if (result.success) {
      logger.info('Validation passed');
    } else {
      logger.warn(\`Validation failed with \${errors.length} error(s)\`);
    }

    return result;

  } catch (error) {
    logger.error(\`Validation error: \${error.message}\`);
    throw {
      success: false,
      error: error.message,
      data,
      schema
    };
  }
}
`;
}
