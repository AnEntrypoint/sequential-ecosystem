/**
 * async-snippets.js - Asynchronous operation snippets
 *
 * Async-await, fetch, and tool call patterns
 */

export const ASYNC_SNIPPETS = [
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
  }
];
