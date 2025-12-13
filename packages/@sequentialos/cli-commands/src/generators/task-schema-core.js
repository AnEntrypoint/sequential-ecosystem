/**
 * Task Schema Core
 * Creates task schema registries with composition validation and search
 *
 * Delegates to:
 * - task-schema-registry: Schema registration and lookup
 * - task-schema-validator: Composition validation and pathfinding
 * - task-schema-search: Task search and API documentation
 */

import { createTaskSchemaRegistry } from './task-schema-registry.js';
import { createTaskSchemaValidator } from './task-schema-validator.js';
import { createTaskSchemaSearch } from './task-schema-search.js';

export function createTaskSchemaRegistry() {
  const registry = createTaskSchemaRegistry();
  const validator = createTaskSchemaValidator(registry);
  const search = createTaskSchemaSearch(registry);

  return {
    ...registry,
    ...validator,
    ...search
  };
}
