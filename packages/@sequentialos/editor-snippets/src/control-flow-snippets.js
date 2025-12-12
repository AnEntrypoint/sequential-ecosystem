/**
 * control-flow-snippets.js - Control flow code snippets
 *
 * Try-catch, if-else, and other control flow patterns
 */

export const CONTROL_FLOW_SNIPPETS = [
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
  }
];
