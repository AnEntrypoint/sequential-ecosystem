/**
 * object-snippets.js - Object manipulation snippets
 *
 * Spread, destructuring, and object patterns
 */

export const OBJECT_SNIPPETS = [
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
    code: 'const { key1, key2, ...rest } = object;'
  }
];
