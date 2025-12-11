/**
 * relationship-index.js
 *
 * Core relationship indexing with bidirectional tracking
 */

export function createRelationshipIndex() {
  const relationships = new Map();
  const dependencyGraph = new Map();

  return {
    relationships,
    dependencyGraph,

    indexEntity(entityName, entityType, dependencies = [], metadata = {}) {
      const entity = {
        name: entityName,
        type: entityType,
        dependencies: dependencies,
        metadata: metadata,
        consumers: []
      };

      relationships.set(entityName, entity);

      for (const dep of dependencies) {
        if (!dependencyGraph.has(dep)) {
          dependencyGraph.set(dep, []);
        }
        const consumers = dependencyGraph.get(dep);
        if (!consumers.includes(entityName)) {
          consumers.push(entityName);
        }
      }

      return entity;
    },

    clearIndex() {
      relationships.clear();
      dependencyGraph.clear();
    }
  };
}
