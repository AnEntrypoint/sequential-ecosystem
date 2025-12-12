/**
 * utility-snippets.js - Utility and helper snippets
 *
 * Arrow functions, validation, error handling, retry patterns
 */

export const UTILITY_SNIPPETS = [
  {
    id: 'arrow-function',
    label: 'Arrow Function',
    trigger: 'arrow',
    category: 'Functions',
    code: `const myFunction = (param) => {
  return result;
};`
  },
  {
    id: 'validator',
    label: 'Input Validation',
    trigger: 'validate',
    category: 'Validation',
    code: `if (!input || typeof input !== 'object') {
  throw new Error('Invalid input');
}
if (!input.requiredField) {
  throw new Error('requiredField is required');
}
return input;`
  },
  {
    id: 'error-handler',
    label: 'Error Handler Pattern',
    trigger: 'error',
    category: 'Error Handling',
    code: `function handleError(error) {
  console.error('Error occurred:', error);
  return {
    success: false,
    error: error.message,
    code: error.code || 'UNKNOWN_ERROR'
  };
}`
  },
  {
    id: 'retry-logic',
    label: 'Retry Pattern',
    trigger: 'retry',
    category: 'Resilience',
    code: `async function retryOperation(fn, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(r => setTimeout(r, 1000 * Math.pow(2, i)));
    }
  }
}`
  }
];
