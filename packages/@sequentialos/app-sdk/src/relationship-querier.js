/**
 * relationship-querier.js
 *
 * Query relationships between entities
 */

export function createRelationshipQuerier(index) {
  return {
    getDependencies(entityName) {
      const entity = index.relationships.get(entityName);
      if (!entity) {
        return null;
      }

      const deps = entity.dependencies.map(function(depName) {
        const depEntity = index.relationships.get(depName);
        return {
          name: depName,
          type: depEntity ? depEntity.type : 'unknown',
          metadata: depEntity ? depEntity.metadata : {}
        };
      });

      return {
        entity: entityName,
        dependencies: deps,
        dependencyCount: deps.length
      };
    },

    getConsumers(entityName) {
      const consumers = index.dependencyGraph.get(entityName) || [];
      const consumerDetails = consumers.map(function(consumerName) {
        const consumerEntity = index.relationships.get(consumerName);
        return {
          name: consumerName,
          type: consumerEntity ? consumerEntity.type : 'unknown',
          metadata: consumerEntity ? consumerEntity.metadata : {}
        };
      });

      return {
        entity: entityName,
        consumers: consumerDetails,
        consumerCount: consumerDetails.length
      };
    },

    findByType(entityType) {
      const result = [];
      for (const entity of index.relationships.values()) {
        if (entity.type === entityType) {
          result.push({
            name: entity.name,
            dependencyCount: entity.dependencies.length,
            consumerCount: (index.dependencyGraph.get(entity.name) || []).length
          });
        }
      }
      return result;
    },

    getEntitySummary(entityName) {
      const entity = index.relationships.get(entityName);
      if (!entity) {
        return null;
      }

      const consumers = index.dependencyGraph.get(entityName) || [];

      return {
        name: entityName,
        type: entity.type,
        dependencies: entity.dependencies.length,
        consumers: consumers.length,
        metadata: entity.metadata,
        impactIfRemoved: consumers.length
      };
    }
  };
}
