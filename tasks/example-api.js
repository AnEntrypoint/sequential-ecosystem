/**
 * Task: example-api
 * @description Task: example-api
 * @id b5705543-74aa-438b-af37-4fe97b1c7686
 * @created 2025-11-11T14:29:20.880Z
 * @inputs 
 */

export const config = {
  name: 'example-api',
  description: 'Task: example-api',
  id: 'b5705543-74aa-438b-af37-4fe97b1c7686',
  created: '2025-11-11T14:29:20.880Z',
  inputs: []
};

/**
 * Main task implementation
 *   * @param {*} input - Input parameters
 * @returns {Promise<*>} Task result
 */
export async function example_api(input) {
  // Task code here
  // Use fetch() for HTTP calls - they pause automatically
  // OR use __callHostTool__() for wrapped services

  return {
    success: true,
    input
  };
}
