/**
 * array-snippets.js - Array and functional programming snippets
 *
 * Loops, map, filter, reduce patterns
 */

export const ARRAY_SNIPPETS = [
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
    id: 'filter-map-reduce',
    label: 'Filter-Map-Reduce',
    trigger: 'reduce',
    category: 'Array',
    code: `const result = array
  .filter(item => condition)
  .map(item => transform(item))
  .reduce((acc, item) => acc + item, 0);`
  }
];
