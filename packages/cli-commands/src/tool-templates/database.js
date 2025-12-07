import logger from '@sequential/sequential-logging';

export function generateDatabaseToolTemplate(name, toolId, timestamp, description, category) {
  const funcName = name.replace(/-/g, '_');

  return `/**
 * Tool: ${name}
 * @description ${description || `Database tool: ${name}`}
 * @category ${category}
 * @id ${toolId}
 * @created ${timestamp}
 * @template database
 */

export const config = {
  id: '${toolId}',
  name: '${name}',
  description: '${description || `Database tool: ${name}`}',
  category: '${category}',
  created: '${timestamp}',
  parameters: {
    query: {
      type: 'string',
      description: 'SQL query or operation'
    },
    params: {
      type: 'object',
      description: 'Query parameters (optional)',
      default: {}
    }
  }
};

/**
 * Execute database query
 * @param {Object} input
 * @param {string} input.query - SQL query
 * @param {Object} input.params - Query parameters
 * @returns {Promise<Object>} Query result
 */
export async function ${funcName}(input) {
  const { query, params = {} } = input;

  try {
    // TODO: Replace with actual database client
    // Example: const db = await getDbClient();
    // const result = await db.query(query, params);

    logger.info(\`Executing query: \${query}\`);
    logger.info(\`Parameters: \${JSON.stringify(params)}\`);

    // Placeholder: Return mock result
    const result = {
      success: true,
      rows: [],
      rowCount: 0,
      query,
      params
    };

    logger.info('Query executed successfully');
    return result;

  } catch (error) {
    logger.error(\`Database error: \${error.message}\`);
    throw {
      success: false,
      error: error.message,
      query,
      params
    };
  }
}
`;
}
