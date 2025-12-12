/**
 * snippets.js - Code Snippets Facade
 *
 * Delegates to focused snippet modules:
 * - control-flow-snippets: Try-catch, if-else
 * - async-snippets: Async-await, fetch, tool calls
 * - array-snippets: Loops, map, filter, reduce
 * - object-snippets: Spread, destructuring
 * - utility-snippets: Functions, validation, errors, retry
 */

import { CONTROL_FLOW_SNIPPETS } from './control-flow-snippets.js';
import { ASYNC_SNIPPETS } from './async-snippets.js';
import { ARRAY_SNIPPETS } from './array-snippets.js';
import { OBJECT_SNIPPETS } from './object-snippets.js';
import { UTILITY_SNIPPETS } from './utility-snippets.js';

export function initSnippets() {
  return [
    ...CONTROL_FLOW_SNIPPETS,
    ...ASYNC_SNIPPETS,
    ...ARRAY_SNIPPETS,
    ...OBJECT_SNIPPETS,
    ...UTILITY_SNIPPETS
  ];
}
