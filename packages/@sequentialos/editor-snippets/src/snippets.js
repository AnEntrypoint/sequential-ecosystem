export function initSnippets() {
  return [
    {
      id: 'try-catch',
      label: 'Try-Catch Block',
      trigger: 'try',
      category: 'Control Flow',
      code: `try {
  // Code here
} catch (error) {
  console.error('Error:', error);
  throw error;
}`
    },
    {
      id: 'if-else',
      label: 'If-Else Statement',
      trigger: 'if',
      category: 'Control Flow',
      code: `if (condition) {
  // True branch
} else {
  // False branch
}`
    },
    {
      id: 'async-await',
      label: 'Async-Await Pattern',
      trigger: 'async',
      category: 'Async',
      code: `async function myFunction(input) {
  try {
    const result = await someAsyncOperation(input);
    return { success: true, result };
  } catch (error) {
    return { success: false, error: error.message };
  }
}`
    },
    {
      id: 'fetch-json',
      label: 'Fetch JSON',
      trigger: 'fetch',
      category: 'HTTP',
      code: `const response = await fetch(url);
if (!response.ok) {
  throw new Error(\`HTTP error! status: \${response.status}\`);
}
const data = await response.json();`
    },
    {
      id: 'tool-call',
      label: '__callHostTool__ Pattern',
      trigger: 'tool',
      category: 'Tools',
      code: `const result = await __callHostTool__('appId', 'toolName', input);
if (!result.success) {
  throw new Error(result.error);
}
return result.data;`
    },
    {
      id: 'for-loop',
      label: 'For Loop',
      trigger: 'for',
      category: 'Loops',
      code: `for (let i = 0; i < array.length; i++) {
  const item = array[i];
  // Process item
}`
    },
    {
      id: 'for-of-loop',
      label: 'For-Of Loop',
      trigger: 'forof',
      category: 'Loops',
      code: `for (const item of array) {
  // Process item
}`
    },
    {
      id: 'map-filter',
      label: 'Map-Filter Pattern',
      trigger: 'map',
      category: 'Array',
      code: `const result = array
  .filter(item => condition)
  .map(item => transform(item));`
    },
    {
      id: 'object-spread',
      label: 'Object Spread Pattern',
      trigger: 'spread',
      category: 'Objects',
      code: `const newObject = {
  ...existingObject,
  newKey: 'newValue'
};`
    },
    {
      id: 'object-destructure',
      label: 'Object Destructuring',
      trigger: 'destruct',
      category: 'Objects',
      code: `const { key1, key2, ...rest } = object;`
    },
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
      id: 'filter-map-reduce',
      label: 'Filter-Map-Reduce',
      trigger: 'reduce',
      category: 'Array',
      code: `const result = array
  .filter(item => condition)
  .map(item => transform(item))
  .reduce((acc, item) => acc + item, 0);`
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
}
